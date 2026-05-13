# 本番デプロイ手順 (Railway + Vercel + Cloudflare DNS)

> 所要時間: 約 **60 分**(DNS 反映待ち除く)
> 月額コスト: Meilisearch (Railway) $5〜10 + Vercel 無料 = **約 1,000〜1,500 円/月**

---

## 構成

```
[Browser] ─HTTPS─> Vercel (Next.js)
                     │
                     └─HTTPS─> Railway (Meilisearch:7700)
                                  $5/月 (512MB) または $10/月 (1GB)

DNS: agent-skills.jp ─> Vercel
```

---

## 1. Meilisearch を Railway にデプロイ

### 1.1 アカウント作成 & プロジェクト作成

1. https://railway.app にアクセスし、GitHub アカウントでログイン
2. 「New Project」→「Deploy from Docker Image」を選択
3. イメージ名に **`getmeili/meilisearch:v1.11`** を入力 → Deploy

### 1.2 環境変数を設定

Railway プロジェクトの「Variables」タブで以下を追加:

| Key | Value |
|-----|-------|
| `MEILI_MASTER_KEY` | ローカルの `.env` から `MEILI_MASTER_KEY` をコピー |
| `MEILI_ENV` | `production` |
| `MEILI_NO_ANALYTICS` | `true` |
| `MEILI_HTTP_ADDR` | `0.0.0.0:7700` |
| `PORT` | `7700` |

### 1.3 ボリュームを追加(データ永続化)

1. プロジェクトの「Settings」→「Volumes」→ Mount Path: `/meili_data` を追加(1GB で十分)

### 1.4 公開ドメインを生成

1. 「Settings」→「Networking」→「Generate Domain」をクリック
2. 例: `agent-skills-meili-production.up.railway.app` のような URL が発行される
3. これを後で Vercel の `NEXT_PUBLIC_MEILI_HOST` に設定

### 1.5 ローカルから本番にデータ転送

ローカルで `data/translated_body_skills.jsonl` を作成済みのはず。これを本番に流し込む。

```bash
cd /Users/takehirosaito/agent-skills.jp/agent-skills-jp
export MEILI_URL=https://agent-skills-meili-production.up.railway.app
export MEILI_MASTER_KEY=<Railway の Variables からコピー>

# ヘルスチェック
curl $MEILI_URL/health

# 投入
make index    # = python packages/pipeline/07_index.py
```

投入完了後、検索 API キーを取得:

```bash
curl -s -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  $MEILI_URL/keys \
  | python3 -c "import sys,json; d=json.load(sys.stdin); [print(k['key']) for k in d['results'] if k.get('name')=='Default Search API Key']"
```

このキーを Vercel の `NEXT_PUBLIC_MEILI_SEARCH_KEY` に設定する。

---

## 2. GitHub リポジトリ作成

```bash
# 既にローカルでコミット済み
cd /Users/takehirosaito/agent-skills.jp/agent-skills-jp

# GitHub で New Repository: agent-skills-jp (Public, 説明: "AI時代のスキル大全")
# README は追加せず、空のまま作成

git remote add origin https://github.com/<your-username>/agent-skills-jp.git
git push -u origin main
```

> ⚠️ `.env` は `.gitignore` 済みなので秘密情報は push されません。確認: `git ls-files | grep -i env` → `.env.example` のみ。

---

## 3. Vercel にフロントエンドをデプロイ

### 3.1 プロジェクト作成

1. https://vercel.com にアクセス → GitHub でログイン
2. 「Add New...」→「Project」→ `agent-skills-jp` リポジトリを Import
3. **Root Directory** を `apps/web` に設定(モノレポ構成のため)
4. Framework Preset は自動で「Next.js」になる

### 3.2 環境変数を設定

「Environment Variables」セクションで以下を追加:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_MEILI_HOST` | Railway の公開 URL(例: `https://agent-skills-meili-production.up.railway.app`) |
| `NEXT_PUBLIC_MEILI_SEARCH_KEY` | 上記 1.5 で取得した Default Search API Key |

### 3.3 デプロイ

「Deploy」ボタンをクリック。2〜3 分でビルド完了。
`*.vercel.app` ドメインで動作確認。

---

## 4. ドメイン接続 (agent-skills.jp)

### 4.1 Vercel 側

1. Vercel プロジェクトの「Settings」→「Domains」
2. 「Add」→ `agent-skills.jp` と `www.agent-skills.jp` を追加
3. Vercel が表示する DNS レコード(A レコードまたは CNAME)をメモ
   - 多くの場合: `A @ 76.76.21.21` または `CNAME @ cname.vercel-dns.com`

### 4.2 DNS 提供元側 (Cloudflare 想定)

> Cloudflare 以外のレジストラ(お名前.com 等)でも同じく A レコード設定です。

1. Cloudflare にログインし、`agent-skills.jp` を選択(未登録なら追加)
2. DNS 管理画面で:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| `A` | `@` | `76.76.21.21` (Vercel の指示通り) | DNS only(オレンジ雲を OFF) |
| `CNAME` | `www` | `cname.vercel-dns.com` | DNS only |

> ⚠️ Cloudflare の Proxy(オレンジ雲)を ON にすると、Vercel の SSL 検証が失敗する場合あり。最初は DNS only で。

3. 反映待ち(通常 5 分〜30 分、最大 48 時間)
4. Vercel の Domains 画面で `Valid Configuration` になれば OK

---

## 5. メール設定(連絡先・削除依頼)

以下のメールアドレスを ALSEL のドメインで受信できるように設定:

| アドレス | 用途 |
|---------|------|
| `info@alsel.co.jp` | 既存。問い合わせ・フィードバック・削除依頼の暫定窓口 |
| `takedown@alsel.co.jp` | (任意・後日)削除依頼専用窓口。設定するなら `/takedown` ページの mailto を後で書き換え |

---

## 6. 本番動作チェックリスト

公開後、以下を確認:

- [ ] `https://agent-skills.jp/` が HTTPS で表示される(リダイレクトを含めて 200)
- [ ] 検索バーで「PDF」「Claude」等を入れて結果が出る
- [ ] `/skill/listenhub` 等の MIT スキルで日本語本文が表示される
- [ ] `/skill/<NOASSERTION のスキル>` でプレビューと警告が出る
- [ ] `/about`、`/terms`、`/privacy`、`/takedown` が 200
- [ ] `/sitemap.xml` が返り、`/robots.txt` も返る
- [ ] OGP プレビュー: https://opengraph.xyz/url/https%3A%2F%2Fagent-skills.jp
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] Lighthouse スコア: 90 以上(モバイル・パフォーマンス)

---

## 7. 日次更新の自動化(後で)

`.github/workflows/daily-update.yml` で毎日 03:00 JST にパイプライン実行。
詳細は `docs/DEPLOY.md` 参照。

---

## トラブル

- **Railway の Meilisearch がデータ消失** → Volume が未設定の可能性。「Settings」→「Volumes」を確認
- **Vercel から Meilisearch を叩いて CORS エラー** → `NEXT_PUBLIC_` プレフィックスで search key を渡しているので、フロントから直接叩ける(問題なし)。エラーが出るなら URL が間違っている可能性
- **DNS が反映されない** → Cloudflare の Proxy を OFF にする / `dig agent-skills.jp` で確認
- **Search Key が無効と言われる** → Master Key を使っていないか確認。必ず Default Search API Key を使う

---

## 連絡先

- 運営: 株式会社 ALSEL
- メール: info@alsel.co.jp
