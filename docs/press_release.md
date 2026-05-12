# プレスリリース原稿 (ドラフト)

> 配信予定日: 2026/05/13 朝 9:00
> 配信先: PR TIMES、Zenn、X (旧 Twitter)、各 AI ニュースメディア
> 連絡先: press@agent-skills.jp(運営: 株式会社ALSEL)

---

## タイトル(案)

**「日本初」AI エージェント用スキル横断検索サイト「Agent Skills 日本」を公開 — Claude / ChatGPT / Gemini で使える [TOTAL_COUNT] 件のスキルを日本語で検索可能に**

---

## サブタイトル(案)

GitHub 上の SKILL.md 形式のオープンスキルを世界中から収集、日本語訳と自動カテゴリ分類で「使えるスキル」を瞬時に発見

---

## リード文(150 字)

株式会社ALSEL(本社: [所在地]、代表取締役: [氏名])は、Anthropic、OpenAI、Google DeepMind 等が事実上の標準として採用する「Agent Skills」(SKILL.md 形式)を世界中から収集し、日本語で横断検索できる日本初のディレクトリサイト **「Agent Skills 日本」** (https://agent-skills.jp) を本日公開しました。

---

## 本文

### 背景: AI エージェント時代の「スキル爆発」

2025 年後半より、Anthropic Claude、OpenAI Codex / ChatGPT、Google Gemini、OpenCode などの主要 AI エージェントは、能力を拡張するモジュールを `SKILL.md` という単一の Markdown ファイルで定義する共通仕様を採用しました。これにより GitHub 上には日々膨大な数のスキルが公開されています。

しかしその大半は英語であり、日本の開発者・経営者・EC 事業者にとっては「どんなスキルがあるか」「自社業務に使えるか」を発見するハードルが高い状況でした。

### Agent Skills 日本 の特徴

1. **世界中の SKILL.md を日次収集**
   - 公式リポジトリ(anthropics/skills, openai/skills 等)を直接クローン
   - GitHub Search API で 19 種類のクエリパターンを走査
   - 計 [TOTAL_COUNT] 件のスキルを公開時点で収録

2. **AI による日本語訳と自動分類**
   - Anthropic Claude Haiku 4.5(Batch API)で description を高品質に日本語化
   - OpenAI Embedding で 12 カテゴリへ自動分類
   - 翻訳コストは 1 万件で約 1,200 円と低コスト

3. **品質スコアで「使えるスキル」を抽出**
   - GitHub stars / 最終更新日 / description 充実度 / ライセンス明示など 6 軸で 0-100 点を算出
   - 低品質・更新停止スキルを除外し「実用に耐える」だけを掲載

4. **完全無料・広告なし**
   - 全機能無料で利用可能
   - サイト内の SKILL.md 全文表示は行わず、必ず GitHub の原本へリンク
   - 各スキルにライセンス・原作者表記を明示

### ローンチ統計

| 指標 | 数値 |
|------|------|
| 収集スキル総数 | [TOTAL_COUNT] 件 |
| 対応エージェント | Claude / OpenAI / Gemini / OpenCode |
| カテゴリ数 | 12(開発、データ分析、EC、デザイン 等)|
| 日本人開発者由来 | [JP_COUNT] 件(推定)|

### コメント

> 「Agent Skills は AI 開発の基幹インフラになりつつあります。しかし日本語で発見できる場が無いことが、国内導入の障壁になっていました。本サイトが、その『最初の入口』になればと考えています。」
> — 株式会社ALSEL 代表取締役 [氏名]

### 今後の展開

- **5 月〜6 月**: ユーザー投稿フォーム本格運用、コメント・評価機能
- **6 月**: 英語版サブドメイン(en.agent-skills.jp)公開
- **7 月**: スキル開発者プロフィール、ランキング機能
- **9 月**: AI エージェント実装(質問形式でユーザー業務に合うスキルを提案)

---

## 画像素材

- ロゴ: assets/logo.svg
- OGP: https://agent-skills.jp/opengraph-image
- スクリーンショット: assets/screenshot_top.png, assets/screenshot_search.png

---

## URL

- 本サイト: https://agent-skills.jp
- About: https://agent-skills.jp/about
- ローンチレポート: https://agent-skills.jp/reports/launch
- GitHub: https://github.com/agent-skills-jp

---

## 会社概要

株式会社ALSEL
所在地: [所在地]
代表取締役: [氏名]
事業内容: AI / EC / SaaS 開発
URL: [会社サイト]

## 報道関係者お問い合わせ先

担当: [担当者名]
Email: press@agent-skills.jp
Tel: [電話番号]
