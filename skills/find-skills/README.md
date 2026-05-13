# find-skills - Agent Skills by ALSEL

Claude Code、Codex、Gemini CLI から、**日本語で Agent Skills を発見できる**スキルです。

## インストール

### Claude Code

```bash
cp -r find-skills ~/.claude/skills/
```

または `agent-skills.jp` から直接ダウンロード:

```bash
curl -L https://agent-skills.jp/api/skill/find-skills/zip -o find-skills.zip
unzip find-skills.zip -d ~/.claude/skills/
```

### Codex

```bash
cp -r find-skills ~/.agents/skills/
```

### Gemini CLI

```bash
cp -r find-skills ~/.gemini/skills/
```

## 使い方

インストール後、Claude Code / Codex / Gemini CLI で日本語で頼むだけ:

```
楽天SEOのスキル探して
PDFを処理したい
データ分析を自動化できるスキルある?
```

裏で `agent-skills.jp` の検索 API が叩かれ、最適なスキルが推薦されます。

## 提供元

- **Agent Skills by ALSEL**: https://agent-skills.jp
- 運営: 株式会社 ALSEL
- お問い合わせ: info@alsel.co.jp

## ライセンス

MIT
