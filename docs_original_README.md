# agent-skills.jp 構築手順書

このファイルをClaude Codeに渡し、`SPEC.md` と一緒に参照させればMVP構築できます。

## 構成ファイル一覧

| ファイル | 役割 |
|---------|------|
| `SPEC.md` | 全体仕様書(これを必ず読む) |
| `01_collect_skills.py` | SKILL.md収集(git clone + GitHub Search API) |
| `01_bigquery_fetch.sql` | 補助: BigQueryからの追加収集 |
| `02_parse.py` | YAMLフロントマターパース・正規化 |
| `03_dedup.py` | 重複排除 |
| `04_score.py` | 品質スコアリング(GitHub APIで stars/license取得) |
| `05_categorize.py` | カテゴリ自動分類(OpenAI Embedding) |
| `06_translate.py` | 日本語翻訳(Claude Haiku Batch API) |
| `07_index.py` | Meilisearchへバルク投入 |
| `docker-compose.yml` | Meilisearch起動 |
| `frontend_page.tsx` | Next.js トップページ |
| `frontend_components.tsx` | スキル個別ページ・SearchBar・SkillCard・Meilisearch client |

## 必要な環境変数

```bash
export GITHUB_TOKEN=ghp_xxx                # GitHub Personal Access Token
export OPENAI_API_KEY=sk-xxx               # Embedding用
export ANTHROPIC_API_KEY=sk-ant-xxx        # 翻訳用
export MEILI_URL=http://localhost:7700
export MEILI_MASTER_KEY=$(openssl rand -hex 32)
```

## 実行順序

### 1. データ収集 (1〜3時間)

```bash
mkdir -p /home/claude/data
python 01_collect_skills.py --phase all
```

→ `data/raw_skills.jsonl` が出来る(数千〜数万件想定)

### 2. パース・正規化 (数分)

```bash
python 02_parse.py
```

### 3. 重複排除 (数分)

```bash
python 03_dedup.py
```

### 4. 品質スコアリング (GitHub API依存、1〜3時間)

```bash
python 04_score.py
```

GitHub APIレート制限(5000req/h)があるので、件数次第で時間かかる。

### 5. カテゴリ分類 (10〜30分)

```bash
python 05_categorize.py
```

### 6. 日本語翻訳 (1〜6時間、バッチAPI使用)

```bash
python 06_translate.py
```

`USE_BATCH_API = True` ならコスト最安(50%引き)。1〜6時間で完了。

### 7. Meilisearch起動 & 投入

```bash
# Meilisearch起動
docker compose up -d

# データ投入
python 07_index.py
```

### 8. フロントエンド構築

```bash
# Next.js プロジェクト作成
npx create-next-app@latest web --typescript --tailwind --app
cd web

# 必要パッケージ
npm install meilisearch lucide-react

# shadcn/ui セットアップ
npx shadcn@latest init

# frontend_page.tsx を app/page.tsx に
# frontend_components.tsx を分割して app/skill/[slug]/page.tsx 等に配置
# (Claude Codeに分割してもらう)

# 環境変数
cat > .env.local <<EOF
NEXT_PUBLIC_MEILI_HOST=http://your-meili-server:7700
NEXT_PUBLIC_MEILI_SEARCH_KEY=your-search-key
EOF

npm run dev
```

### 9. デプロイ

```bash
# Vercel
vercel --prod
# DNS: agent-skills.jp を Vercel に向ける
```

## トラブル時

- GitHub API 403 -> token見直し、レート制限待ち
- Meilisearch起動失敗 -> docker logs agent-skills-meili
- 翻訳失敗 -> Anthropic API残高確認、Batch ステータス確認

## Claude Codeへの指示例

> このディレクトリにあるSPEC.mdとREADME.mdを読んで、agent-skills.jp のMVPを構築してください。
> まず01〜07のパイプラインを順に実行できるよう環境を整え、その後Next.jsフロントエンドを構築します。
> 不明点があれば質問してください。
