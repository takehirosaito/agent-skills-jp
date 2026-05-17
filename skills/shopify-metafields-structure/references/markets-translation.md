# Markets と Translate & Adapt

Shopify Markets で多言語配信する場合、Metafield／Metaobject の値も翻訳対象になるか確認が必要。

## 翻訳可能な型

| 型 | 翻訳可否 |
|---|---|
| `single_line_text_field` | ✅ |
| `multi_line_text_field` | ✅ |
| `rich_text_field` | ✅ |
| `url` | ✅（言語別の遷移先を持つ） |
| `single_line_text_field` の `list` 変種 | ✅ |

## 翻訳不可（共通値）

| 型 | 理由 |
|---|---|
| `number_*` | 数値は言語非依存 |
| `boolean` | 真偽は言語非依存 |
| `date` / `date_time` | フォーマットは Liquid 側で言語別に |
| `color` | HEX は共通 |
| `weight` / `volume` / `dimension` | 値＋単位、Liquid 側で表記 |
| `money` | 金額は通貨で表現 |
| `file_reference` | ファイル参照（言語別ファイルにしたい場合は別 metafield に分ける） |
| `product_reference` / `variant_reference` / `collection_reference` | リソース参照（参照先リソース自体が翻訳される） |
| `metaobject_reference` | 参照先 Metaobject の翻訳可能フィールドが翻訳される |
| `json` | 構造化値（翻訳対象外、言語別 metafield で別管理） |

## Translate & Adapt（公式アプリ）

Shopify 公式の翻訳アプリ。Metafield／Metaobject の翻訳可能フィールドを言語別に編集できる。

### 翻訳の単位

- Metafield definition で「Translation: true」をON にしないと翻訳対象にならない
- definition 作成時に「Allow translation」の設定がある（管理画面）

### 翻訳の付与方法

1. **Translate & Adapt アプリで手動翻訳**
2. **AI翻訳の自動下訳**（一部の言語）
3. **Translations API** で外部システムから投入

### 翻訳のキャッシュと反映

- 言語切替時にテーマが言語別 URL（`/ja/...` `/en/...`）で読み込み
- Liquid 側では `{{ product.metafields.custom.material }}` を呼び出すと、自動的に **現在のロケールの翻訳** が返る

## 多言語の落とし穴

### 1. json 型は翻訳されない

サイズ表を `json` で持つと、英語版でも日本語の表記がそのまま出る。

**対策**：
- 言語別に metafield を分ける：`custom.size_chart_ja`、`custom.size_chart_en`
- または、Metaobject 化して翻訳可能な text フィールドで構成

### 2. file_reference の画像が言語別にならない

ロゴや成分表示画像が言語別に必要な場合：

**対策**：
- 言語別 metafield：`custom.label_image_ja`、`custom.label_image_en`
- Metaobject で `language` フィールドを持たせて分岐

### 3. 数値の単位表記

`weight` 型は単位（g/kg/oz/lb）を内部で保持し、Liquid 側で表記を変える：

```liquid
{%- assign w = product.metafields.custom.net_weight.value -%}
{%- if request.locale.iso_code == 'ja' -%}
  {{ w.value }}{{ w.unit }}
{%- else -%}
  {{ w.value }} {{ w.unit }}
{%- endif -%}
```

`dimension` の場合、日本は cm／mm、米国は inch が一般的。`weight` `dimension` のユニット変換は Liquid では限定的（手動換算）。

### 4. 日付フォーマット

```liquid
{%- if request.locale.iso_code == 'ja' -%}
  {{ product.metafields.custom.release_date | date: '%Y年%m月%d日' }}
{%- else -%}
  {{ product.metafields.custom.release_date | date: '%B %d, %Y' }}
{%- endif -%}
```

### 5. URL 型の言語別遷移

`url` 型を翻訳対象にすると、言語ごとに違うURLを設定できる：

| 言語 | URL |
|---|---|
| ja | https://example.com/ja/guide |
| en | https://example.com/en/guide |

## Markets と通貨

Markets で多通貨配信中、商品価格は **Shopify が自動為替** する（Markets設定で round/adjust 可能）。Metafield の `money` 型は **指定通貨で固定** されるため、参考価格・希望小売価格として使う場合は通貨を意識。

## Markets と SEO

| 項目 | 設定方法 |
|---|---|
| 各言語の title／description | Translate & Adapt で `product.metafields.global.title_tag` を翻訳 |
| hreflang | Shopify が自動付与（Markets 設定で言語ON） |
| canonical | Shopify が自動付与（言語別URL） |
| sitemap.xml | 言語別URLが自動含まれる |

## チェックリスト

- [ ] 翻訳対象の Metafield definition で「Allow translation」が ON
- [ ] 翻訳不可型（json / file）は言語別 metafield で分けている
- [ ] Translate & Adapt で全言語に翻訳が入っている
- [ ] Liquid で日付・単位は言語別フォーマット
- [ ] hreflang が全言語版で相互参照
- [ ] sitemap.xml に全言語のURLが含まれる
