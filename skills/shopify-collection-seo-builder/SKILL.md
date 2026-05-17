---
name: shopify-collection-seo-builder
description: ShopifyのコレクションページのSEO設計を行うスキル。「コレクションSEO」「コレクションページ最適化」「Smart Collection条件」「カテゴリページ」「絞り込み」「コレクション説明文」「BreadcrumbList」「パンくず」「Search & Discovery」「フィルター設計」「コレクションのメタタグ」「上部説明文」「下部説明文」など、Shopifyのコレクション（カテゴリ）ページのSEO設計・説明文ライティング・フィルター設計・パンくず構造化データに関するリクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※商品ページ単体のSEOは別スキル `shopify-product-page-seo-jp`、ブログ記事の企画は `shopify-blog-content-planner`、効果測定は `shopify-ga4-search-console-report`。
verified_at: 2026-05
---

# ShopifyコレクションSEO構築スキル

## 概要

Shopifyのコレクションページ（`/collections/<handle>`）をSEO最適化するためのスキル。

検索キーワードに対するコレクションの **位置付け判定**、Smart Collection の自動振り分け条件、上部／下部説明文の構造、フィルター（Search & Discovery）の設計、BreadcrumbList JSON-LD、内部リンク導線までを一括設計する。

## ★最重要原則

**コレクションページは「カテゴリ検索の受け皿」として、検索キーワード × フィルター条件 × 説明文 × 商品ラインナップを一致させる**。説明文だけSEO最適化しても、ラインナップが薄ければ離脱する。Smart Collection 条件と Search & Discovery フィルターを併せて整える。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| Liquid `collection` オブジェクト 主要プロパティ | `references/liquid-collection-object.md` |
| Smart Collection の条件設定 | `references/smart-collection-conditions.md` |
| 上部／下部説明文テンプレート | `references/intro-text-templates.md` |
| Shopify Search & Discovery アプリ（フィルタ・サジェスト） | `references/search-and-discovery.md` |
| BreadcrumbList JSON-LD | `references/breadcrumbs-schema.md` |
| ジャンル別 コレクションSEO 実例集 | `references/examples.md` |

### Shopify Collection固有の要点

- URL：`/collections/<handle>` ／ タグ絞り込みは `/collections/<handle>/<tag>`
- テンプレート：`collection.json`（Online Store 2.0）
- 説明文：1つのリッチテキストフィールド。テーマ次第で「上部」「下部」に分割表示可（多くは metafield 併用で対応）
- メタフィールド：`collection.metafields.custom.intro_html` / `bottom_html` 等で上下分割
- タイトル：70字（推奨60）、メタディスクリプション：JP70-90字
- Smart Collection 条件：商品タイトル・タグ・タイプ・ベンダー・価格・在庫・重量・metafield・variantのcompare_at_price
- Search & Discovery：フィルター（タグ・metafield・variantOption・価格）、サジェスト、関連商品

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- 対象キーワード（複数可、検索意図のメイン／サブ）
- 既存コレクションの有無（新規／既存改善）
- 商品ラインナップ（取り扱いSKU数・主要属性）
- フィルター対象軸（肌タイプ／サイズ／成分／産地など）
- ブランドトーン

**Step 2. コレクションの位置付け判定**
- カテゴリ／用途／属性／シーン／キャンペーンのどれか
- 階層（親コレクション／子コレクション）

**Step 3. 自動／手動の選択**
- Smart Collection 条件で自動振り分け可能か判定
- 条件が複雑な場合は手動 Collection を併用

**Step 4. タイトル・メタ・handleを決定**
- `<H1タイトル>` / `<title>` / `<meta description>` / `<handle>`（ローマ字）

**Step 5. 上部／下部説明文を作成**
- 上部：検索意図に直接答える1段落＋特徴3-5項目
- 下部：選び方ガイド・FAQ・関連カテゴリリンク（重複コンテンツ回避）

**Step 6. フィルター（Search & Discovery）設計**
- 主要フィルター3-5軸を決定、各フィルターの metafield／variantOption を明示

**Step 7. BreadcrumbList JSON-LDと内部リンクを設計**

## 代表例（1パターン）

「敏感肌向け美容液」コレクション：
- handle：`sensitive-skin-serum`
- H1：「敏感肌向け美容液」
- 上部説明文：「敏感肌・ゆらぎ肌の方向けに、低刺激処方・パッチテスト済の美容液を集めました…」（200字＋特徴4項目）
- フィルター：肌タイプ／成分／価格帯／容量
- Smart Collection条件：タグに `sensitive` を含む AND タイプ `美容液`

他ジャンル（食品・ファッション・家電）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopifyコレクション設計：[コレクション名]

## 1. 位置付け判定
- カテゴリ／用途／属性／シーン／キャンペーン：
- 親コレクション：
- 主キーワード：
- 副キーワード：

## 2. URL / タイトル / メタ
- handle（ローマ字）：
- H1：
- title タグ：（〜60字）
- meta description：（JP 70-90字）

## 3. Smart Collection 条件 or 手動
- 自動条件：（例：tag contains "sensitive" AND type = "美容液"）
- 手動追加が必要な例外商品：

## 4. 上部説明文（intro）
- 200-300字本文：
- 特徴箇条書き3-5項目：

## 5. 下部説明文（bottom）
- 選び方ガイド見出し：
- FAQ 3-5問：
- 関連コレクションリンク：

## 6. フィルター設計（Search & Discovery）
| 軸 | metafield / option | 値の例 |
|---|---|---|
| 肌タイプ |  |  |
| 成分 |  |  |
| 価格 |  |  |

## 7. BreadcrumbList JSON-LD
- ホーム > 親コレクション > このコレクション の構造
- 完全な JSON-LD：

## 8. 内部リンク導線
- このコレクションへ送る記事／商品ページ：
- このコレクションから送る先：
````

## 品質ゲート

- [ ] handle がローマ字・URL-safe・重複なし
- [ ] H1 と `<title>` が異なる文言（title はキーワード前方）
- [ ] meta description が JP 70-90字
- [ ] 上部説明文が重複コンテンツになっていない（他コレクションと文言コピペでない）
- [ ] Smart Collection 条件が明確で、誤って混入する商品がない
- [ ] フィルター軸が3-5個（少なすぎ／多すぎを避ける）
- [ ] BreadcrumbList の position が連番で正しい
- [ ] ページ末尾の関連リンクが内部循環を作っていない

## エッジケース

- **商品0件のコレクション**：noindex 推奨。空ページは検索流入させずに準備中表示
- **タグ絞り込みURL（`/collections/x/y`）の量産**：crawl budget 浪費。重要な絞り込みのみ canonical で本コレクションに集約
- **季節キャンペーンコレクション**：終了時に商品0件化することが多いので、廃止時はリダイレクト先を商品列のあるコレクションへ
- **多言語ストア（Markets + Translate & Adapt）**：handle は言語別に分けず、Translate & Adapt が `<link rel="alternate">` で hreflang を自動付与する仕組みを前提
- **絞り込み軸が metafield に依存する**：variant option では対応できない属性は metafield 設計と組合せ。`shopify-metafields-structure` スキルでデータ構造を先に設計する

詳細は `references/examples.md` を参照。

## 注意事項

- Shopify の Smart Collection 条件は AND/OR の論理が限定的（条件全て / いずれか）。複雑な条件はタグ運用で吸収する
- 商品0件のコレクションをそのまま公開すると SEO 評価が下がる。noindex メタタグかテーマ側の判定が必要
- 上部説明文を商品列の上に長く置きすぎると、モバイルで商品到達まで遠くなり離脱増。本文は折りたたみ or 短く
- 検索キーワードとコレクション内容のミスマッチは離脱を招く。ラインナップを増やす／別コレクションを作る判断を併記
- 公式仕様は変動する。最終確認はテーマ・Search & Discovery アプリの管理画面で行う

## references/ 一覧

- `references/liquid-collection-object.md`：Liquid `collection` 主要プロパティ
- `references/smart-collection-conditions.md`：Smart Collection 条件設定
- `references/intro-text-templates.md`：上部／下部説明文テンプレ
- `references/search-and-discovery.md`：Search & Discovery アプリでのフィルタ／サジェスト
- `references/breadcrumbs-schema.md`：BreadcrumbList JSON-LD
- `references/examples.md`：ジャンル別実例集

## 参考公式情報源

- Shopify 公式ヘルプ「Collections」「Smart Collections」
- Shopify 公式アプリ「Search & Discovery」ドキュメント
- Google 検索セントラル「パンくずリスト（BreadcrumbList）」

最新仕様は Shopify Help Center および Google 検索セントラルで確認すること。
