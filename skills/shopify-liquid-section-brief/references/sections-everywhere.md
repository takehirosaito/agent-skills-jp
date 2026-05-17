# Sections Everywhere と Online Store 2.0

## Sections Everywhere とは

従来のShopify では section は **トップページのみ** に配置できた。Online Store 2.0 で導入された **Sections Everywhere** で、商品ページ・コレクションページ・ブログ・固定ページ・検索結果ページなど **ほぼ全テンプレート** で section を配置できるようになった。

## テンプレートの JSON 化

Online Store 2.0 以降、各テンプレートは `*.json` で section 構成を持つ：

```
templates/
  index.json
  product.json
  collection.json
  page.json
  blog.json
  article.json
  search.json
  404.json
  password.json
  cart.json
```

商品ページの例（`templates/product.json`）：

```json
{
  "sections": {
    "main": {
      "type": "main-product",
      "blocks": {
        "vendor": { "type": "vendor", "settings": {} },
        "title": { "type": "title", "settings": {} },
        "price": { "type": "price", "settings": {} },
        "variant_picker": { "type": "variant_picker", "settings": {} },
        "buy_buttons": { "type": "buy_buttons", "settings": {} },
        "description": { "type": "description", "settings": {} }
      },
      "block_order": [
        "vendor", "title", "price", "variant_picker", "buy_buttons", "description"
      ]
    },
    "features": {
      "type": "section-features",
      "settings": {}
    }
  },
  "order": ["main", "features"]
}
```

→ マーチャントは Theme Editor で section を追加・並び替え・block編集できる。`templates/*.json` は最終結果として保存される。

## section group（header / footer）

`sections/` に置く section に加え、`sections/header-group.json` `sections/footer-group.json` のような **section group** を作って、ヘッダー・フッター内の section 構成も JSON 化できる：

```json
{
  "type": "header",
  "name": "Header group",
  "sections": {
    "announcement-bar": { "type": "announcement-bar", "settings": {} },
    "header": { "type": "header", "settings": {} }
  },
  "order": ["announcement-bar", "header"]
}
```

`groups: ["header"]` で `enabled_on` に指定した section だけがヘッダーグループに配置可能。

## App Blocks（Theme App Extension）

アプリが提供する block を section の中に配置できる仕組み。

アプリ側：Shopify CLI で `theme app extension` を作成、`blocks/<block-name>.liquid` を実装。

テーマ側：section の `blocks` 配列に `{"type": "@app"}` を含めると **インストール済みアプリの block** がマーチャントに選択肢として表示される。

```json
"blocks": [
  { "type": "feature_item", "name": "特徴項目", "settings": [...] },
  { "type": "@app" }
]
```

## Theme Blocks（Online Store 2.0 の新機能・最新）

最新の OS 2.0 で **theme blocks**（再利用可能 block）が導入された。section に依存せず、独立した block を `blocks/<name>.liquid` に置ける。

section 側で受け入れ：

```liquid
{% content_for 'blocks' %}
```

または schema で：

```json
"blocks": [
  { "type": "@theme" }
]
```

theme blocks の利点：
- 同じ block を複数 section で再利用できる
- block ごとに schema を持てる
- App Block と同様に独立性が高い

## Online Store 1.0 との互換性

非 OS 2.0 テーマ（Vintage Theme）の場合：

- `templates/*.liquid` のみ（`*.json` は使えない）
- section はトップページ専用 or テンプレートに直接埋め込み
- Theme Editor の section 追加機能が限定的

→ 古いテーマでカスタム section を作る場合、**section をテンプレ Liquid から直接 `{% section 'feature-section' %}` で呼び出す** 形になる。Sections Everywhere の自由度はない。

新規案件は **必ず OS 2.0 対応テーマ** を採用すべき。

## メインプロダクト section（templates/product.json）

OS 2.0 の商品ページは：

```json
"sections": {
  "main": {
    "type": "main-product",
    "blocks": { ... }
  }
}
```

`main-product` という section が商品の基本情報を block で構成する。Dawn theme の場合、組み込み block：

- vendor
- title
- price
- variant_picker
- buy_buttons
- inventory
- description
- share
- pickup_availability
- sku
- text
- icon-with-text
- popup
- @app（アプリ block）

カスタム要素を商品ページに追加する場合：
- 既存 section の block に `@app` 経由でカスタム block を追加
- 別 section を `templates/product.json` の `sections` に追加（main 以外）

## ファイル構成（OS 2.0 推奨）

```
theme/
  layout/
    theme.liquid
    password.liquid
  templates/
    index.json
    product.json
    collection.json
    page.json
    ...
  sections/
    header.liquid
    footer.liquid
    main-product.liquid
    section-features.liquid
    header-group.json
    footer-group.json
  blocks/             ← Theme Blocks（OS 2.0 最新）
    block-cta.liquid
    block-text.liquid
  snippets/
  assets/
  config/
    settings_schema.json
    settings_data.json
  locales/
    ja.default.json
    en.json
```

## 設計時の判断

| 要件 | 推奨 |
|---|---|
| トップページ専用 | Section |
| 商品ページ・コレクション・ブログで使い回し | Sections Everywhere（enabled_on で対象指定） |
| アプリが提供する機能 | Theme App Extension の App Block |
| 複数 section で同じ部品を使い回し | Theme Block（OS 2.0 最新） |
| ヘッダー・フッター内の編集可能セクション | Section Group |

## チェックリスト

- [ ] OS 2.0 対応テーマであることを確認
- [ ] section の `enabled_on` / `disabled_on` で配置可能テンプレを明示
- [ ] App Block を受け入れるなら `@app` を含む
- [ ] Theme Block を活用するなら `@theme` を含む
- [ ] header / footer に配置する section は section group 対応
- [ ] templates/*.json の構造を理解した上で設計
