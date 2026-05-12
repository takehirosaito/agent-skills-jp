# agent-skills.jp デプロイ手順

このドキュメントは MVP の本番デプロイ手順を、最短経路でまとめたものです。
所要時間: **約 30〜60 分**(初回)。費用: **月 $5〜10** 程度。

## 構成

```
[Browser] ── HTTPS ──> Vercel (Next.js)
                          └── HTTP ──> Hetzner VPS (Meilisearch:7700)
                                          $5/月 / 2GB RAM / Ubuntu
```

DNS は **Cloudflare** で `agent-skills.jp` を Vercel に向け、`meili.agent-skills.jp`(任意)を Hetzner VPS に向けます。

---

## 1. Meilisearch を Hetzner VPS にデプロイ

### 1.1 VPS の作成

1. https://www.hetzner.com/cloud で CX11 (€4.51/月 ≒ $5) を作成
2. OS: Ubuntu 24.04
3. SSH キーを登録、ログイン確認

### 1.2 Meilisearch 起動 (Docker)

```bash
ssh root@<vps-ip>

# Docker インストール
curl -fsSL https://get.docker.com | sh

# プロジェクト配置
mkdir -p /opt/meili && cd /opt/meili

# .env を作る
cat > .env <<EOF
MEILI_MASTER_KEY=$(openssl rand -hex 32)
EOF

# docker-compose.yml を転送 (ローカルから)
# scp infra/meilisearch/docker-compose.yml root@<vps-ip>:/opt/meili/

# 起動
docker compose up -d
docker compose logs -f
```

### 1.3 リバースプロキシ (HTTPS + 認証)

Caddy で HTTPS 終端と Basic 認証を追加します。

```bash
# Caddy インストール
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# Caddyfile
cat > /etc/caddy/Caddyfile <<EOF
meili.agent-skills.jp {
  reverse_proxy localhost:7700
}
EOF
systemctl restart caddy
```

### 1.4 データ投入

ローカルの `data/translated_skills.jsonl` を投入します。

```bash
# 環境変数を本番 URL に切り替え
export MEILI_URL=https://meili.agent-skills.jp
export MEILI_MASTER_KEY=<vps の master key>
make index
```

### 1.5 検索専用 API キーの取得

```bash
curl -s -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  https://meili.agent-skills.jp/keys | jq '.results[] | select(.name=="Default Search API Key") | .key'
```

このキーを Vercel 環境変数 `NEXT_PUBLIC_MEILI_SEARCH_KEY` に登録。

---

## 2. Cloudflare DNS 設定

1. https://dash.cloudflare.com で `agent-skills.jp` を追加
2. ネームサーバーを Cloudflare のものに変更(レジストラ側で操作)
3. DNS レコードを追加:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| `A` | `meili` | <Hetzner VPS IP> | DNS only(Caddy が HTTPS する) |
| `CNAME` | `@` | `cname.vercel-dns.com` | Proxied |
| `CNAME` | `www` | `cname.vercel-dns.com` | Proxied |

---

## 3. Vercel にフロントをデプロイ

### 3.1 Vercel プロジェクト作成

```bash
cd apps/web
npm i -g vercel
vercel login
vercel link
```

### 3.2 環境変数を Vercel に追加

```bash
vercel env add NEXT_PUBLIC_MEILI_HOST production
# 値: https://meili.agent-skills.jp

vercel env add NEXT_PUBLIC_MEILI_SEARCH_KEY production
# 値: 上で取得した Search API Key
```

### 3.3 デプロイ

```bash
vercel --prod
```

完了後、Vercel のダッシュボードでカスタムドメイン `agent-skills.jp` を割り当て。

---

## 4. GitHub Actions で日次更新 (オプション)

`.github/workflows/daily-update.yml`:

```yaml
name: Daily Skill Pipeline
on:
  schedule:
    - cron: "0 18 * * *"  # JST 03:00
  workflow_dispatch:

jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt
      - run: |
          cd packages/pipeline
          python 01_collect_skills.py --phase b --resume
          python 02_parse.py
          python 03_dedup.py
          python 04_score.py
          python 05_categorize.py
          python 06_translate.py     # 増分翻訳
          python 07_index.py
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          MEILI_URL: https://meili.agent-skills.jp
          MEILI_MASTER_KEY: ${{ secrets.MEILI_MASTER_KEY }}
```

---

## 5. 動作確認チェックリスト

- [ ] `https://agent-skills.jp/` がトップを返す(200、HTTPS)
- [ ] 検索バーで「PDF」と入れて結果が出る
- [ ] `/skill/<slug>` が個別ページを返す
- [ ] `/sitemap.xml`、`/robots.txt` が返る
- [ ] OGP 画像が `https://agent-skills.jp/opengraph-image` で生成される
- [ ] Meilisearch の `/health` が `{"status":"available"}` を返す

---

## トラブル

- **CORS エラー**: Vercel から Meilisearch を叩く際、Search Key を `NEXT_PUBLIC_` プレフィックスで公開すれば OK
- **DNS が伝播しない**: Cloudflare の Proxy が ON だと Vercel のドメイン認証が失敗する場合あり。一時的に "DNS only" に変更
- **Search Key が無効**: `/keys` で取得した Default Search API Key を使う(Master Key は使わない)
