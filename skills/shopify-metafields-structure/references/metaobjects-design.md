# Metaobjects 設計

Metafield が「リソースに紐づく属性」なのに対し、Metaobject は **独立したカスタムエンティティ** を作る仕組み。複数の商品・コレクションから参照される再利用エンティティを定義できる。

## いつ Metaobject を使うか

| ケース | Metafield | Metaobject |
|---|---|---|
| 商品の素材1行 | ✅ | △（過剰） |
| 商品のFAQ（3-10件） | △（json で詰め込めるが運用しにくい） | ✅ |
| ブランド情報（複数商品で共通） | △（毎商品コピー必要） | ✅ |
| 店舗情報（複数取扱い店舗） | △ | ✅ |
| サイズ表（複数商品で共通フォーマット） | ✅（json） | ✅（再利用するなら） |
| 著者情報（ブログで共通） | △ | ✅ |
| イベント情報 | △ | ✅ |

**判定基準**：「同じ構造を複数の商品／ページで参照するか」「フィールド数が3つ以上か」が Yes なら Metaobject。

## Metaobject の構成

```
Metaobject Type
└── Fields（複数）
    ├── field name 1（型）
    ├── field name 2（型）
    └── ...
└── Entries（実データ）
    ├── Entry 1
    ├── Entry 2
    └── ...
```

各フィールドは Metafield と同じ型から選択できる。

## 設計パターン

### パターン1：FAQ アイテム

**Metaobject type**：`faq_item`

| フィールド | 型 | 必須 |
|---|---|---|
| `question` | `single_line_text_field` | ✅ |
| `answer` | `rich_text_field` | ✅ |
| `category` | `single_line_text_field`（choices: 配送/返品/商品/その他） | - |

**商品から参照**：

```
Product metafield: custom.faq
  Type: list.metaobject_reference
  Reference: faq_item
```

**Liquid 呼び出し**：

```liquid
{%- for item in product.metafields.custom.faq.value -%}
  <dt>{{ item.question }}</dt>
  <dd>{{ item.answer | metafield_tag }}</dd>
{%- endfor -%}
```

### パターン2：ブランド情報

**Metaobject type**：`brand`

| フィールド | 型 |
|---|---|
| `name` | single_line_text_field |
| `logo` | file_reference（画像のみ） |
| `story` | rich_text_field |
| `country` | single_line_text_field |
| `founded_year` | number_integer |
| `website` | url |

**商品から参照**：

```
Product metafield: custom.brand
  Type: metaobject_reference
  Reference: brand
```

複数商品が同じブランド entry を参照することで **ブランド情報の一元管理** が可能。

### パターン3：店舗情報（実店舗）

**Metaobject type**：`store_location`

| フィールド | 型 |
|---|---|
| `name` | single_line_text_field |
| `address` | multi_line_text_field |
| `postal_code` | single_line_text_field（regex: `^\d{3}-\d{4}$`） |
| `phone` | single_line_text_field |
| `opening_hours` | rich_text_field |
| `map_url` | url |
| `image` | file_reference |
| `is_active` | boolean |

ページ `/pages/stores` から参照：

```
Page metafield: custom.locations
  Type: list.metaobject_reference
  Reference: store_location
```

### パターン4：イベント・キャンペーン

**Metaobject type**：`campaign`

| フィールド | 型 |
|---|---|
| `title` | single_line_text_field |
| `description` | rich_text_field |
| `start_date` | date_time |
| `end_date` | date_time |
| `banner_image` | file_reference |
| `landing_page_url` | url |
| `target_products` | list.product_reference |

トップページから「現在開催中」を絞り込み：

```liquid
{%- assign now = 'now' | date: '%s' -%}
{%- for campaign in shop.metaobjects.campaign.values -%}
  {%- assign start = campaign.start_date | date: '%s' -%}
  {%- assign end = campaign.end_date | date: '%s' -%}
  {%- if now >= start and now <= end -%}
    {%- comment -%}表示{%- endcomment -%}
  {%- endif -%}
{%- endfor -%}
```

### パターン5：レビュー（自社管理）

**Metaobject type**：`product_review`

| フィールド | 型 |
|---|---|
| `product` | product_reference |
| `customer_name` | single_line_text_field |
| `rating` | rating（1-5） |
| `title` | single_line_text_field |
| `body` | multi_line_text_field |
| `reviewed_at` | date_time |
| `verified_purchase` | boolean |

商品ページから絞り込み：

```liquid
{%- for review in shop.metaobjects.product_review.values -%}
  {%- if review.product.id == product.id -%}
    {%- comment -%}表示{%- endcomment -%}
  {%- endif -%}
{%- endfor -%}
```

ただし、商品数 × レビュー数が多いと **Liquid のループが重くなる** ため、サードパーティのレビューアプリ（Judge.me / Yotpo / Loox）を使う方が運用しやすい。

## Metaobject の管理画面

- `Settings → Custom data → Metaobjects` で type を作成
- 各 type の Entry を作成・編集
- 公開状態（Active／Draft）を切替可能

## URL を持つ Metaobject

Metaobject type 作成時に「Online store: Enable a public URL」を ON にすると、`/pages/<handle>` ではなく `/<type-handle>/<entry-handle>` で公開ページを持てる。

例：
- `/brands/example-brand` ← brand 型のページ
- `/stores/shibuya` ← store_location 型のページ

テンプレートは `templates/metaobject.<type>.json` で別途用意。

## ベストプラクティス

1. **再利用するエンティティだけ Metaobject 化**：1商品でしか使わないものは Product metafield で十分
2. **フィールド数は10以内に**：それ以上は別 Metaobject に分割
3. **必須フィールドを最小化**：データ投入時の負担を減らす
4. **`is_active` / `published_at` 等の状態フィールド** を入れて、論理削除に対応
5. **CSV／APIで一括投入**を前提に、英語キーで設計（日本語キーは不可）

## Markets 翻訳

Metaobject の text系フィールド（single_line / multi_line / rich_text）は **Translate & Adapt** で翻訳可能。number / boolean / 参照型は翻訳対象外。

## チェックリスト

- [ ] Metaobject vs Metafield の判定が正しい
- [ ] フィールド構成が10以内
- [ ] 必須フィールドが最小限
- [ ] 商品／ページからの参照が `metaobject_reference` で繋がっている
- [ ] Liquid 呼び出しテンプレ完成
- [ ] 翻訳対象フィールドの仕分け済み
