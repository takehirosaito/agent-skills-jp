# Metafield 型 完全リスト

Shopify の Metafield は **23+ 種類の型** がある。各型のバリデーション設定、list 変種、用途を整理。

## テキスト系

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `single_line_text_field` | 1行テキスト | min/max length、正規表現、選択肢 | `list.single_line_text_field` |
| `multi_line_text_field` | 複数行テキスト（改行OK） | min/max length | なし |
| `rich_text_field` | リッチテキスト（HTML保存） | なし | なし |

`rich_text_field` は管理画面で WYSIWYG エディタが出る。Liquid で `| metafield_tag` フィルタを通すと HTML として出力。

## 数値系

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `number_integer` | 整数 | min/max、選択肢 | `list.number_integer` |
| `number_decimal` | 小数 | min/max、選択肢、桁数 | `list.number_decimal` |
| `rating` | 評価（min/max 範囲指定） | min/max（必須） | なし |
| `money` | 金額＋通貨 | min/max、通貨指定 | なし |

`rating` は `{ "value": 4.5, "scale_min": 1, "scale_max": 5 }` のオブジェクト形式で保存される。

## 日時系

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `date` | 日付（YYYY-MM-DD） | min/max | `list.date` |
| `date_time` | 日時（ISO 8601） | min/max | `list.date_time` |

## 真偽・選択

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `boolean` | true/false | なし | なし |

複数選択肢は `list.single_line_text_field` でリスト化 or `single_line_text_field` で choices 設定。

## URL・色・物理量

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `url` | URL（http/https/その他） | allowed domains, allowed protocols | `list.url` |
| `color` | カラーHEX | なし | `list.color` |
| `weight` | 重量＋単位（g/kg/oz/lb） | min/max | なし |
| `volume` | 容量＋単位（ml/L/floz/gal） | min/max | なし |
| `dimension` | 寸法＋単位（mm/cm/m/in/ft/yd） | min/max | なし |

`weight` `volume` `dimension` は `{ "value": 100, "unit": "g" }` の形式。Liquid では `{{ metafield.value.value }}{{ metafield.value.unit }}` で表示。

## 構造化

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `json` | 任意のJSON | max bytes（最大5MB） | なし |

サイズ表マトリクスやFAQ配列を1つの json に詰める用途。**ただし** 配列要素ごとに編集UIを出したい場合は **Metaobject** に分離した方が運用しやすい。

## ファイル参照

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `file_reference` | Shopify Files のファイル | 拡張子・MIMEタイプ制限 | `list.file_reference` |

画像・PDF・動画など。Liquid では `{{ metafield.value | image_url: width: 800 }}` などで取得。

## リソース参照

| 型 | 内容 | バリデーション | list変種 |
|---|---|---|---|
| `product_reference` | 商品 | なし | `list.product_reference` |
| `variant_reference` | バリアント | なし | `list.variant_reference` |
| `collection_reference` | コレクション | なし | `list.collection_reference` |
| `page_reference` | ページ | なし | `list.page_reference` |
| `metaobject_reference` | Metaobject エントリ | metaobject type 指定 | `list.metaobject_reference` |
| `mixed_reference` | 複数種のリソース | 許可リソース指定 | `list.mixed_reference` |
| `customer_reference` | 顧客 | なし | `list.customer_reference` |
| `company_reference` | B2B カンパニー | なし | `list.company_reference` |
| `order_reference` | 注文 | なし | `list.order_reference` |

## list 変種の挙動

`list.<type>` は 配列として保存。Liquid では：

```liquid
{%- for item in product.metafields.custom.related_products.value -%}
  <a href="{{ item.url }}">{{ item.title }}</a>
{%- endfor -%}
```

## バリデーション設定（管理画面で可能）

| 型 | バリデーション項目 |
|---|---|
| text系 | 最小／最大文字数、正規表現、選択肢（dropdown） |
| 数値系 | 最小／最大値、選択肢、桁数 |
| date系 | 最小／最大日付 |
| url | プロトコル制限（https のみ等）、ドメイン制限 |
| file | 拡張子・MIMEタイプ |
| reference | 参照リソースのタイプ／タグ |
| json | 最大バイト数 |

## 型選定フローチャート

```
管理したい値は何か？
├── 単一の短い文字列 → single_line_text_field
├── 改行ありの長文 → multi_line_text_field
├── HTML 含むリッチ文 → rich_text_field
├── 整数 → number_integer
├── 小数 → number_decimal
├── 真偽 → boolean
├── 日付 → date
├── 日時 → date_time
├── URL → url
├── 色 → color
├── 重さ・容量・寸法 → weight / volume / dimension
├── 金額 → money
├── 評価 → rating
├── ファイル（画像／PDF） → file_reference
├── 他商品・コレクションへの参照 → product_reference / collection_reference
├── 再利用エンティティへの参照 → metaobject_reference
├── 配列・マトリクスの構造化 → json または list.metaobject_reference
└── 複数の値（同一型） → list.<type>
```

## よくある間違い

1. **`single_line_text_field` に JSON を文字列で入れる**：`json` 型を使う
2. **`product.tags` で属性管理し続ける**：タグはフィルタ用、属性は metafield 推奨
3. **`rich_text_field` を Liquid で `{{ ... }}` でそのまま出す**：エスケープされる。`| metafield_tag` を使う
4. **`list.product_reference` ではなく `product_reference` を複数値で使おうとする**：単一型は単一値しか入らない
5. **`metaobject_reference` で type を指定し忘れる**：作成時に metaobject type を必ず指定（後から変更不可）
6. **`file_reference` の MIMEタイプ制限を後から外す**：既存ファイルが規約違反扱いになる可能性

## 型の変更可否（重要）

**作成済みの metafield definition の `type` は変更できない**。

変更したい場合：
1. 新しい key の definition を作る（例 `custom.size_chart_v2`）
2. 旧 key の値を新 key にコピー（CSV／API）
3. テーマで新 key を参照するよう更新
4. 旧 definition を非推奨化／削除

→ **初期設計時の型選定が最も重要**。
