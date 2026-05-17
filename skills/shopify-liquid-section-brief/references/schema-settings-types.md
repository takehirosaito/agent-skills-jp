# schema settings 型 完全リスト

Shopify Section / Block の `{% schema %}` で使える `settings` の型一覧。

## 基本属性（全型共通）

| 属性 | 必須 | 内容 |
|---|---|---|
| `type` | ✅ | 型名 |
| `id` | ✅（input型）| Liquid 参照用ID、英数アンダースコア |
| `label` | ✅（input型）| 管理画面ラベル |
| `default` | - | 初期値 |
| `info` | - | 補足説明（管理画面） |

## input 型一覧

### テキスト系

| type | 用途 | 追加attr |
|---|---|---|
| `text` | 1行テキスト | `placeholder` |
| `textarea` | 複数行テキスト | `placeholder` |
| `richtext` | リッチテキスト（HTML） | - |
| `inline_richtext` | インライン簡易リッチ | - |
| `html` | 任意のHTML（生埋込） | `placeholder` |
| `liquid` | 任意のLiquid（生埋込） | - |

### 数値系

| type | 用途 | 追加attr |
|---|---|---|
| `number` | 数値入力 | `placeholder` |
| `range` | スライダー | `min`, `max`, `step`, `unit` |

`range` 例：
```json
{
  "type": "range",
  "id": "padding_top",
  "label": "上の余白",
  "min": 0, "max": 100, "step": 4, "unit": "px",
  "default": 40
}
```

### 真偽・選択

| type | 用途 | 追加attr |
|---|---|---|
| `checkbox` | ON/OFF | - |
| `radio` | 単一選択（ラジオUI） | `options: [{value, label}]` |
| `select` | 単一選択（プルダウン） | `options: [{value, label, group?}]` |

`select` 例：
```json
{
  "type": "select",
  "id": "layout",
  "label": "レイアウト",
  "options": [
    {"value": "left", "label": "左寄せ"},
    {"value": "center", "label": "中央"},
    {"value": "right", "label": "右寄せ"}
  ],
  "default": "center"
}
```

### 色・スタイル

| type | 用途 | 追加attr |
|---|---|---|
| `color` | 単色HEX | - |
| `color_scheme` | カラースキーム参照 | - |
| `color_scheme_group` | スキームグループ | - |
| `color_background` | 背景色（パターン含む） | - |
| `font_picker` | フォント | `default` (フォントID) |

`color_scheme` はテーマ全体で定義されたスキーム（Background / Text / Button等のセット）を参照。個別 `color` より整合性を保てる。

### メディア

| type | 用途 | 追加attr |
|---|---|---|
| `image_picker` | 画像（Shopify Filesから選択） | - |
| `video` | 動画ファイル（Files） | - |
| `video_url` | 外部動画URL | `accept: ["youtube", "vimeo"]` |

`image_picker` の値は image オブジェクト：
```liquid
{{ section.settings.image | image_url: width: 1200 }}
{{ section.settings.image.alt }}
```

### URL・リンク

| type | 用途 | 追加attr |
|---|---|---|
| `url` | URL（内部／外部） | - |
| `link_list` | メニュー参照（ナビ） | - |

### リソース参照

| type | 用途 |
|---|---|
| `product` | 単一商品 |
| `product_list` | 複数商品（最大50） |
| `collection` | 単一コレクション |
| `collection_list` | 複数コレクション |
| `blog` | ブログ |
| `article` | 記事 |
| `page` | ページ |

参照型の値は対応するLiquidオブジェクトとして展開される：
```liquid
{%- assign featured = section.settings.featured_product -%}
<a href="{{ featured.url }}">{{ featured.title }}</a>
```

### Metaobject

| type | 用途 | 追加attr |
|---|---|---|
| `metaobject` | 単一Metaobject | `metaobject_type: "<type>"` |
| `metaobject_list` | 複数Metaobject | `metaobject_type: "<type>"`, `limit` |

例：
```json
{
  "type": "metaobject_list",
  "id": "team_members",
  "label": "チームメンバー",
  "metaobject_type": "team_member",
  "limit": 12
}
```

### UI 補助（input ではない）

| type | 用途 |
|---|---|
| `header` | 管理画面の見出し（区切り） |
| `paragraph` | 管理画面の説明文 |

`header` / `paragraph` は **`id` を持たない**。`content` のみ：
```json
{ "type": "header", "content": "デザイン設定" }
{ "type": "paragraph", "content": "以下はモバイルでのみ表示されます。" }
```

### 上級

| type | 用途 |
|---|---|
| `style.layout_panel` | レイアウトパネル統合 |
| `style.size_panel` | サイズパネル統合 |
| `style.padding_panel` | 余白パネル統合 |

これらは Online Store 2.0 の新パネル機能で、複数の関連設定を1つのパネルにまとめる。

## バリデーション

| 属性 | 適用型 | 内容 |
|---|---|---|
| `min` / `max` | number, range | 最小／最大値 |
| `step` | range | 刻み |
| `unit` | range | 単位表記 |
| `placeholder` | text, textarea, html | プレースホルダー |
| `default` | 多くの型 | 初期値 |
| `info` | 全input型 | 説明文 |
| `accept` | video_url | 受け入れる動画プラットフォーム |
| `metaobject_type` | metaobject, metaobject_list | 参照Metaobject type |
| `limit` | metaobject_list, product_list 等 | 最大数 |

## 条件付き表示（visible_if）

Online Store 2.0 で追加。他の setting の値に応じて表示／非表示：

```json
{
  "type": "checkbox",
  "id": "show_button",
  "label": "ボタンを表示",
  "default": true
},
{
  "type": "text",
  "id": "button_label",
  "label": "ボタンテキスト",
  "visible_if": "{{ section.settings.show_button }}"
}
```

## category（管理画面のグルーピング）

```json
"category": "promotional"
```

セクション一覧の中で「プロモーション」「商品」「マルチメディア」などのカテゴリで表示。

## tag・class

```json
"tag": "section",
"class": "my-custom-section"
```

セクションの HTML wrapper の tag / class を指定。`tag` は section / div / article などHTML5要素を選べる。

## 完全な schema 例

```liquid
{% schema %}
{
  "name": "商品の特徴（3カラム）",
  "tag": "section",
  "class": "section-features",
  "settings": [
    { "type": "header", "content": "セクション全体" },
    { "type": "text", "id": "heading", "label": "見出し", "default": "私たちの3つの特徴" },
    { "type": "textarea", "id": "subheading", "label": "補足説明" },
    { "type": "color_scheme", "id": "color_scheme", "label": "カラースキーム", "default": "background-1" },
    { "type": "header", "content": "余白" },
    { "type": "range", "id": "padding_top", "label": "上余白", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 60 },
    { "type": "range", "id": "padding_bottom", "label": "下余白", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 60 }
  ],
  "blocks": [...],
  "max_blocks": 6,
  "presets": [...],
  "enabled_on": {
    "templates": ["*"]
  }
}
{% endschema %}
```
