# Presets と Default

`presets` は section を「セクションを追加」メニューに登録するためのエントリ。マーチャントが選んだ瞬間の **初期配置・初期値** を定義する。

## 基本形

```json
"presets": [
  {
    "name": "3カラム（デフォルト）",
    "settings": {
      "heading": "私たちの3つの特徴",
      "subheading": "厳選素材と熟練の技術"
    },
    "blocks": [
      {
        "type": "feature_item",
        "settings": {
          "title": "高品質",
          "body": "<p>厳選素材</p>"
        }
      },
      { "type": "feature_item", "settings": {"title": "送料無料"} },
      { "type": "feature_item", "settings": {"title": "30日返品"} }
    ]
  }
]
```

| 属性 | 内容 |
|---|---|
| `name` | 「セクションを追加」一覧での表示名 |
| `category` | カテゴリ（任意、`promotional` / `product` 等） |
| `settings` | section settings の初期値 |
| `blocks` | 初期 block の配列 |

## 複数 preset

同じ section で複数の初期配置パターンを提供できる：

```json
"presets": [
  {
    "name": "3カラム",
    "blocks": [
      { "type": "feature_item" },
      { "type": "feature_item" },
      { "type": "feature_item" }
    ]
  },
  {
    "name": "2カラム（画像強調）",
    "settings": { "layout": "image_focused" },
    "blocks": [
      { "type": "feature_item" },
      { "type": "feature_item" }
    ]
  }
]
```

→ マーチャントは「セクションを追加」で **「3カラム」と「2カラム」を別物として選べる**。

## default vs preset

| 用途 | default | preset |
|---|---|---|
| settings 単位の初期値 | ✅ 個別 settings の `default` | - |
| section 追加時の一括埋め | - | ✅ |
| block の初期配置 | - | ✅ |

→ 両方使うのが基本。`default` は settings 個別の初期値、`preset` は「追加時にこのパターンで配置」のテンプレ。

## preset の `settings` の上書き優先度

1. 各 setting の `default`（schema 上）
2. preset 内の `settings`（preset 選択時に上書き）
3. マーチャントが手動編集（最終値）

## category（preset のカテゴリ）

セクション追加ダイアログで preset をグルーピング：

```json
"presets": [
  {
    "name": "ヒーロー（フルワイド）",
    "category": "promotional"
  },
  {
    "name": "商品リスト",
    "category": "product"
  }
]
```

カテゴリ例：
- `promotional`：プロモーション系
- `product`：商品系
- `text`：テキスト系
- `multimedia`：マルチメディア
- `store_information`：店舗情報

## enabled_on / disabled_on（配置制限）

特定テンプレートでのみ／除外して配置：

```json
"enabled_on": {
  "templates": ["index", "product"],
  "groups": ["header", "footer"]
}
```

```json
"disabled_on": {
  "templates": ["password"],
  "groups": ["aside"]
}
```

| 属性 | 内容 |
|---|---|
| `templates` | テンプレート名（index, product, collection, page, blog, article, search, 404, password 等） |
| `groups` | header, footer, aside, customers などのセクショングループ |

全テンプレート対応：

```json
"enabled_on": {
  "templates": ["*"]
}
```

## section group 経由の配置

Online Store 2.0 では `header` / `footer` などの section group に section を配置することも可能。`enabled_on.groups: ["header"]` で対応宣言する。

## 既存ページへの反映

⚠️ **preset の変更は既存ページに反映されない**。

- section を追加した時点で preset の内容がコピーされる
- 後から preset を変更しても、既存の section インスタンスは変わらない
- 既存ページに変更を反映するには **テンプレ JSON を直接編集** or **手動で section 再追加**

## 限定セクション・テンプレ専用 section

商品ページ専用にしたい場合：

```json
"enabled_on": {
  "templates": ["product"]
}
```

→ トップページやその他のテンプレで「セクションを追加」一覧に出てこない。

## マーチャント編集UX の設計

1. **preset の名前は具体的に**：「3カラム」「2カラム画像強調」など、見た目で選べる
2. **preset の数は3-5個まで**：それ以上は選びにくい
3. **`category` で適切に分類**：見つけやすさが向上
4. **`enabled_on` で誤配置を防ぐ**：商品ページ専用 section をトップに置けないように

## チェックリスト

- [ ] preset が最低1つ存在
- [ ] preset の name がマーチャントにわかりやすい
- [ ] preset 内に初期 block / settings が入っている
- [ ] `category` が指定されている（任意だが推奨）
- [ ] `enabled_on` / `disabled_on` で配置可能テンプレを明示
- [ ] preset 変更後の既存ページ反映方針を運用ドキュメントに記載
