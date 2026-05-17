# Section ブリーフ実例集

## 例1：3カラム特徴セクション

### 要望
トップページに「商品の3つの特徴」を並べたい。各特徴に画像＋見出し＋本文＋（任意）CTA。スマホは縦並び。

### schema 設計

```json
{
  "name": "商品の特徴（3カラム）",
  "tag": "section",
  "class": "section-features",
  "settings": [
    { "type": "text", "id": "heading", "label": "セクション見出し", "default": "私たちの3つの特徴" },
    { "type": "textarea", "id": "subheading", "label": "補足説明" },
    { "type": "color_scheme", "id": "color_scheme", "label": "カラースキーム", "default": "background-1" },
    { "type": "range", "id": "padding_top", "label": "上余白", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 60 },
    { "type": "range", "id": "padding_bottom", "label": "下余白", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 60 }
  ],
  "blocks": [
    {
      "type": "feature_item",
      "name": "特徴項目",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "画像" },
        { "type": "text", "id": "title", "label": "タイトル" },
        { "type": "richtext", "id": "body", "label": "本文" },
        { "type": "text", "id": "link_label", "label": "リンクラベル" },
        { "type": "url", "id": "link_url", "label": "リンクURL" }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [
    {
      "name": "3カラム（デフォルト）",
      "blocks": [
        { "type": "feature_item", "settings": { "title": "高品質素材" } },
        { "type": "feature_item", "settings": { "title": "送料無料" } },
        { "type": "feature_item", "settings": { "title": "30日返品" } }
      ]
    }
  ],
  "enabled_on": { "templates": ["*"] }
}
```

### Liquid

```liquid
<section class="section-features color-{{ section.settings.color_scheme }}"
         style="padding-top:{{ section.settings.padding_top }}px; padding-bottom:{{ section.settings.padding_bottom }}px;">
  {%- if section.settings.heading != blank -%}
    <h2>{{ section.settings.heading }}</h2>
  {%- endif -%}
  {%- if section.settings.subheading != blank -%}
    <p>{{ section.settings.subheading }}</p>
  {%- endif -%}
  <div class="features-grid">
    {%- for block in section.blocks -%}
      <article class="feature-item" {{ block.shopify_attributes }}>
        {%- if block.settings.image != blank -%}
          <img src="{{ block.settings.image | image_url: width: 600 }}" alt="{{ block.settings.image.alt }}" loading="lazy">
        {%- endif -%}
        {%- if block.settings.title != blank -%}<h3>{{ block.settings.title }}</h3>{%- endif -%}
        {%- if block.settings.body != blank -%}<div>{{ block.settings.body }}</div>{%- endif -%}
        {%- if block.settings.link_url != blank -%}
          <a href="{{ block.settings.link_url }}">{{ block.settings.link_label | default: 'もっと見る' }}</a>
        {%- endif -%}
      </article>
    {%- endfor -%}
  </div>
</section>
```

---

## 例2：FAQ アコーディオン

### 要望
商品ページ・固定ページに FAQ をアコーディオン形式で表示。

### schema 設計

```json
{
  "name": "FAQ（アコーディオン）",
  "tag": "section",
  "class": "section-faq",
  "settings": [
    { "type": "text", "id": "heading", "label": "見出し", "default": "よくあるご質問" }
  ],
  "blocks": [
    {
      "type": "faq_item",
      "name": "FAQ項目",
      "settings": [
        { "type": "text", "id": "question", "label": "質問" },
        { "type": "richtext", "id": "answer", "label": "回答" }
      ]
    }
  ],
  "max_blocks": 20,
  "presets": [
    { "name": "FAQ", "blocks": [{ "type": "faq_item" }, { "type": "faq_item" }, { "type": "faq_item" }] }
  ],
  "enabled_on": { "templates": ["product", "page"] }
}
```

### アクセシビリティ要件
- `<details>` / `<summary>` ネイティブ要素を使う（JS不要、キーボード対応）
- または `button` + `aria-expanded` + JS 制御

### Liquid（ネイティブ）

```liquid
<section class="section-faq">
  <h2>{{ section.settings.heading }}</h2>
  {%- for block in section.blocks -%}
    <details {{ block.shopify_attributes }}>
      <summary>{{ block.settings.question }}</summary>
      <div>{{ block.settings.answer }}</div>
    </details>
  {%- endfor -%}
</section>
```

---

## 例3：ロゴカルーセル（提携メディア・受賞）

### 要望
受賞ロゴ／提携メディアロゴを横スクロールで表示。

### schema 設計

```json
{
  "name": "ロゴカルーセル",
  "settings": [
    { "type": "text", "id": "heading", "label": "見出し" },
    { "type": "checkbox", "id": "autoplay", "label": "自動再生", "default": true },
    { "type": "range", "id": "speed", "label": "速度（秒）", "min": 5, "max": 60, "step": 5, "unit": "s", "default": 30 },
    { "type": "checkbox", "id": "grayscale", "label": "グレースケール表示", "default": false }
  ],
  "blocks": [
    {
      "type": "logo",
      "name": "ロゴ",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "ロゴ画像" },
        { "type": "url", "id": "link", "label": "リンク先（任意）" }
      ]
    }
  ],
  "max_blocks": 30,
  "presets": [
    { "name": "ロゴカルーセル", "blocks": [{"type":"logo"},{"type":"logo"},{"type":"logo"},{"type":"logo"}] }
  ]
}
```

### 性能要件
- 無限ループは CSS animation で実装（JS不要）
- 画像は WebP 推奨
- カルーセル要素以外に影響しないスコープ

---

## 例4：おすすめ商品リスト（手動指定）

### 要望
商品ページに「この商品を見た人へのおすすめ」を手動指定の4商品で表示。

### schema 設計

```json
{
  "name": "おすすめ商品（手動）",
  "settings": [
    { "type": "text", "id": "heading", "label": "見出し", "default": "あわせて見たい商品" },
    {
      "type": "product_list",
      "id": "products",
      "label": "おすすめ商品",
      "limit": 8
    }
  ],
  "presets": [
    { "name": "おすすめ商品" }
  ],
  "enabled_on": { "templates": ["product"] }
}
```

### Liquid

```liquid
<section>
  <h2>{{ section.settings.heading }}</h2>
  <div class="product-grid">
    {%- for product in section.settings.products -%}
      <a href="{{ product.url }}">
        <img src="{{ product.featured_image | image_url: width: 400 }}" alt="{{ product.featured_image.alt }}" loading="lazy">
        <h3>{{ product.title }}</h3>
        <p>{{ product.price | money }}</p>
      </a>
    {%- endfor -%}
  </div>
</section>
```

---

## 例5：ブランドストーリー（縦長）

### 要望
ブランド創業ストーリーを縦長レイアウトで表示。画像＋文章を交互配置。

### schema 設計

```json
{
  "name": "ブランドストーリー",
  "settings": [
    { "type": "text", "id": "heading", "label": "セクション見出し" }
  ],
  "blocks": [
    {
      "type": "story_block",
      "name": "ストーリーブロック",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "画像" },
        {
          "type": "select", "id": "image_position", "label": "画像位置",
          "options": [
            { "value": "left", "label": "左" },
            { "value": "right", "label": "右" }
          ],
          "default": "left"
        },
        { "type": "text", "id": "title", "label": "見出し" },
        { "type": "richtext", "id": "body", "label": "本文" }
      ]
    }
  ],
  "max_blocks": 10,
  "presets": [
    { "name": "ブランドストーリー", "blocks": [
      { "type": "story_block", "settings": { "image_position": "left" } },
      { "type": "story_block", "settings": { "image_position": "right" } },
      { "type": "story_block", "settings": { "image_position": "left" } }
    ]}
  ]
}
```

### レスポンシブ
- PC：画像と文章が左右に並ぶ
- モバイル：画像が常に上、文章が下（`image_position` 無視）
