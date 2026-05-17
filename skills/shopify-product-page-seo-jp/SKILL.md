---
name: shopify-product-page-seo-jp
description: Shopifyの商品ページを日本語SEO向けに最適化するスキル。「商品名SEO」「Shopify商品ページSEO」「メタタイトル」「メタディスクリプション」「商品説明SEO」「商品ページのタイトル」「Shopifyの商品タイトル」「handle最適化」「URL設計」「301リダイレクト」「JSON-LD Product」「Product schema」「リッチリザルト」「商品ページの構造化データ」など、Shopifyの商品ページ単体のSEO最適化（タイトル・メタ・URL・説明文・構造化データ）に関するリクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※コレクションページのSEOは別スキル `shopify-collection-seo-builder`、ブログ記事のSEOは `shopify-blog-content-planner`、商品スペックのメタフィールド構造化は `shopify-metafields-structure`。
verified_at: 2026-05
---

# Shopify 商品ページ SEO（日本語）スキル

## 概要

Shopifyの商品ページ（`/products/<handle>`）を **日本語SEO** 向けに最適化するスキル。

商品名・メタタイトル・メタディスクリプション・URL handle・商品説明HTML・JSON-LD Product schema・内部リンク・リダイレクトを統合して最適化し、検索流入とCTR・CVRを同時に上げる。

## ★最重要原則

**「商品名（H1）」「`<title>`」「`<meta description>`」「商品説明H2見出し」の4要素で同じキーワードを多重カバーしつつ、ユーザーが読める日本語に保つ**。1要素だけのキーワード詰め込みは効かない。4箇所の役割分担（指名性 / 検索一致 / クリック動機 / 滞在維持）を意識して書き分ける。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| 日本語SEO 文字数ルール（Shopify上限と実務推奨） | `references/seo-text-length-rules.md` |
| Liquid `product` オブジェクト 主要プロパティ | `references/liquid-product-object.md` |
| Handle 命名規則・URL Redirects 運用 | `references/handle-and-redirects.md` |
| 商品説明 HTML テンプレート集 | `references/product-description-templates.md` |
| JSON-LD Product schema 完全例 | `references/jsonld-product-schema.md` |
| 内部リンク設計（CVR向け／SEO向け） | `references/internal-linking.md` |
| ジャンル別 商品ページSEO 実例集 | `references/examples.md` |

### Shopify 商品ページ 固有の要点

- URL：`/products/<handle>`
- テンプレート：`product.json`（Online Store 2.0）／`product.<suffix>.json` でテンプレ分岐
- 既定タイトル：`<product.title> – <shop.name>`（テーマで変更可）
- 既定 product.json では Product schema が `name / price` 程度しか出ない → テーマ側で `<script type="application/ld+json">` を補強
- 商品説明（`product.description`）：リッチエディタからHTMLで保存。テーマで `{{ product.description }}` 展開
- ハンドル変更で URL が変わると 301 リダイレクトが必要（管理画面で自動／手動）

### 文字数上限・推奨

| 要素 | Shopify上限 | 実務推奨 |
|---|---|---|
| title tag | 70字 | 60字以内 |
| meta description | 320字 | JP 70-90字 |
| 商品名（product.title） | 255字 | 40-60字 |
| handle | -- | 50字以内・ローマ字 |

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- 商品カテゴリ・ブランド名
- 主キーワード（指名検索 or 一般語）／副キーワード
- 競合上位ページの傾向
- 既存商品ページの有無（新規／改善）
- 在庫状況・販売状態

**Step 2. キーワード戦略**
- 主キー（最重要・40字以内に必ず含む）
- 副キー（補助的に商品説明に出す）
- 共起語（ブランド・カテゴリ・属性語）

**Step 3. 商品名（H1）作成**
- 構造例：「[ブランド名] [商品名] [属性] [容量・サイズ] [副キー]」
- 40-60字目安
- 主キーを前方20字以内に

**Step 4. `<title>` タグ作成**
- 60字以内
- 主キー前方
- ブランド名は末尾

**Step 5. `<meta description>` 作成**
- JP 70-90字
- クリック動機（誰向け・特徴・送料無料／返品OKなど）
- 商品ページから抜粋せず独自に書く

**Step 6. URL handle 設計**
- ローマ字、英数字とハイフン、50字以内
- 既存URL変更時は 301 リダイレクト追加

**Step 7. 商品説明 HTML 構造**
- H2「特徴」「成分／素材」「使い方」「サイズ・容量」「よくある質問」
- リスト・dlで構造化
- 内部リンク（関連商品／コレクション／ブログ記事）

**Step 8. JSON-LD Product schema 補強**
- name / image / description / sku / brand / offers / aggregateRating の完全例
- variant ごとの価格・在庫を反映

**Step 9. 内部リンク設計**
- CVR向け：関連商品・セット商品
- SEO向け：上位カテゴリ・関連ブログ

## 代表例（1パターン）

化粧品（ビタミンC美容液）：
- 主キー：「ビタミンC 美容液」／副キー：「敏感肌」「ハリ」「角質ケア」
- 商品名：「[ブランド] ビタミンC美容液 30ml｜敏感肌対応・角質ケア」（45字）
- title：「ビタミンC美容液 30ml 敏感肌対応 ｜ [ブランド名]」（30字）
- meta：「敏感肌でも使えるピュアビタミンC10%配合の美容液。角質ケアでハリのある肌へ。30日返品OK・送料無料。」（70字）
- handle：`vitamin-c-serum-30ml`
- 商品説明 H2：①特徴 ②成分 ③使い方 ④サイズ ⑤FAQ
- JSON-LD：offers.price / availability / aggregateRating を補強

他ジャンル（食品・ファッション・家電・サプリ）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopify 商品ページ SEO 設計：[商品名]

## 1. キーワード戦略
- 主キー：
- 副キー：
- 共起語：
- 検索意図：

## 2. 商品名（H1 / product.title）
- 案A（40-50字）：
- 案B（推奨60字）：
- 採用案：

## 3. title タグ（60字）
- 案A：
- 案B：
- 採用案：

## 4. meta description（JP 70-90字）
- 案A：
- 案B：
- 採用案：

## 5. URL handle（50字以内・ローマ字）
- handle：
- 既存からの変更：あり / なし
- 301 リダイレクト追加：あり / なし

## 6. 商品説明 HTML 構造
```html
<h2>特徴</h2>
<ul>
  <li></li>
</ul>

<h2>成分（または素材）</h2>
<dl>
  <dt></dt><dd></dd>
</dl>

<h2>使い方</h2>
<ol>
  <li></li>
</ol>

<h2>サイズ・容量</h2>

<h2>よくある質問</h2>
<details><summary></summary></details>
```

## 7. JSON-LD Product schema（補強）
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "",
  "image": [],
  "description": "",
  "sku": "",
  "brand": { "@type": "Brand", "name": "" },
  "offers": {
    "@type": "Offer",
    "url": "",
    "price": "",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  }
}
```

## 8. 内部リンク設計
| リンク種別 | リンク先 | アンカー |
|---|---|---|
| 関連商品 |  |  |
| コレクション |  |  |
| 関連ブログ |  |  |

## 9. 画像 alt 設計
| 画像 | alt |
|---|---|

## 10. 反映チェックリスト
- [ ] handle が重複していない
- [ ] 301 リダイレクト追加済み（変更時）
- [ ] title tag がテーマ側で正しく出力
- [ ] meta description がテーマ側で出力
- [ ] H1 が1つだけ
- [ ] JSON-LD のスキーマ検証ツールでエラーなし
````

## 品質ゲート

- [ ] 主キーが H1 / title / meta / H2 の4箇所に出る
- [ ] title が60字以内
- [ ] meta description が JP 70-90字
- [ ] 商品名（H1）が40-60字
- [ ] handle がローマ字・50字以内
- [ ] 商品説明に H2 が3-6個ある
- [ ] JSON-LD Product schema が必須フィールド（name/image/offers/price）を満たす
- [ ] 内部リンクが3つ以上ある
- [ ] 薬機法・景表法リスク表現（断定・最大級・No.1根拠なし）が無い

## エッジケース

- **販売停止商品**：noindex 推奨（OOS 商品）／後継商品への 301 リダイレクト／復活予定なら「再入荷通知」フォームに切替
- **季節限定・期間限定商品**：販売終了時に翌年に向けて URL を残す or リダイレクトする判断を運用ルール化
- **バリエーション（variant）が多い**：variant 別に SKU schema・price を出す JSON-LD 構造（offers を AggregateOffer に）
- **multi-language（Markets + Translate & Adapt）**：handle は1つで、Translate & Adapt が `<link rel="alternate" hreflang>` を自動付与。各言語版の title/meta も翻訳必要
- **薬機法／景表法対応の必要なジャンル**：化粧品・健康食品は `yakki-keihyo-expression-check` でクロスチェック
- **競合上位がアフィリエイトサイト**：商品ページではなく長文ガイド記事の方が勝てる場合あり、`shopify-blog-content-planner` で記事を生成し、商品ページに送客する戦略を提示

詳細は `references/examples.md` を参照。

## 注意事項

- handle 変更時は管理画面で必ず 301 リダイレクトを設定（旧URLを残さず移すと404が増えてSEO評価低下）
- Shopify の `product.json` デフォルトでは Product schema が name/price 程度なので、テーマファイルで補強しないとリッチリザルトが出ない
- 商品説明にコピペ文を量産すると重複コンテンツ判定リスク。商品ごとに独自に書く
- title / meta は **テーマファイル（`layout/theme.liquid`）** の出力ロジックも確認。SEO アプリ（SEO Manager 等）が上書きしている場合がある
- 「最大級」「No.1」「絶対」「治る」等の優良誤認表現を使わない（景表法・薬機法）
- 公式仕様は変動するため、最終的に Shopify Help Center・Google 検索セントラルで確認

## references/ 一覧

- `references/seo-text-length-rules.md`：日本語SEO文字数ルール
- `references/liquid-product-object.md`：Liquid product オブジェクト主要プロパティ
- `references/handle-and-redirects.md`：handle 命名と301リダイレクト
- `references/product-description-templates.md`：商品説明 HTML テンプレ
- `references/jsonld-product-schema.md`：JSON-LD Product schema 完全例
- `references/internal-linking.md`：内部リンク設計
- `references/examples.md`：ジャンル別実例集

## 参考公式情報源

- Shopify Help Center「Edit a product's SEO」「URLs and redirects」
- Shopify.dev「product object」「Online Store 2.0 templates」
- Google 検索セントラル「構造化データ Product」

最新仕様は Shopify Help Center および Google 検索セントラルで確認すること。
