# Block 設計

Section 内に繰り返し配置できる単位が **block**。マーチャントが管理画面で追加・並び替え・削除できる。

## block の基本構造

```json
{
  "blocks": [
    {
      "type": "feature_item",
      "name": "特徴項目",
      "limit": 6,
      "settings": [
        { "type": "image_picker", "id": "image", "label": "画像" },
        { "type": "text", "id": "title", "label": "タイトル" }
      ]
    }
  ],
  "max_blocks": 6
}
```

| 属性 | 必須 | 内容 |
|---|---|---|
| `type` | ✅ | block識別子（英数アンダースコア） |
| `name` | ✅ | 管理画面表示名 |
| `settings` | - | block固有のsettings配列 |
| `limit` | - | この type の最大数（block単位） |

## section レベルの設定

| 属性 | 内容 |
|---|---|
| `max_blocks` | section全体の block 総数上限 |
| `blocks` | block 定義の配列 |

## 複数 type の block

1つのsection内で複数 type の block を扱える：

```json
{
  "blocks": [
    { "type": "heading", "name": "見出し", "settings": [{"type": "text", "id": "title", "label": "見出し"}] },
    { "type": "text", "name": "本文", "settings": [{"type": "richtext", "id": "body", "label": "本文"}] },
    { "type": "image", "name": "画像", "settings": [{"type": "image_picker", "id": "img", "label": "画像"}] },
    { "type": "@app", "name": "アプリブロック" }
  ],
  "max_blocks": 20
}
```

`@app` は **Theme App Extension の block** を受け入れる宣言。アプリが提供する block をマーチャントが追加可能になる。

## block の Liquid 出力

```liquid
{%- for block in section.blocks -%}
  <div {{ block.shopify_attributes }}>
    {%- case block.type -%}
      {%- when 'heading' -%}
        <h3>{{ block.settings.title }}</h3>
      {%- when 'text' -%}
        <div>{{ block.settings.body }}</div>
      {%- when 'image' -%}
        {%- if block.settings.img != blank -%}
          <img src="{{ block.settings.img | image_url: width: 800 }}" alt="{{ block.settings.img.alt }}" loading="lazy">
        {%- endif -%}
      {%- when '@app' -%}
        {%- render block -%}
    {%- endcase -%}
  </div>
{%- endfor -%}
```

### shopify_attributes の重要性

`{{ block.shopify_attributes }}` を block の wrapper に付けると：

- Theme Editor で block にカーソル/クリックすると **対応する設定パネルが開く**
- 編集→保存→**該当 block のみ再レンダリング**（ページ全体リロード不要）

これを忘れると Theme Editor の編集体験が大幅に悪化する。

## block ごとの limit と section の max_blocks

```json
{
  "blocks": [
    { "type": "feature", "name": "特徴", "limit": 3 },
    { "type": "testimonial", "name": "お客様の声", "limit": 5 }
  ],
  "max_blocks": 8
}
```

- `feature` は最大3個
- `testimonial` は最大5個
- 全体合計は最大8個

## Theme Blocks（Online Store 2.0 の新機能）

最新の Online Store 2.0 では **section に依存しない theme block**（再利用可能 block）も定義可能。section に `"blocks": [{"type": "@theme"}]` で受け入れる。

詳細仕様はShopify dev docs「Theme blocks」を参照。

## 設計のベストプラクティス

### 1. block 数は意味のある上限を

- 無制限：パフォーマンス問題、編集UI破綻
- 3-6個：一般的な特徴／テスティモニアル
- 10-20個：FAQ／メニューリスト
- 50以上：考え直す（多分セクションを分けるべき）

### 2. block 内の settings は5-10個まで

それ以上だと管理画面の編集パネルがスクロール地獄。設定が多いなら：
- block を type で分割
- header / paragraph で UI 区切り
- 上級設定を Metaobject 化

### 3. block の preset で初期配置を埋める

```json
"presets": [
  {
    "name": "デフォルト（3カラム）",
    "blocks": [
      {
        "type": "feature_item",
        "settings": {
          "title": "高品質",
          "body": "<p>厳選素材を使用</p>"
        }
      },
      { "type": "feature_item", "settings": {"title": "送料無料"} },
      { "type": "feature_item", "settings": {"title": "30日返品"} }
    ]
  }
]
```

マーチャントが追加した瞬間「何かが表示される」状態にする。

### 4. 空 block で崩壊しない

```liquid
{%- if block.settings.image != blank -%}
  <img ...>
{%- else -%}
  {%- comment -%}画像なし時のフォールバック（プレースホルダー画像 or 非表示）{%- endcomment -%}
  {{ 'product-1' | placeholder_svg_tag: 'placeholder-svg' }}
{%- endif -%}
```

### 5. App Block 対応

トップページや商品ページで App Block を受け入れるなら：

```json
"blocks": [
  { "type": "@app" }
]
```

または OS 2.0 の theme blocks では：

```liquid
{% content_for 'blocks' %}
```

## 並び順とドラッグ&ドロップ

管理画面で block を上下にドラッグして並び替え可能。Liquid 側では `for block in section.blocks` で **管理画面の並び順そのまま** ループされる。

## block ID

各 block は内部的に `block.id` を持つ。CSS／JS のターゲティングに使える：

```liquid
<div id="block-{{ block.id }}" {{ block.shopify_attributes }}>
```

ID は section 保存時に自動付与され、block を削除→再追加すると別 ID になる。

## チェックリスト

- [ ] block の `type` が一意（同 section 内）
- [ ] `max_blocks` が明示
- [ ] block ごとの `limit` が必要なら設定
- [ ] `shopify_attributes` が wrapper に付いている
- [ ] 空 block でレイアウト崩壊しない
- [ ] preset で初期 block が埋め込み済み
- [ ] App Block を受け入れるなら `@app` を含む
