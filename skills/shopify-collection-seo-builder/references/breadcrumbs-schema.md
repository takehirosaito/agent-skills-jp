# BreadcrumbList Schema

コレクションページ・商品ページのパンくずを JSON-LD で出力。Google の SERP でパンくず表示が出やすくなる。

## 基本構造

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "スキンケア",
      "item": "https://example.com/collections/skincare"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "敏感肌向け美容液",
      "item": "https://example.com/collections/sensitive-skin-serum"
    }
  ]
}
```

## Liquid 実装（コレクション）

```liquid
{%- if template contains 'collection' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "{{ shop.url }}/"
    },
    {%- if collection.metafields.custom.parent_collection.value -%}
    {%- assign parent = collection.metafields.custom.parent_collection.value -%}
    {
      "@type": "ListItem",
      "position": 2,
      "name": {{ parent.title | json }},
      "item": "{{ shop.url }}{{ parent.url }}"
    },
    {%- endif -%}
    {
      "@type": "ListItem",
      "position": {%- if collection.metafields.custom.parent_collection.value -%}3{%- else -%}2{%- endif -%},
      "name": {{ collection.title | json }},
      "item": "{{ shop.url }}{{ collection.url }}"
    }
  ]
}
</script>
{%- endif -%}
```

## Liquid 実装（商品ページ）

```liquid
{%- if template contains 'product' -%}
{%- assign primary_collection = collection -%}
{%- if primary_collection == blank -%}
  {%- assign primary_collection = product.collections.first -%}
{%- endif -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "{{ shop.url }}/" },
    {%- if primary_collection -%}
    { "@type": "ListItem", "position": 2, "name": {{ primary_collection.title | json }}, "item": "{{ shop.url }}{{ primary_collection.url }}" },
    {%- endif -%}
    { "@type": "ListItem", "position": {%- if primary_collection -%}3{%- else -%}2{%- endif -%}, "name": {{ product.title | json }}, "item": "{{ shop.url }}{{ product.url }}" }
  ]
}
</script>
{%- endif -%}
```

## 画面表示用パンくず

```liquid
<nav aria-label="パンくず" class="breadcrumb">
  <ol>
    <li><a href="/">ホーム</a></li>
    {%- if collection -%}
      <li><a href="{{ collection.url }}">{{ collection.title }}</a></li>
    {%- endif -%}
    {%- if template contains 'product' -%}
      <li aria-current="page">{{ product.title }}</li>
    {%- elsif template contains 'collection' -%}
      <li aria-current="page">{{ collection.title }}</li>
    {%- endif -%}
  </ol>
</nav>
```

## マルチコレクション所属の問題

商品が複数コレクションに所属する場合、`product.collections` は配列で順序が一定でない：

```liquid
{%- assign primary_collection = product.collections | sort: 'title' | first -%}
```

→ ソート順を明示すれば毎回同じ結果。または **Metafield で代表コレクションを指定**：

```liquid
{%- assign primary_collection = product.metafields.custom.primary_collection.value -%}
```

## 多階層パンくず

化粧品ストアで：

```
ホーム > スキンケア > 美容液 > 敏感肌向け美容液 > 商品名
```

このような4階層以上は `parent_collection` を辿る再帰が必要。Liquid では再帰できないため、**Metaobject `category_node` を作って親子関係を持つ** か、**collection の handle に階層情報を埋め込む**（`skincare-serum-sensitive`）など工夫が必要。

## チェックリスト

- [ ] BreadcrumbList schema が JSON-LD で出力されている
- [ ] `position` が 1 から連番
- [ ] `item` URL が絶対URL（`shop.url` + 相対URL）
- [ ] 画面表示用 `<nav aria-label="パンくず">` で支援技術対応
- [ ] マルチコレクション所属時の代表コレクション選定ロジック
- [ ] Google「リッチリザルトテスト」で警告ゼロ
