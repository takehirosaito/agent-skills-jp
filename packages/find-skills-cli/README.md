# alsel-find-skills

日本語の意図から **Agent Skills** を発見する CLI。

[Agent Skills by ALSEL](https://agent-skills.jp/) の **10,000 件超** の Agent Skills インデックスを内蔵(うち **7,000 件超は寛容ライセンスで全文ダウンロード可**)し、Claude Code / Codex / Gemini CLI / claude.ai (Web) いずれのエージェント環境からでも `npx alsel-find-skills <query>` でフル検索できる。

## なぜ npm パッケージなのか

claude.ai サンドボックスは外部 HTTP の大半 (raw.githubusercontent.com, cdn.jsdelivr.net 等) を allowlist 外として遮断します。一方 **npm registry は allowlist 内** なので `npx alsel-find-skills ...` は claude.ai でも問題なく動作します。

## 使い方

```bash
# 基本
npx alsel-find-skills 楽天SEO

# トークン明示 (空白区切り、AND 検索)
npx alsel-find-skills 楽天 SEO

# カテゴリで絞り込み
npx alsel-find-skills エージェント --category=ai-development

# 上位 10 件、JSON で取得
npx alsel-find-skills PDF 処理 --limit=10 --json
```

検索ロジックは AND マッチ + ALSEL 独自スキルを先頭ピン + 品質スコア降順。

## オプション

| オプション | 意味 |
|---|---|
| `--category=<slug>` | `ai-development` / `development` / `data-analysis` / `devops` / `security` / `ecommerce-marketing` / `design-creative` / `media-audio` / `business` / `productivity` / `documentation` / `education` / `misc` |
| `--limit=<n>` | 上位 n 件まで (デフォルト 5) |
| `--json` | 機械可読の JSON 配列で出力 |
| `-h`, `--help` | ヘルプ |

## データ

`skills-index.json` に **10,000 件超** のスキルメタデータを内蔵 (約 7.5 MB)。データは [Agent Skills by ALSEL](https://agent-skills.jp) の本番 Meilisearch から日次で更新され、GitHub Actions で patch バージョンを自動 publish。

各スキルのフィールド:

| フィールド | 意味 |
|---|---|
| `slug` | スキル ID (URL 部分) |
| `name` | スキル名 |
| `desc` | 日本語説明 (300 字に圧縮) |
| `category` | カテゴリ |
| `vendor` | 対応 AI |
| `quality` | 品質スコア 0-100 |
| `license` | ライセンス |
| `alsel` | true なら ALSEL 独自スキル |
| `url` | サイトの詳細ページ URL |
| `repo` | 原本リポジトリ URL |

## 開発・publish 手順 (メンテナー向け)

```bash
# 1. インデックスを最新化 (パイプライン側)
cd <repo-root>
set -a && . ./.env && set +a
MEILI_URL="$PROD_MEILI_HOST" MEILI_MASTER_KEY="$PROD_MEILI_MASTER_KEY" \
  ./.venv/bin/python packages/pipeline/11_publish_index.py

# 2. パッケージ内にコピー (prepublishOnly でも自動実行される)
cd packages/find-skills-cli
node scripts/sync-index.js

# 3. 動作確認
node bin/cli.js 楽天SEO

# 4. バージョン bump (patch / minor / major)
npm version patch

# 5. publish
npm publish --access public
```

## ライセンス

CLI 本体: MIT (ALSEL Inc.)

各スキルメタデータの帰属はそれぞれの原作者・原本リポジトリ。`skills-index.json` の各エントリの `repo` フィールドを参照のこと。
