---
name: find-skills
description: agent-skills.jp の検索APIを使って、日本語の意図から Agent Skills を発見する。「楽天SEOのスキル探して」「PDFを処理したい」「データ分析を自動化したい」などの日本語リクエストに対応。Claude、Codex、Gemini CLI のいずれでも使える。日本最大の Agent Skills データベース「Agent Skills by ALSEL」(約7,000件、全件日本語化)から、ユーザーの意図に合うスキルを推薦・インストール案内する。
license: MIT
metadata:
  author: 株式会社ALSEL
  homepage: https://agent-skills.jp/find-skills
  source: https://agent-skills.jp
---

# find-skills - Agent Skills by ALSEL 検索

このスキルは、ユーザーが「○○のスキル探して」「○○できるスキルある?」と日本語で頼んだ時に、Agent Skills by ALSEL (https://agent-skills.jp) の検索 API を使ってスキルを発見します。

## 使用場面

以下のような時に使ってください:

- 「楽天SEOに使えるスキル探して」
- 「Amazon商品ページ最適化のスキルある?」
- 「PDF処理のスキル教えて」
- 「データ分析を自動化できるスキル探して」
- 「○○できるスキルない?」
- 「Claude Code に追加したい機能がある」

## 使い方

### Step 1: ユーザーの意図を理解する

ユーザーが何をしたいかを以下に分類:

- **ドメイン**: EC、開発、データ分析、デザイン、文書作成 など
- **具体タスク**: 楽天SEO、Amazon最適化、PDF処理 など
- **対応 AI**: Claude、Codex、Gemini CLI

### Step 2: 検索 API を叩く

検索クエリを抽出して、`agent-skills.jp` の検索 API を呼び出します:

```bash
curl -s "https://agent-skills.jp/api/search?q=${キーワード}&limit=5"
```

例:

- 「楽天SEO探して」 → `q=楽天SEO`
- 「PDF処理のスキル」 → `q=PDF処理`

レスポンスは JSON 形式で、以下のフィールドを含みます:

| フィールド | 意味 |
|-----------|------|
| `slug` | スキルの ID(URL 部分) |
| `name` | スキル名 |
| `description_ja` | 日本語説明 |
| `vendor` | 対応 AI (claude / openai / gemini / opencode / generic) |
| `license` | ライセンス |
| `quality_score` | 品質スコア(0-100) |
| `repo_url` | 原本リポジトリ |
| `is_original` | ALSEL 独自スキルかどうか(true なら金バッジ) |

### Step 3: 結果をユーザーに提示

検索結果から品質スコアが高い順に 3〜5 件を選んで提示します。

**提示する内容:**

- スキル名と日本語説明
- 品質スコア
- 対応 AI(Claude / Codex / Gemini)
- ライセンス
- ALSEL 独自スキルなら **【ALSEL独自】** マーク

### Step 4: インストール手順を提示

ユーザーがスキルを選んだら、インストール方法を案内します:

```bash
# Claude Code に追加
mkdir -p ~/.claude/skills/${slug}
curl -L https://agent-skills.jp/api/skill/${slug}/download \
  -o ~/.claude/skills/${slug}/SKILL.md

# Codex に追加
mkdir -p ~/.agents/skills/${slug}
curl -L https://agent-skills.jp/api/skill/${slug}/download \
  -o ~/.agents/skills/${slug}/SKILL.md

# Gemini CLI に追加
mkdir -p ~/.gemini/skills/${slug}
curl -L https://agent-skills.jp/api/skill/${slug}/download \
  -o ~/.gemini/skills/${slug}/SKILL.md
```

または、サイトで詳細を見る:

```
https://agent-skills.jp/skill/${slug}
```

## ライセンス確認

- **寛容ライセンス** (MIT、Apache、BSD、ISC、CC0 等) のスキルは自由に利用可能。
- **不寛容ライセンス** (AGPL、GPL、NOASSERTION 等) のスキルは、原本リポジトリでライセンス条件を確認してから利用してください。

レスポンスに `license` フィールドがあるので、ユーザーに必ず明示してください。

## ALSEL 独自スキル

`is_original: true` のスキルは、株式会社 ALSEL 代表 齋藤竹紘氏が開発したオリジナルスキル。日本の EC 事業者向けに最適化されており、品質スコア 100。これらが最優先で表示されます。

## 検索が失敗した時

検索結果が 0 件の場合:

1. キーワードを変えて再検索を提案
2. カテゴリ別ブラウズを提案: `https://agent-skills.jp/directory`
3. 「もしこのタスクに該当するスキルがなければ、Claude Code 自身で対応します」と伝える

## 提供元

- **Agent Skills by ALSEL**: https://agent-skills.jp
- 運営: 株式会社 ALSEL
- 日本最大の Agent Skills データベース、全件日本語化済み
