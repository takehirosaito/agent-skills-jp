# Liquid `product` オブジェクト 主要プロパティ

Shopify Liquid で商品ページ（product.liquid / product.json + section）から呼び出せる `product` オブジェクトの主要プロパティ。SEO・テーマ実装・JSON-LD 出力時に頻用する。

## 基本属性

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.id` | number | 商品ID |
| `product.handle` | string | URL handle（例 `vitamin-c-serum-30ml`） |
| `product.title` | string | 商品名 |
| `product.description` | string（HTML） | 商品説明本文（管理画面のリッチエディタ） |
| `product.vendor` | string | ベンダー／ブランド |
| `product.type` | string | 商品タイプ |
| `product.tags` | array<string> | タグ |
| `product.url` | string | 相対URL（例 `/products/handle`） |
| `product.created_at` | datetime | 作成日時 |
| `product.published_at` | datetime | 公開日時 |
| `product.available` | boolean | いずれかのバリアントが購入可能か |

## 価格

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.price` | number（cents） | 最低価格（バリアント中） |
| `product.price_min` / `price_max` | number | 価格レンジ |
| `product.compare_at_price` | number | 比較価格（参考定価） |
| `product.compare_at_price_min` / `_max` | number | 比較価格レンジ |
| `product.price_varies` | boolean | バリアントで価格が変わるか |

価格を JSON-LD で出すときは **`product.price | money_without_currency`** を使うか、**`shop.currency`** を併用する。Markets 配信中は **`cart.currency.iso_code`** を見て出し分け。

## 画像

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.featured_image` | image | メイン画像 |
| `product.images` | array<image> | 全画像 |
| `product.media` | array<media> | 画像／動画／3D／外部動画 |

画像URLは `| img_url: '1200x'` で必要サイズ指定。JSON-LD の `image` 配列は最低1枚、推奨3枚（1:1／4:3／16:9）。

## バリアント

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.variants` | array<variant> | バリアント一覧 |
| `product.selected_variant` | variant | URL `?variant=` で選択中のバリアント |
| `product.selected_or_first_available_variant` | variant | 初期表示用 |
| `product.options` | array<string> | オプション名（例 `["色","サイズ"]`） |
| `product.options_with_values` | array | オプション名＋値 |

`variant.sku` `variant.barcode`（JAN）`variant.available` `variant.inventory_quantity` を JSON-LD の `sku` `gtin13` `availability` に紐付ける。

## Metafields

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.metafields.<namespace>.<key>` | metafield | カスタム属性 |
| `product.metafields.custom.<key>` | metafield | 標準名前空間 `custom` |

JSON-LD の `brand` `material` `additionalProperty` 等の拡張属性は metafields から流し込む設計が一般的。Metafields の設計は `shopify-metafields-structure` スキルを参照。

## SEO 関連

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.metafields.global.title_tag` | string | meta title（管理画面の Search engine listing で設定した値） |
| `product.metafields.global.description_tag` | string | meta description（同上） |

テーマで `<title>` を組み立てるときは：
```liquid
{%- if product.metafields.global.title_tag != blank -%}
  {{ product.metafields.global.title_tag }}
{%- else -%}
  {{ product.title }} - {{ shop.name }}
{%- endif -%}
```

## 関連リソース

| プロパティ | 型 | 内容 |
|---|---|---|
| `product.collections` | array<collection> | 所属コレクション |
| `recommendations.products` | array<product> | 関連商品（推奨API） |

関連商品は `/recommendations/products.json?product_id=` API から取得し、Section にレンダリング。

## 出力例：JSON-LD（最小構成）

```liquid
{%- assign current_variant = product.selected_or_first_available_variant -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": {{ product.title | json }},
  "image": [
    {%- for img in product.images limit: 3 -%}
      "https:{{ img | img_url: '1200x' }}"{%- unless forloop.last -%},{%- endunless -%}
    {%- endfor -%}
  ],
  "description": {{ product.description | strip_html | truncate: 200 | json }},
  "sku": {{ current_variant.sku | json }},
  "brand": { "@type": "Brand", "name": {{ product.vendor | json }} },
  "offers": {
    "@type": "Offer",
    "url": "{{ shop.url }}{{ product.url }}",
    "priceCurrency": "JPY",
    "price": "{{ current_variant.price | money_without_currency | remove: ',' }}",
    "availability": "{%- if current_variant.available -%}https://schema.org/InStock{%- else -%}https://schema.org/OutOfStock{%- endif -%}"
  }
}
</script>
```

## 注意

- `product.description` は HTML を含むため `strip_html | truncate: 200` で JSON-LD に入れる
- `money_without_currency` は通貨記号を除いた数値文字列（カンマ区切り）を返すので `remove: ','` を併用
- Markets で多通貨配信時は `cart.currency.iso_code` で `priceCurrency` を切り替え
