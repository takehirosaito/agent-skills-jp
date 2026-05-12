# agent-skills.jp 構築仕様書

## プロジェクト概要

日本初のAgent Skillsディレクトリサイト。Anthropic Claude、OpenAI Codex/ChatGPT、Google Gemini、OpenCodeなど、Agent Skills オープン標準(SKILL.md形式)に準拠したスキルを世界中から収集し、日本語で検索可能にする。

ドメイン: agent-skills.jp
目標公開: 構築翌日にプレス公開
目標スキル数: 1万件以上(MVP)、最終5万件規模

## 技術スタック

- フロントエンド: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- 検索: Meilisearch (Hetzner VPS $5/月、日本語 tokenizer lindera 有効)
- データ取得: Google BigQuery (github_repos public dataset)
- パイプライン: Python 3.12
- 翻訳: Anthropic API (Claude Haiku、バッチAPI使用)
- ホスティング: Vercel (フロント)、Hetzner (Meilisearch)
- DNS: Cloudflare
- リポジトリ: GitHub Private、CI/CDはGitHub Actions

## ディレクトリ構成

```
agent-skills-jp/
├── apps/
│   └── web/                      # Next.js フロントエンド
│       ├── app/
│       │   ├── page.tsx          # トップ(検索バー+注目スキル)
│       │   ├── directory/        # 全件一覧
│       │   ├── skill/[slug]/     # 個別ページ
│       │   ├── category/[name]/  # カテゴリ別
│       │   ├── search/           # 検索結果
│       │   ├── submit/           # スキル投稿
│       │   └── about/            # サイト紹介
│       ├── components/
│       │   ├── SearchBar.tsx
│       │   ├── SkillCard.tsx
│       │   ├── CategoryTile.tsx
│       │   └── InstallCommand.tsx
│       └── lib/
│           └── meilisearch.ts
├── packages/
│   ├── pipeline/                 # データパイプライン
│   │   ├── 01_bigquery_fetch.py  # BigQueryからSKILL.md取得
│   │   ├── 02_parse_yaml.py      # YAMLフロントマターパース
│   │   ├── 03_dedup.py           # 重複排除
│   │   ├── 04_score.py           # 品質スコアリング
│   │   ├── 05_categorize.py      # カテゴリ自動分類(embedding)
│   │   ├── 06_translate.py       # 日本語翻訳(Claude Haiku)
│   │   ├── 07_index.py           # Meilisearchへ投入
│   │   └── config.py
│   └── shared/
│       └── types.ts              # 共通型定義
└── infra/
    └── meilisearch/
        └── docker-compose.yml
```

## データスキーマ

各スキルの最終的なJSON構造:

```typescript
type Skill = {
  id: string;                    // UUID
  slug: string;                  // URLスラッグ(英数ハイフン)
  name: string;                  // SKILL.md frontmatterのname
  description_en: string;        // 原文description(英語または原語)
  description_ja: string;        // 日本語翻訳(Claude Haikuで生成)
  category: string;              // 自動分類カテゴリ
  tags: string[];                // 自動抽出タグ
  vendor: "claude" | "openai" | "gemini" | "opencode" | "generic";
  repo_url: string;              // GitHubリポジトリURL
  repo_path: string;             // SKILL.md のリポジトリ内パス
  raw_url: string;               // 生のSKILL.md URL
  author: string;                // GitHubユーザー名/組織名
  github_stars: number;          // 親リポジトリのスター数
  last_updated: string;          // ISO8601
  install_command: string;       // インストールコマンド(あれば)
  quality_score: number;         // 0-100の品質スコア
  language: string;              // descriptionの原語(en/ja/zh等)
  license: string | null;        // 親リポのライセンス
};
```

## 品質スコアリングロジック

100点満点で算出。基準:

- GitHub stars: 0-30点 (log10(stars+1) * 10、上限30)
- 最終更新日: 0-20点 (90日以内=20、180日=15、365日=10、それ以上=0)
- description 文字数: 0-20点 (50字未満=0、50-150=10、150-300=15、300字以上=20)
- name の妥当性: 0-10点 (英数ハイフン・適切な長さ=10)
- ライセンス明示: 0-10点 (LICENSE存在=10)
- 親リポジトリの規模: 0-10点 (10ファイル以上=10、それ以下は比例)

スコア40以下は除外候補(設定で切り替え可能)。

## カテゴリ分類

embedding(voyage-3-lite または text-embedding-3-small)で全スキルをベクトル化し、以下のアンカーカテゴリとのcosine類似度で分類:

- 開発・コーディング (development)
- データ・分析 (data-analysis)
- ドキュメント作成 (documentation)
- EC・マーケティング (ecommerce-marketing)
- デザイン・クリエイティブ (design-creative)
- DevOps・インフラ (devops)
- ビジネス・経営 (business)
- 教育・学習 (education)
- 翻訳・言語 (language)
- セキュリティ (security)
- 個人生産性 (productivity)
- その他 (misc)

## ページ仕様

### トップページ /

- ヘッダー: ロゴ "Agent Skills 日本"、メニュー(ディレクトリ/カテゴリ/投稿/About)
- ヒーロー: 大きい検索バー、「○○件のAgent Skillsから探す」
- カテゴリタイル: 12カテゴリをグリッド表示
- 注目スキル: 品質スコアTOP12をカード表示
- ベンダー別タブ: Claude / OpenAI / Gemini / OpenCode
- フッター: GitHub Issue投稿、プライバシーポリシー、運営者情報

### スキル個別ページ /skill/[slug]

- スキル名・カテゴリ・ベンダー
- 日本語description(主)+ 原文(折りたたみ)
- インストールコマンド(コピーボタン付き)
- GitHubリポジトリリンク
- SKILL.md本文プレビュー(原文、シンタックスハイライト)
- 関連スキル(同カテゴリTOP5)
- 「このスキルについて意見する」リンク(GitHub Issue起票)

### ディレクトリ /directory

- 全件一覧、ページネーション(50件/ページ)
- フィルタ: ベンダー、カテゴリ、ライセンス、最終更新日
- ソート: 品質スコア順、新着順、人気順

### 検索 /search?q=...

- Meilisearchへクエリ送信
- ファセット: ベンダー、カテゴリ、言語
- ハイライト表示

## 翻訳パイプライン詳細

Claude Haiku 4.5でバッチAPI使用。50%引き適用。

プロンプト:
```
あなたは技術翻訳の専門家です。以下のAgent Skillsの英語descriptionを、日本語のEC事業者・開発者・経営者にも分かるよう、自然な日本語に翻訳してください。

- 専門用語はカタカナで残してよい
- 「〜できる」「〜する」など能動的な表現を使う
- 長さは原文と同程度
- 余計な説明や注釈は加えない

英文: {description_en}

日本語:
```

50,000件の翻訳コスト見積:
- 入力: 5M tokens × $0.40 (Haiku、バッチ50%引き後) = $2
- 出力: 5M tokens × $2.00 = $10
- 合計: 約$12 (≒1,800円)

## Meilisearch インデックス設定

```json
{
  "searchableAttributes": [
    "name",
    "description_ja",
    "description_en",
    "tags",
    "category"
  ],
  "filterableAttributes": [
    "vendor",
    "category",
    "language",
    "license",
    "quality_score"
  ],
  "sortableAttributes": [
    "quality_score",
    "github_stars",
    "last_updated"
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "quality_score:desc",
    "exactness"
  ]
}
```

日本語tokenizerはlinderaを有効化(Meilisearch v1.5以降標準)。

## ローンチ時のページ

サイトリリース時に、以下を /reports/launch で公開:

- 収集スキル総数
- ベンダー別件数(Claude/OpenAI/Gemini/その他)
- カテゴリ別分布(円グラフ)
- 日本人開発者(GitHubユーザー名から推定)が公開したスキル一覧
- TOP100 高品質スキル

これがプレス用の「データレポート」として機能する。

## SEO設定

- 全ページに静的OGP画像生成(Next.js opengraph-image)
- スキル個別ページは ISR (revalidate 24h)
- sitemap.xml自動生成
- 構造化データ: SoftwareApplication schema
- robots.txt: 全許可

## 法的注意

- SKILL.md本文はサイト側でフルコピーしない。プレビューのみ、続きはGitHubへ
- メタデータ(name, description, リンク)は引用可能範囲
- 各スキルページに「Source: <repo_url> ライセンス: <license>」を明示
- プライバシーポリシー、特定商取引法表記(将来課金時) 作成
- DMCA対応: 削除申請フォームをfooterに用意

## 運用

- データ更新: 日次でBigQueryクロール → 差分パイプライン実行 → Meilisearch更新
- GitHub Actions cronで毎日午前3時(JST)実行
- 翻訳は新規・変更分のみ(コスト最適化)
- エラー通知: Slackウェブフック

## ローンチDay以降のロードマップ

- Day 1-7: サイト公開、プレス、Zenn、X告知
- Week 2: ユーザー投稿フォーム本格運用、コメント機能
- Month 2: 英語版サブドメイン(en.agent-skills.jp)
- Month 3: スキル開発者プロフィールページ、ランキング
- Month 6: AIエージェント実装(「あなたの業務に合うスキルは?」を質問形式で提案)

## 開発スケジュール(1日圧縮)

時間: 翌日プレス前提、丸1日でMVP完成

- 09:00-10:00: BigQueryセットアップ、SQL実行、生データ取得
- 10:00-12:00: パイプライン構築(02_parse〜04_score)
- 12:00-14:00: カテゴリ分類embedding、翻訳バッチ投入(寝てる間に終わる前提)
- 14:00-17:00: Next.js + shadcn/ui でフロント実装
- 17:00-19:00: Meilisearch セットアップ、データ投入
- 19:00-21:00: OGP、ロゴ、ローンチコピー、プレス原稿仕上げ
- 21:00: Vercelデプロイ、agent-skills.jp に向ける

翻訳の50,000件処理は数時間〜半日かかるので、午前中に投入し終わって午後は他作業と並行。
