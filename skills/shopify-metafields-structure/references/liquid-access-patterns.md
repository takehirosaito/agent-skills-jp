# Liquid 呼び出し・空欄処理

Shopify テーマで metafield を出力する Liquid パターン集。

## 基本構文

```liquid
{{ <resource>.metafields.<namespace>.<key> }}
```

例：
```liquid
{{ product.metafields.custom.material }}
{{ collection.metafields.custom.banner_image }}
{{ customer.metafields.custom.member_rank }}
```

## 空欄チェック

**必ず `!= blank` でガードする**。空欄でも HTML を出してしまうと、テーマで「素材：」だけ表示されて意味不明な見た目になる。

```liquid
{%- if product.metafields.custom.material != blank -%}
  <p>素材：{{ product.metafields.custom.material }}</p>
{%- endif -%}
```

## 型別の出力パターン

### text系（single_line / multi_line）

```liquid
{{ product.metafields.custom.material }}
{{ product.metafields.custom.description | newline_to_br }}
```

### rich_text_field

```liquid
{{ product.metafields.custom.how_to_use | metafield_tag }}
```

`metafield_tag` フィルタが必須。これを通さないと内部のJSON構造がそのまま見える。

### number_integer / number_decimal

```liquid
{{ product.metafields.custom.shelf_life_months }}ヶ月

{{ product.metafields.custom.weight_g | round: 1 }}g
```

### boolean

```liquid
{%- if product.metafields.custom.is_gift_wrappable -%}
  <span class="badge">ギフトラッピング対応</span>
{%- endif -%}
```

### date / date_time

```liquid
{{ product.metafields.custom.release_date | date: "%Y年%m月%d日" }}
```

### weight / volume / dimension

```liquid
{%- assign w = product.metafields.custom.net_weight.value -%}
{{ w.value }}{{ w.unit }}

{%- comment -%}例：100g, 500ml, 25cm{%- endcomment -%}
```

### color

```liquid
<span style="background:{{ product.metafields.custom.brand_color }}"></span>
```

### url

```liquid
<a href="{{ product.metafields.custom.video_url }}" target="_blank" rel="noopener">動画を見る</a>
```

### json

```liquid
{%- assign chart = product.metafields.custom.size_chart.value -%}
<table>
  {%- for size in chart -%}
    <tr><th>{{ size[0] }}</th><td>{{ size[1] }}</td></tr>
  {%- endfor -%}
</table>
```

JSON が配列なら `for ... in`、オブジェクトなら hash として `size[0]` / `size[1]` で key/value 取得。

### file_reference

```liquid
{%- assign file = product.metafields.custom.size_guide_pdf.value -%}
{%- if file.url -%}
  <a href="{{ file.url }}" target="_blank">サイズガイド PDF</a>
{%- endif -%}
```

画像ファイル：
```liquid
{%- assign img = product.metafields.custom.lifestyle_image.value -%}
<img src="{{ img | image_url: width: 800 }}" alt="{{ img.alt }}">
```

### product_reference / variant_reference

```liquid
{%- assign related = product.metafields.custom.recommended_product.value -%}
<a href="{{ related.url }}">{{ related.title }}</a>
```

### list.product_reference（list変種）

```liquid
{%- for p in product.metafields.custom.related_products.value -%}
  <a href="{{ p.url }}">
    <img src="{{ p.featured_image | image_url: width: 200 }}">
    {{ p.title }}
  </a>
{%- endfor -%}
```

### metaobject_reference

```liquid
{%- assign brand = product.metafields.custom.brand.value -%}
<h3>{{ brand.name }}</h3>
<p>{{ brand.story }}</p>
<img src="{{ brand.logo | image_url: width: 200 }}">
```

### list.metaobject_reference（FAQ など）

```liquid
{%- assign faq_items = product.metafields.custom.faq.value -%}
{%- if faq_items != blank -%}
  <dl class="faq">
    {%- for item in faq_items -%}
      <dt>Q. {{ item.question }}</dt>
      <dd>A. {{ item.answer | metafield_tag }}</dd>
    {%- endfor -%}
  </dl>
{%- endif -%}
```

## metafield_tag フィルタ

汎用フィルタ：型に応じて自動でHTMLを生成する。

```liquid
{{ product.metafields.custom.material | metafield_tag }}
```

出力例：

| 型 | 出力 |
|---|---|
| single_line_text_field | プレーンテキスト |
| rich_text_field | HTML |
| file_reference（画像） | `<img>` |
| file_reference（PDF） | `<a>` |
| url | `<a>` |
| product_reference | `<a>` |
| color | `<span style="background:...">` |
| rating | 数値＋スケール |

→ 簡易表示は `metafield_tag` で済む。フルカスタマイズは型ごとに個別Liquid。

## 安全なネスト出力

```liquid
{%- assign mf = product.metafields.custom.brand -%}
{%- if mf.value != blank -%}
  {%- assign brand = mf.value -%}
  {%- if brand.name != blank -%}
    <span>ブランド：{{ brand.name }}</span>
  {%- endif -%}
{%- endif -%}
```

参照型は **3段階チェック**：
1. metafield 自体の有無
2. 参照先リソースの有無
3. リソースの個別フィールドの有無

## カート・チェックアウト・メールへの引き継ぎ

商品ページの metafield は **カート・チェックアウト・注文に自動では引き継がれない**。

引き継ぎ方法：

1. **line item property**：チェックアウトに渡すには `properties[_xxx]` で送る
2. **Liquid email template**：注文メールでは `{{ line.product.metafields.custom.xxx }}` で再取得可
3. **Order metafield**：注文単位の情報（ギフトメッセージ等）は `order.metafields` で別途設定

## デバッグ

JSONダンプで全 metafield を確認：

```liquid
<pre>{{ product.metafields | json }}</pre>
```

特定 namespace のみ：

```liquid
<pre>{{ product.metafields.custom | json }}</pre>
```

## チェックリスト

- [ ] 全 metafield 出力箇所に `!= blank` チェックあり
- [ ] `rich_text_field` は `metafield_tag` 経由
- [ ] 参照型は 3段階の存在チェック
- [ ] weight / volume / dimension は `.value.value` `.value.unit`
- [ ] file_reference の image は `image_url` フィルタ
- [ ] list 変種は `for ... in metafield.value`
