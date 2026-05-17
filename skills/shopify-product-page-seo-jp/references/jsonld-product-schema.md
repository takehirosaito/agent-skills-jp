# JSON-LD Product schema 完全例

Shopify テーマに埋め込む `<script type="application/ld+json">` の完全例。`product.json` のデフォルトでは name/price しか出ないため、テーマファイル側で補強する。

## 最小構成（必須プロパティのみ）

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Bloom Petal セラム 30mL",
  "image": [
    "https://cdn.shopify.com/.../main_1200x.jpg"
  ],
  "description": "高濃度ビタミンC10%配合の美容液。",
  "sku": "BP-SERUM-30",
  "brand": { "@type": "Brand", "name": "Bloom Petal" },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/vitamin-c-serum-30ml",
    "priceCurrency": "JPY",
    "price": "5800",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
```

## 推奨構成（レビュー・GTIN・配送・MPN）

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Bloom Petal セラム 30mL",
  "image": [
    "https://cdn.shopify.com/.../main_1200x.jpg",
    "https://cdn.shopify.com/.../sub1_1200x.jpg",
    "https://cdn.shopify.com/.../sub2_1200x.jpg"
  ],
  "description": "高濃度ビタミンC10%配合の美容液。低刺激処方。",
  "sku": "BP-SERUM-30",
  "gtin13": "4901234567894",
  "mpn": "BP-SERUM-30-V2",
  "brand": { "@type": "Brand", "name": "Bloom Petal" },
  "category": "Beauty & Personal Care > Skin Care > Serum",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/vitamin-c-serum-30ml",
    "priceCurrency": "JPY",
    "price": "5800",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "priceValidUntil": "2026-12-31",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "JPY"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "JP"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "JP",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "128"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": { "@type": "Person", "name": "顧客イニシャル" },
      "reviewBody": "..."
    }
  ]
}
```

## Liquid テンプレート（実装用）

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
  "description": {{ product.description | strip_html | truncate: 300 | json }},
  "sku": {{ current_variant.sku | json }},
  {%- if current_variant.barcode != blank %}
  "gtin13": {{ current_variant.barcode | json }},
  {%- endif %}
  "brand": { "@type": "Brand", "name": {{ product.vendor | json }} },
  "offers": {
    "@type": "Offer",
    "url": "{{ shop.url }}{{ product.url }}",
    "priceCurrency": "{{ cart.currency.iso_code | default: 'JPY' }}",
    "price": "{{ current_variant.price | money_without_currency | remove: ',' }}",
    "availability": "{%- if current_variant.available -%}https://schema.org/InStock{%- else -%}https://schema.org/OutOfStock{%- endif -%}",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
</script>
```

## プロパティ別の注意点

| プロパティ | 注意点 |
|---|---|
| `name` | 商品名そのまま。SEO title ではなく Product title を使う |
| `image` | 配列で複数枚。1:1／4:3／16:9 の3比率推奨（Googleショッピング要件） |
| `description` | HTML を `strip_html` で除去、200-300字に短縮 |
| `sku` | バリアント単位の SKU。複数バリアントは現在選択中のものを動的に |
| `gtin13` | JAN（バーコード）。空なら出さない（空文字を出すと逆に減点） |
| `brand` | `vendor` を流用。専用ブランド metafield があればそちらを優先 |
| `priceCurrency` | JPY固定 or `cart.currency.iso_code` で動的。Markets多通貨配信時は動的必須 |
| `price` | 数値文字列、カンマなし、小数点なし（JPYは整数） |
| `availability` | InStock / OutOfStock / PreOrder / BackOrder の4種が主 |
| `priceValidUntil` | セール終了日。常設価格なら省略可 |
| `aggregateRating` | **実レビューが無い場合に出すと違反**（Googleペナルティ対象） |
| `review` | 個別レビュー。3-5件まで |

## availability 値（schema.org 列挙）

| 状態 | 値 |
|---|---|
| 在庫あり | `https://schema.org/InStock` |
| 在庫切れ | `https://schema.org/OutOfStock` |
| 予約販売 | `https://schema.org/PreOrder` |
| 取り寄せ | `https://schema.org/BackOrder` |
| 廃盤 | `https://schema.org/Discontinued` |

## よくある間違い

1. **`priceCurrency` が `USD`**：海外テーマをそのまま入れると USD のまま。JPストアは JPY
2. **`price` にカンマ**：`"5,800"` ではなく `"5800"`
3. **`image` が相対パス**：`https://` から始まるフル URL 必須
4. **`aggregateRating` を実レビューなしで捏造**：Googleペナルティ。0件なら出さない
5. **`gtin13` に空文字**：JAN未登録の商品は `gtin13` ごと省略する
6. **`description` に HTML タグが残る**：必ず `strip_html` を通す
7. **Markets多通貨で priceCurrency 固定**：通貨切替時に Google Merchant Center で不整合エラー

## 検証ツール

- Google「リッチリザルトテスト」（rich-results.google.com）
- Schema.org Markup Validator
- Google Search Console「拡張」→「商品」
