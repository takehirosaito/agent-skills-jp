# ジャンル別 Metafields 設計 実例集

## 例1：化粧品ブランド

### 管理したい項目
- 主要成分（1行短文）
- 全成分（順序通り、改行あり）
- 使い方
- FAQ
- 関連商品
- 認証マーク（オーガニック認証など）

### 設計

| 名前空間.キー | 型 | リソース | 備考 |
|---|---|---|---|
| `custom.key_ingredients` | single_line_text_field | Product | max 50字 |
| `custom.full_ingredients` | multi_line_text_field | Product | INCI順 |
| `custom.how_to_use` | rich_text_field | Product | ステップ説明 |
| `custom.faq` | list.metaobject_reference (`faq_item`) | Product | - |
| `custom.related_products` | list.product_reference | Product | 最大4件 |
| `custom.certifications` | list.metaobject_reference (`certification`) | Product | - |
| `custom.shelf_life_months` | number_integer | Product | 賞味期限月数 |
| `custom.country_origin` | single_line_text_field | Product | 例「日本」 |

### Metaobject

**`faq_item`**：
- `question` (single_line_text_field, 必須)
- `answer` (rich_text_field, 必須)

**`certification`**：
- `name` (single_line_text_field)
- `logo` (file_reference)
- `description` (multi_line_text_field)

### Liquid

```liquid
{%- if product.metafields.custom.key_ingredients != blank -%}
  <p>主要成分：{{ product.metafields.custom.key_ingredients }}</p>
{%- endif -%}

{%- for cert in product.metafields.custom.certifications.value -%}
  <img src="{{ cert.logo | image_url: width: 80 }}" alt="{{ cert.name }}">
{%- endfor -%}
```

---

## 例2：アパレル

### 管理したい項目
- 素材（混紡比含む）
- サイズ表（マトリクス）
- お手入れ方法
- モデル着用情報（身長／着用サイズ）
- 関連商品

### 設計

| 名前空間.キー | 型 | リソース | 備考 |
|---|---|---|---|
| `custom.material_composition` | single_line_text_field | Product | 例「コットン70% / リネン30%」 |
| `custom.size_chart` | json | Product | サイズ表マトリクス |
| `custom.care_instructions` | rich_text_field | Product | 洗濯マーク説明 |
| `custom.model_height_cm` | number_integer | Product | モデル身長 |
| `custom.model_wearing_size` | single_line_text_field | Product | 例「M」 |
| `custom.season` | single_line_text_field（choices: SS / FW / AW / 通年） | Product | - |

### json 値例（size_chart）

```json
{
  "S": {"chest": "84-92", "waist": "70-78"},
  "M": {"chest": "92-100", "waist": "78-86"},
  "L": {"chest": "100-108", "waist": "86-94"}
}
```

### Liquid

```liquid
{%- assign chart = product.metafields.custom.size_chart.value -%}
<table>
  <thead><tr><th>サイズ</th><th>胸囲</th><th>ウエスト</th></tr></thead>
  <tbody>
    {%- for size in chart -%}
      <tr>
        <th>{{ size[0] }}</th>
        <td>{{ size[1].chest }} cm</td>
        <td>{{ size[1].waist }} cm</td>
      </tr>
    {%- endfor -%}
  </tbody>
</table>
```

---

## 例3：食品（機能性表示食品）

### 管理したい項目
- 届出番号
- 機能性関与成分
- 届出文言（一字一句改変不可）
- 摂取目安量
- 摂取上の注意
- アレルゲン情報
- 賞味期限月数

### 設計

| 名前空間.キー | 型 | リソース | 備考 |
|---|---|---|---|
| `custom.notification_number` | single_line_text_field | Product | 例「A123」 |
| `custom.functional_ingredient` | single_line_text_field | Product | 例「DHA・EPA」 |
| `custom.notification_text` | multi_line_text_field | Product | 届出文言（改変不可） |
| `custom.daily_intake` | single_line_text_field | Product | 例「1日2粒を目安に」 |
| `custom.intake_precautions` | rich_text_field | Product | 摂取上の注意 |
| `custom.allergens` | list.single_line_text_field | Product | choices: 卵/乳/小麦/そば/... |
| `custom.shelf_life_months` | number_integer | Product | - |

### Liquid

```liquid
{%- if product.metafields.custom.notification_number != blank -%}
  <p>機能性表示食品 [届出番号：{{ product.metafields.custom.notification_number }}]</p>
  <p>{{ product.metafields.custom.notification_text }}</p>
{%- endif -%}

{%- if product.metafields.custom.allergens.value != blank -%}
  <p>アレルゲン：
    {%- for allergen in product.metafields.custom.allergens.value -%}
      {{ allergen }}{%- unless forloop.last -%}、{%- endunless -%}
    {%- endfor -%}
  </p>
{%- endif -%}
```

**注意**：届出文言は一字一句改変不可。CSVで自動投入する場合、エクスポート→管理画面コピペでズレないよう注意。

---

## 例4：家電・ガジェット

### 管理したい項目
- スペック（電圧／消費電力／サイズ／重量）
- 保証期間
- 同梱物リスト
- マニュアルPDF
- 動作確認動画

### 設計

| 名前空間.キー | 型 | リソース | 備考 |
|---|---|---|---|
| `custom.voltage_v` | number_decimal | Product | 電圧 V |
| `custom.power_consumption_w` | number_decimal | Product | 消費電力 W |
| `custom.dimensions` | dimension | Product | 寸法 |
| `custom.net_weight` | weight | Product | 重量 |
| `custom.warranty_months` | number_integer | Product | 保証月数 |
| `custom.included_items` | list.single_line_text_field | Product | 同梱物リスト |
| `custom.manual_pdf` | file_reference | Product | PDFのみ |
| `custom.demo_video_url` | url | Product | YouTube等 |

### Liquid

```liquid
<table>
  <tr><th>電圧</th><td>{{ product.metafields.custom.voltage_v }} V</td></tr>
  <tr><th>消費電力</th><td>{{ product.metafields.custom.power_consumption_w }} W</td></tr>
  {%- assign dim = product.metafields.custom.dimensions.value -%}
  <tr><th>寸法</th><td>{{ dim.value }} {{ dim.unit }}</td></tr>
  {%- assign w = product.metafields.custom.net_weight.value -%}
  <tr><th>重量</th><td>{{ w.value }} {{ w.unit }}</td></tr>
  <tr><th>保証期間</th><td>{{ product.metafields.custom.warranty_months }}ヶ月</td></tr>
</table>

{%- if product.metafields.custom.manual_pdf.value.url -%}
  <a href="{{ product.metafields.custom.manual_pdf.value.url }}">取扱説明書 PDF</a>
{%- endif -%}
```

---

## 例5：ギフト・ノベルティ

### 管理したい項目
- ギフトラッピング対応
- メッセージカード対応
- 価格帯（ギフトコレクション分類用）
- 推奨シーン

### 設計

| 名前空間.キー | 型 | リソース | 備考 |
|---|---|---|---|
| `custom.is_gift_wrappable` | boolean | Product | バッジ表示用 |
| `custom.message_card_available` | boolean | Product | - |
| `custom.price_range_tag` | single_line_text_field（choices: 〜3000円/3000-5000円/5000-10000円/10000円〜） | Product | - |
| `custom.recommended_scenes` | list.single_line_text_field（choices: 誕生日/結婚祝/お返し/お中元/お歳暮/...） | Product | - |
| `custom.gift_message_default` | multi_line_text_field | Product | デフォルトメッセージ |

### カスタム検索フィルタ

`Online Store → Search & Discovery → Filters` で metafield をフィルタとして登録：
- `custom.recommended_scenes` → コレクションページで「シーン」フィルタとして使える

### Liquid

```liquid
{%- if product.metafields.custom.is_gift_wrappable -%}
  <span class="badge badge-gift">🎁 ギフトラッピング対応</span>
{%- endif -%}

<ul>
  {%- for scene in product.metafields.custom.recommended_scenes.value -%}
    <li>{{ scene }}</li>
  {%- endfor -%}
</ul>
```

---

## ジャンル別ポイントまとめ

| ジャンル | Metaobject化推奨 | 翻訳必須 | CSV運用 |
|---|---|---|---|
| 化粧品 | FAQ, 認証 | 成分・FAQ | あり |
| アパレル | （なし） | お手入れ | あり |
| 食品 | アレルゲン項目 | 届出文言（改変不可なので翻訳は別途） | あり |
| 家電 | （なし） | スペック | あり |
| ギフト | キャンペーン | 推奨シーン | あり |
