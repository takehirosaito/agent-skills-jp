---
name: shopify-blog-content-planner
description: Shopifyブログの記事企画・執筆ブリーフ・内部リンク設計・Article schema設計までを行うスキル。「ブログ企画」「Shopifyブログ」「記事ネタ」「コンテンツマーケ」「コンテンツSEO」「執筆ブリーフ」「記事構成」「見出し設計」「H2設計」「内部リンク設計」「キーワード選定」「検索意図」「Article schema」「記事のJSON-LD」など、Shopifyのブログ／お役立ち記事／読み物コンテンツの企画・構成・執筆指示書の作成リクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※公開後の効果測定・順位レポートは別スキル `shopify-ga4-search-console-report`、商品ページ本体のSEOは `shopify-product-page-seo-jp`、コレクションページのSEOは `shopify-collection-seo-builder`。
verified_at: 2026-05
---

# Shopifyブログ記事企画スキル

## 概要

Shopifyのブログ機能を使ったコンテンツSEO・お役立ち記事の **企画から執筆ブリーフ作成まで** を一括設計するスキル。

検索意図分類（Know／Do／Go／Buy）に基づき、記事タイプ（選び方ガイド／比較／HOW-TO／用語解説／レビューまとめ）を決定し、見出し構成・内部リンク先・Article schema・商品ページへの送客導線まで設計する。AIライターやCodexにそのまま渡せる執筆ブリーフ形式で出力する。

## ★最重要原則

**「検索意図 → 記事タイプ → 商品ページ送客導線」を一直線で設計する**。SEOキーワードだけで企画すると、書けても売上に繋がらない。意図ごとに送り先（商品ページ／コレクション／メール登録／別記事）を決めてから見出しを書く。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| 検索意図4分類（Know/Do/Go/Buy）と最適記事タイプ | `references/search-intent-classification.md` |
| 記事タイプ別 見出し構成テンプレ（5タイプ） | `references/article-type-templates.md` |
| 執筆ブリーフ フォーマット（Codex／ライターへ渡す形式） | `references/article-brief-format.md` |
| 内部リンク戦略（売上送客／SEO強化） | `references/internal-linking-strategy.md` |
| JSON-LD Article schema | `references/jsonld-article-schema.md` |
| ジャンル別 記事企画 実例集 | `references/examples.md` |

### Shopify Blog固有の要点

- URL構造：`/blogs/<blog-handle>/<article-handle>`
- ハンドルはローマ字推奨（日本語URLはエンコード後で長く読みにくい）
- テンプレート：`article.json` / `blog.json`（Online Store 2.0）
- メタフィールド：`article.metafields.custom.*` でカスタム属性（読了時間・タグ・関連商品参照）
- アーティクル独自のメタディスクリプション・サムネ画像が設定可能
- 関連商品の表示は `product_reference` 型 metafield を使うのが標準
- Liquid：`article.title` / `article.content` / `article.image` / `article.tags`

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- 対象キーワード／検索ボリューム（不明なら仮）
- ブランド／商品カテゴリ
- 競合上位記事の傾向
- 想定読者像（初心者／中級者）
- 公開ペース（月X本）

不足時は仮定を明示して進行。

**Step 2. 検索意図を4分類で判定**
- Know（情報収集）：用語解説・原理説明
- Do（行動方法）：HOW-TO・手順
- Go（特定サイトに行く）：ブランド指名検索→ストア内記事は不要
- Buy（購入検討）：比較・選び方ガイド・レビューまとめ

**Step 3. 記事タイプを決定**
- 選び方ガイド／比較／HOW-TO／用語解説／レビューまとめ

**Step 4. 見出し構成（H2/H3）と各セクションの送客先を決定**
- 各H2の末尾に「関連商品リンク」or「関連記事リンク」を配置

**Step 5. 執筆ブリーフを生成**
- タイトル案3つ／メタディスクリプション70-90字／H2-H3 完全構成／文字数目安／参考URL／NGワード／内部リンク先一覧／Article schema フィールド

**Step 6. 内部リンクとArticle schemaを設計**

## 代表例（1パターン）

化粧品ブランドの「敏感肌 化粧水 選び方」（検索意図 Buy）：
- 記事タイプ：選び方ガイド
- タイトル案：「敏感肌の化粧水の選び方｜避けたい成分と確認ポイント5つ」
- H2構成：①敏感肌の特徴 ②避けたい成分 ③確認したい3つの軸 ④肌タイプ別おすすめ ⑤よくある質問
- 送客先：H2-④で自社コレクション「敏感肌用化粧水」、各H2末尾で関連記事

他ジャンル（食品・ファッション・サプリ）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopifyブログ記事企画：[キーワード]

## 1. 検索意図・記事タイプ判定
- 主キーワード：
- 副キーワード（共起語）：
- 検索意図：Know / Do / Go / Buy
- 記事タイプ：選び方ガイド / 比較 / HOW-TO / 用語解説 / レビューまとめ
- 想定読者：

## 2. タイトル・メタ情報
- タイトル案A：（30-35字、主キーワード前方）
- タイトル案B：
- タイトル案C：
- メタディスクリプション：（JP 70-90字）
- URL handle（ローマ字）：
- サムネイル指定：

## 3. 見出し構成（H2/H3）
| 階層 | 見出し | 文字数目安 | 送客先（内部リンク） |
|---|---|---|---|
| H2 | 1. ○○ |  |  |
| H3 | 1-1 ○○ |  |  |
| H2 | 2. ○○ |  |  |

## 4. 執筆ブリーフ（ライター／Codex 渡し用）
- 全体文字数：
- トーン：
- 必ず含める要素：
- NGワード／表現：
- 引用元・参考URL：
- 画像点数・キャプション指定：

## 5. 内部リンク設計
| リンク種別 | 飛ばし先 | テキスト |
|---|---|---|
| 商品ページ |  |  |
| コレクション |  |  |
| 関連記事 |  |  |

## 6. Article schema（JSON-LD）
- @type: Article / BlogPosting
- headline / image / datePublished / author / publisher の指定値

## 7. 公開後アクション
- 公開URLの内部リンク追加先（既存記事から）
- ソーシャル投稿文（X/Instagram）
- メルマガ／LINE告知文
````

## 品質ゲート

- [ ] 検索意図が4分類で明示されている
- [ ] タイトル案が3つあり、主キーワードが前方35字以内
- [ ] メタディスクリプションが JP 70-90字
- [ ] H2の数が3-7個（少なすぎ／多すぎを避ける）
- [ ] 各H2に送客先（商品／コレクション／関連記事）が定義されている
- [ ] NGワード（薬機法・景表法リスク表現）が明記されている
- [ ] Article schema の必須フィールドが揃っている
- [ ] URL handle がローマ字で重複していない

## エッジケース

- **指名検索（Go意図）**：ブログ記事ではなくランディングページ／FAQ に誘導すべきと判定し、企画を中止して理由を返す
- **競合の記事品質が圧倒的に高い**：そのキーワードを諦め、ロングテール（より具体的な複合語）へシフトする判断を提示
- **YMYL（健康・医療・金融）**：監修者表記・出典明示・断定回避を必須にし、薬機法／景表法チェックを `references/article-brief-format.md` の専用節で扱う
- **多言語ストア（Markets + Translate & Adapt）**：日本語版を起点に、翻訳版は別記事として handle 分離を推奨
- **ブランド指名キーワード**：SEO観点では既に上位が取れているため、購入転換に直結するLP的記事構成を提案

詳細は `references/examples.md` を参照。

## 注意事項

- 商品の効果効能を断定する記事は薬機法／景表法リスクが高い。化粧品・健康食品は別スキル `yakki-keihyo-expression-check` でクロスチェック推奨
- 引用は出典を必ず明記。論文・公的機関データを使う場合は最新版を確認
- AI生成記事をそのまま公開せず、編集者の最終チェックを前提
- Shopify Blog の Liquid 仕様・metafield 仕様は変動するため、テーマ実装前に管理画面で要確認
- Article schema の `author` / `publisher` は実在情報。架空名・捏造URLを入れない

## references/ 一覧

- `references/search-intent-classification.md`：検索意図4分類と最適記事タイプ
- `references/article-type-templates.md`：5記事タイプの見出し構成テンプレ
- `references/article-brief-format.md`：執筆ブリーフのフルテンプレート
- `references/internal-linking-strategy.md`：内部リンク戦略（売上送客／SEO）
- `references/jsonld-article-schema.md`：Article schema 完全例
- `references/examples.md`：ジャンル別 記事企画実例集

## 参考公式情報源

- Shopify 公式ヘルプ「Shopify blog」「Online Store 2.0 templates」
- Google 検索セントラル「構造化データ Article」
- Google「検索品質評価ガイドライン」（E-E-A-T／YMYL）

最新仕様は Shopify Help Center および Google 検索セントラルで確認すること。
