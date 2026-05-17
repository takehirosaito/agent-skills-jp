# モール間CSVマッピング ケース別実例

## ケース1：楽天 → Amazon（バリエーション込み）

### 移行元（楽天 normal-item.csv 抜粋）

| 商品管理番号 | 商品名 | キャッチコピー | PC用商品説明文 | カタログID | 販売価格 | 在庫数 | 商品画像URL1 |
|---|---|---|---|---|---|---|---|
| tshirt-001 | プレミアム コットンTシャツ | 着心地最高のオーガニックコットン | `<p>100%オーガニックコットン</p><ul><li>柔らかい肌触り</li><li>洗濯耐久</li></ul>` | 4901234567894 | 2980 | 50 | https://image.rakuten.co.jp/shop/cabinet/tshirt-001-black-s.jpg |

楽天の項目選択肢：
- 横軸：カラー（黒/白/グレー）
- 縦軸：サイズ（S/M/L）
- 計9SKU

### 移行先（Amazon フラットファイル）

親ASIN行：

| item_sku | item_name | brand_name | item_type | parent_child | variation_theme | product_description |
|---|---|---|---|---|---|---|
| tshirt-001-parent | プレミアム コットンTシャツ | ブランド名 | apparel | parent | SizeColor | 100%オーガニックコットン。柔らかい肌触りと洗濯耐久。 |

子ASIN行（9行、抜粋）：

| item_sku | item_name | parent_sku | relationship_type | size | color | external_product_id | external_product_id_type | standard_price | quantity | main_image_url | bullet_point1 | bullet_point2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tshirt-001-black-s | プレミアム コットンTシャツ 黒 S | tshirt-001-parent | Variation | S | Black | 4901234567894 | JAN | 2980 | 6 | https://自社cdn/tshirt-001-black-s.jpg | 着心地最高のオーガニックコットン | 柔らかい肌触り |
| tshirt-001-black-m | プレミアム コットンTシャツ 黒 M | tshirt-001-parent | Variation | M | Black | 4901234567901 | JAN | 2980 | 7 | https://自社cdn/tshirt-001-black-m.jpg | 着心地最高のオーガニックコットン | 柔らかい肌触り |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

### 変換ポイント
- 楽天1商品 → Amazon 1親+9子の合計10行
- 商品名：楽天「プレミアム コットンTシャツ」→ 子ASIN毎に「色 サイズ」追加で識別性向上
- キャッチコピー → bullet_point1
- PC説明文HTML：`<p>` `<ul><li>` を分解。プレーン部分→product_description、リスト→bullet_point1-5
- JAN：バリエーション毎に別JANが必要（同一JAN9個はNG）
- 画像URL：楽天キャビネット → Amazonが取り込める外部CDN（自社サーバー等）に再配置必要

### 手作業項目
- バリエーション毎のJAN/GTIN採番
- 画像の自社CDN再配置
- variation_themeの確定（Color, Size, SizeColor のどれを使うか）

## ケース2：Shopify → 楽天

### 移行元（Shopify products.csv 抜粋）

| Handle | Title | Body (HTML) | Vendor | Type | Tags | Variant SKU | Variant Barcode | Variant Price | Variant Inventory Qty | Image Src | Option1 Name | Option1 Value | Option2 Name | Option2 Value |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| premium-tshirt | プレミアム コットンTシャツ | `<p>100%オーガニックコットン...</p>` | MyBrand | Apparel | tshirt, cotton, organic | tshirt-001-black-s | 4901234567894 | 2980.00 | 6 | https://cdn.shopify.com/.../black-s.jpg | Color | 黒 | Size | S |
| premium-tshirt | | | | | | tshirt-001-black-m | 4901234567901 | 2980.00 | 7 | https://cdn.shopify.com/.../black-m.jpg | Color | 黒 | Size | M |
| ... | | | | | | ... | ... | ... | ... | ... | ... | ... | ... | ... |

### 移行先（楽天 normal-item.csv）

| 商品管理番号 | 商品名 | キャッチコピー | PC用商品説明文 | カタログID | 販売価格 | 在庫数 |
|---|---|---|---|---|---|---|
| premium-tshirt | プレミアム コットンTシャツ | （別途要記入） | `<p>100%オーガニックコットン...</p>` | 4901234567894（代表JAN） | 2980 | 50（合計） |

楽天項目選択肢：
- 横軸選択肢：黒, 白, グレー
- 縦軸選択肢：S, M, L
- 項目選択肢別在庫：黒S=6, 黒M=7, ...
- 項目選択肢別JAN：黒S=4901234567894, 黒M=4901234567901, ...

### 変換ポイント
- Handle → 商品管理番号
- Title → 商品名（255byte以内）
- Body (HTML) → PC用商品説明文（10,240byte以内、楽天SP用の禁止タグは除去）
- Variant情報 → 項目選択肢
- 画像：Shopify CDN URL → 楽天キャビネットへ**再アップロード必須**（外部URLは不可）
- エンコード：UTF-8 → SJIS(CP932) 変換
- 改行：LF → CR+LF 変換
- 価格：Shopifyが税抜2,980なら楽天は税込3,278（×1.10）。税込設定なら2,980のまま

### 手作業項目
- キャッチコピー（楽天独自項目）
- ジャンルID選定（楽天固有）
- タグID選定（最大32個）
- 画像の楽天キャビネット再アップロード
- Shopify Tagsからの楽天向け検索キーワード再構成

## ケース3：Yahoo! → Shopify

### 移行元（Yahoo! 商品CSV 抜粋）

| code | name | headline | caption | abstract | product-code | price | quantity | brand-code |
|---|---|---|---|---|---|---|---|---|
| tshirt-001 | プレミアム コットンTシャツ | 着心地最高のオーガニックコットン | `<p>100%オーガニックコットン...</p>` | オーガニックコットン使用の高品質Tシャツ | 4901234567894 | 2980 | 50 | mybrand |

### 移行先（Shopify products.csv）

| Handle | Title | Body (HTML) | Vendor | Tags | Variant SKU | Variant Barcode | Variant Price | Variant Inventory Qty | SEO Description |
|---|---|---|---|---|---|---|---|---|---|
| premium-tshirt | プレミアム コットンTシャツ | `<p>100%オーガニックコットン...</p>` | mybrand | （Yahoo!のheadline+keyword情報） | tshirt-001 | 4901234567894 | 2980.00 | 50 | オーガニックコットン使用の高品質Tシャツ |

### 変換ポイント
- code → Handle（URLセーフ化のため英小文字＋ハイフン推奨）
- name → Title
- headline → 対応列なし、Tagsまたはメタフィールドに退避
- caption（HTML） → Body (HTML)
- abstract → SEO Description（80字推奨、Yahoo!は160字なので短縮可）
- product-code → Variant Barcode
- price → Variant Price（税抜運用ならShopify税設定を税込モードに）
- brand-code → Vendor
- エンコード：SJIS → UTF-8 変換必須

### 手作業項目
- Handleの英文字化（codeが日本語ならURL用にスラッグ生成）
- バリエーション情報のVariant化（Yahoo!のoption1/option2 → Shopify Option1/Option2）

## ケース4：自社マスタ → 4モール同時出力

### 自社マスタ（PIM）

```yaml
sku: tshirt-001-black-s
name_long: "プレミアム コットンTシャツ ブラック Sサイズ オーガニック認証 メンズ レディース 兼用"
name_short: "プレミアム コットンTシャツ 黒 S"
catchcopy: "着心地最高のオーガニックコットン"
description_html: "<p>100%オーガニックコットン使用...</p><ul><li>柔らかい肌触り</li><li>洗濯耐久</li></ul>"
description_plain: "100%オーガニックコットン使用。柔らかい肌触り。洗濯耐久。"
bullets:
  - "オーガニック認証コットン100%"
  - "柔らかい肌触り"
  - "洗濯50回耐久テスト合格"
  - "速乾タイプ"
  - "ユニセックス"
jan: 4901234567894
price_excl_tax: 2700
price_incl_tax: 2970
tax_rate: 10
stock: 6
brand: "MyBrand"
images:
  - "https://cdn.example.com/tshirt-001-black-s.jpg"
variation:
  color: "黒"
  size: "S"
```

### 楽天向け出力

- 商品管理番号：`tshirt-001-black-s`
- 商品名：name_short（255byte以内）
- キャッチコピー：catchcopy
- PC用商品説明文：description_html（楽天用調整）
- カタログID：jan
- 販売価格：price_incl_tax
- 在庫数：stock
- 商品画像URL1：楽天キャビネット用にアップロード後のURL

### Amazon向け出力

- item_sku：`tshirt-001-black-s`
- item_name：name_long（200字以内）
- product_description：description_plain（2,000字以内）
- bullet_point1-5：bulletsをコピー
- external_product_id：jan, type=JAN
- standard_price：price_incl_tax
- quantity：stock
- main_image_url：images[0]（自社CDN）

### Yahoo!向け出力

- code：`tshirt-001-black-s`
- name：name_short（全角75字以内）
- headline：catchcopy（全角60字以内）
- caption：description_html（5,000字以内、Yahoo!禁止タグ除去）
- abstract：description_plain先頭160字
- product-code：jan
- price：price_incl_tax
- quantity：stock

### Shopify向け出力

- Handle：`premium-cotton-tshirt-black-s`（URLスラッグ化）
- Title：name_short
- Body (HTML)：description_html（HTMLそのまま）
- Vendor：brand
- Variant SKU：sku
- Variant Barcode：jan
- Variant Price：price_excl_tax または price_incl_tax（税設定次第）
- Variant Inventory Qty：stock
- Image Src：images[0]（ShopifyにアップロードしたCDN URL）

→ 1つのPIMから4モール分のCSVを書き出すスクリプトを組めば、運用負荷が下がる。
