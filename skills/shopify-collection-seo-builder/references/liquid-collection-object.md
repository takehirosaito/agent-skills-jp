# Liquid `collection` オブジェクト 主要プロパティ

## 基本属性

| プロパティ | 型 | 内容 |
|---|---|---|
| `collection.id` | number | コレクションID |
| `collection.handle` | string | URL handle |
| `collection.title` | string | コレクション名 |
| `collection.description` | string（HTML） | 説明文（標準フィールド） |
| `collection.url` | string | 相対URL（`/collections/handle`） |
| `collection.image` | image | コレクション画像 |
| `collection.products_count` | number | 表示中の商品数（フィルタ適用後） |
| `collection.all_products_count` | number | 総商品数（フィルタ前） |
| `collection.products` | array<product> | 商品配列 |
| `collection.all_tags` | array<string> | 全タグ（フィルタ用） |
| `collection.tags` | array<string> | 適用中のタグフィルタ |
| `collection.default_sort_by` | string | デフォルトの並び順 |
| `collection.sort_by` | string | 現在の並び順 |
| `collection.sort_options` | array | 利用可能な並び順 |
| `collection.template_suffix` | string | テンプレート別出し分け用 |

## SEO 関連

| プロパティ | 内容 |
|---|---|
| `collection.metafields.global.title_tag` | meta title（管理画面の SEO 編集） |
| `collection.metafields.global.description_tag` | meta description |

## Metafields（カスタム）

```liquid
{{ collection.metafields.custom.intro_short }}
{{ collection.metafields.custom.intro_long | metafield_tag }}
{{ collection.metafields.custom.banner_image | image_url: width: 1600 }}
```

設計推奨：
- `custom.intro_short` (single_line_text_field or richtext)：上部短い説明
- `custom.intro_long` (rich_text_field)：下部長い説明
- `custom.banner_image` (file_reference)：ヘッダーバナー
- `custom.faq` (list.metaobject_reference)：FAQ
- `custom.related_collections` (list.collection_reference)：関連コレクション

## 並び順

| sort_by 値 | 内容 |
|---|---|
| `manual` | 手動 |
| `best-selling` | ベストセラー |
| `title-ascending` / `title-descending` | 商品名 昇順／降順 |
| `price-ascending` / `price-descending` | 価格 昇順／降順 |
| `created-ascending` / `created-descending` | 作成日（古／新） |

## ページネーション

```liquid
{%- paginate collection.products by 24 -%}
  {%- for product in collection.products -%}
    ...
  {%- endfor -%}
  {{ paginate | default_pagination }}
{%- endpaginate -%}
```

## 商品リスト出力例

```liquid
<div class="product-grid">
  {%- for product in collection.products -%}
    <a href="{{ product.url }}" class="product-card">
      <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.featured_image.alt }}" loading="lazy">
      <h3>{{ product.title }}</h3>
      <p>{{ product.price | money }}</p>
      {%- if product.compare_at_price > product.price -%}
        <p class="compare-price">{{ product.compare_at_price | money }}</p>
      {%- endif -%}
    </a>
  {%- endfor -%}
</div>
```

## フィルタ表示

```liquid
{%- for filter in collection.filters -%}
  <fieldset>
    <legend>{{ filter.label }}</legend>
    {%- for value in filter.values -%}
      <label>
        <input type="checkbox" name="{{ value.param_name }}" value="{{ value.value }}" {%- if value.active -%}checked{%- endif -%}>
        {{ value.label }} ({{ value.count }})
      </label>
    {%- endfor -%}
  </fieldset>
{%- endfor -%}
```

## current_tags（タグフィルタ）

```liquid
{%- if current_tags.size > 0 -%}
  <p>絞り込み中：
    {%- for tag in current_tags -%}
      <a href="{{ collection.url }}">×{{ tag }}</a>
    {%- endfor -%}
  </p>
{%- endif -%}
```

## チェックリスト

- [ ] `collection.metafields.custom.intro_short` を上部に出力
- [ ] `collection.metafields.custom.intro_long` を下部に出力（`metafield_tag` で）
- [ ] paginate で適切なページサイズ（24-48が一般的）
- [ ] フィルタが filter.values の active 状態で表示
- [ ] 商品 alt が `product.featured_image.alt` から取得
- [ ] compare_at_price > price のセール表示
