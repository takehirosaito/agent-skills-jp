# agent-skills.jp

日本初の Agent Skills ディレクトリサイト。Anthropic Claude、OpenAI Codex / ChatGPT、Google Gemini、OpenCode などの SKILL.md 形式に準拠したスキルを世界中から収集し、日本語で検索可能にする。

## 構成

```
agent-skills-jp/
├── apps/web/                 Next.js 15 (App Router) + Tailwind + shadcn/ui
├── packages/
│   ├── pipeline/             Python データパイプライン (01〜07)
│   └── shared/               共通型定義
├── infra/meilisearch/        Meilisearch docker-compose
├── data/                     パイプライン出力 (gitignore)
├── scripts/                  補助スクリプト・元データ断片
├── Makefile                  主要オペレーション
├── requirements.txt          Python 依存
├── .env.example              環境変数サンプル
└── SPEC.md                   詳細仕様書
```

## クイックスタート

```bash
# 1. 環境変数を埋める
cp .env.example .env
$EDITOR .env

# 2. Python 依存をインストール
make setup

# 3. パイプライン実行
make collect         # SKILL.md を収集 (Phase A: clone)
make pipeline        # parse → dedup → score → categorize
make translate       # 日本語翻訳 (Anthropic Batch API)

# 4. Meilisearch 起動 & 投入
make meili-up
make index

# 5. フロントエンド起動
make web-install
make web-dev
# http://localhost:3000
```

詳細は [SPEC.md](./SPEC.md) を参照。
