# Agent Skills by ALSEL

AI 時代のスキル大全。世界中の Agent Skills (SKILL.md) を収集し、日本語で検索・比較できる専門データベース。

- 本番サイト: https://agent-skills.jp
- 運営: 株式会社 ALSEL
- 連絡先: info@alsel.co.jp

---

## 🔍 Claude Code / Codex / Gemini CLI に「find-skills」を入れる

agent-skills.jp の検索 API を使って、**日本語で Agent Skills を発見できる**スキルを提供しています。

### Claude Code

```bash
curl -L https://agent-skills.jp/api/skill/find-skills/zip -o /tmp/find-skills.zip \
  && unzip -o /tmp/find-skills.zip -d ~/.claude/skills/
```

### Codex

```bash
curl -L https://agent-skills.jp/api/skill/find-skills/zip -o /tmp/find-skills.zip \
  && unzip -o /tmp/find-skills.zip -d ~/.agents/skills/
```

### Gemini CLI

```bash
curl -L https://agent-skills.jp/api/skill/find-skills/zip -o /tmp/find-skills.zip \
  && unzip -o /tmp/find-skills.zip -d ~/.gemini/skills/
```

インストール後、Claude Code / Codex / Gemini で日本語で頼むだけ:

> 「楽天SEO のスキル探して」
>
> 「PDF を処理したい」
>
> 「データ分析を自動化できるスキルある?」

裏で `agent-skills.jp` の検索 API が叩かれ、最適なスキルが推薦されます。

詳細: https://agent-skills.jp/find-skills

---

## 構成

```
agent-skills-jp/
├── apps/web/                 Next.js 16 (App Router) + Tailwind v4
├── packages/
│   └── pipeline/             Python データパイプライン (01〜10)
├── infra/meilisearch/        Meilisearch docker-compose
├── data/                     パイプライン出力 (gitignore)
├── skills/                   ALSEL 同梱スキル
│   └── find-skills/          AI エージェント用「スキル発見」スキル
├── deploy/                   本番デプロイ手順書 (Railway + Vercel)
├── docs/                     プレス・コスト見積もり
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
make translate       # description を日本語訳 (Anthropic Batch)
# 本文翻訳 (オプション):
.venv/bin/python packages/pipeline/08_translate_body.py
# ALSEL 独自スキル + find-skills 登録:
.venv/bin/python packages/pipeline/09_alsel_originals.py
.venv/bin/python packages/pipeline/10_register_find_skills.py

# 4. Meilisearch 起動 & 投入
make meili-up
make index

# 5. フロントエンド起動
make web-install
make web-dev
# http://localhost:3000
```

## 検索 API

外部から利用可能な JSON API:

| Endpoint | 用途 |
|----------|------|
| `GET /api/search?q=<keyword>&limit=5` | スキルを検索(JSON) |
| `GET /api/skill/<slug>/download?lang=ja` | SKILL.md をダウンロード |
| `GET /api/skill/<slug>/zip` | SKILL.md + README.md を ZIP で配布 |

## デプロイ

本番デプロイ手順は [deploy/README.md](./deploy/README.md) を参照。Railway (Meilisearch) + Vercel (Next.js) + Cloudflare DNS で約 60 分。

## ライセンス

- 本リポジトリのコード: MIT
- 同梱スキル (`skills/find-skills/`): MIT
- 各 Agent Skill の著作権は原作者に帰属。本サイトはオープンソース SKILL.md をインデックス化したものです。

詳細仕様: [SPEC.md](./SPEC.md)
