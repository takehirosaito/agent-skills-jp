# GMC フィード主要属性

Google Merchant Center の商品データ仕様（2025-2026年時点）。**仕様は変更されるため最新はGoogle Merchant Centerヘルプを確認**。

## 1. 基本必須属性（全カテゴリ共通）

| 属性 | 説明 | 形式 |
|---|---|---|
| id | 商品固有ID（在庫毎に一意） | 半角英数記号、50字以内、再利用不可 |
| title | 商品名 | 150字以内 |
| description | 商品説明 | 5,000字以内 |
| link | 商品ページURL | HTTPS必須 |
| image_link | メイン画像URL | HTTPS、JPEG/PNG/GIF/WebP/BMP/TIFF |
| availability | 在庫状況 | in_stock / out_of_stock / preorder / backorder |
| price | 価格 | `1980 JPY`（通貨単位付き、税込が標準） |
| brand | ブランド | 70字以内 |
| condition | 商品状態 | new / refurbished / used |

## 2. GTIN・識別子

| 属性 | 説明 |
|---|---|
| gtin | GTIN（JAN/EAN/UPC/ISBN） |
| mpn | メーカー型番（GTINがない場合の補完） |
| identifier_exists | 識別子の存在 | true（GTIN/MPNあり） / false（自社製品でなし） |

カテゴリにより：
- **全新品**：gtin が必須または強く推奨
- **書籍**：ISBN（gtin に入力）
- **自社製造／ハンドメイド**：identifier_exists: false で回避可

## 3. カテゴリ・分類

| 属性 | 説明 |
|---|---|
| google_product_category | Google分類（数値ID または英語カテゴリ階層パス） |
| product_type | 自社商品カテゴリ（自由記述、階層は ` > ` で区切り） |

例：
- google_product_category: `Apparel & Accessories > Clothing > Shirts & Tops` または `1604`
- product_type: `アパレル > メンズ > Tシャツ`

## 4. 価格・割引

| 属性 | 説明 |
|---|---|
| price | 通常価格（通貨単位付き） |
| sale_price | セール価格 |
| sale_price_effective_date | セール期間（`2026-04-01T00:00:00+09:00/2026-04-07T23:59:59+09:00`） |
| unit_pricing_measure | 単価表示の単位（食品・洗剤等） |
| unit_pricing_base_measure | 単価表示の基準数量 |

## 5. 配送

| 属性 | 説明 |
|---|---|
| shipping | 配送情報（国・地域・サービス・価格） |
| shipping_weight | 重量（kg/g/lb/oz） |
| shipping_length / width / height | 寸法 |
| ships_from_country | 発送元国 |
| max_handling_time | 最大処理日数 |
| min_handling_time | 最小処理日数 |

shippingの記述例（CSV/TSV）：
```
country:JP,service:Standard,price:500 JPY
```

または地域別：
```
country:JP,region:Hokkaido,service:Standard,price:1500 JPY
```

## 6. 在庫

| 属性 | 説明 |
|---|---|
| availability | in_stock / out_of_stock / preorder / backorder |
| availability_date | 入荷予定日（preorder/backorder時） |

## 7. カテゴリ別の必須属性

### 衣料品・ファッション
- size：S, M, L, 25cm 等
- color：red, blue, multi 等
- gender：male / female / unisex
- age_group：adult / kids / toddler / infant / newborn
- size_type：regular / petite / plus / big and tall / maternity
- size_system：US / UK / EU / JP / DE / AU / IT / CN / FR 等

### 食品・飲料
- gtin（GTINが必須または推奨）
- unit_pricing_measure（容量・重量で単価表示）
- expiration_date（消費期限／賞味期限）

### 書籍
- gtin（ISBN-13）
- mpn（書籍コード）
- 推奨：is_bundle

### 家電・PC
- gtin
- mpn
- 型番・スペック情報をdescriptionに含める

### 化粧品・健康用品
- gtin
- ブランド必須
- 薬機法関連の表現に注意（別スキル `yakki-keihyo-expression-check`）

## 8. バリエーション（item_group_id）

複数バリエーション（色・サイズ等）をグルーピング：

```
id: TSH-001-BLK-S
item_group_id: TSH-001
title: 軽量Tシャツ 黒 S
color: black
size: S

id: TSH-001-BLK-M
item_group_id: TSH-001
title: 軽量Tシャツ 黒 M
color: black
size: M
```

→ 同一 `item_group_id` を持つ商品が同一商品のバリエーションとして扱われる。

## 9. ハイライト・追加情報

| 属性 | 説明 |
|---|---|
| product_highlight | 商品のハイライト（最大100文字×10件） |
| pattern | 柄・パターン（striped, solid, plaid 等） |
| material | 素材（cotton, polyester 等） |
| age_group | adult / kids / toddler / infant / newborn |
| color | 色（複数色は `/` で区切り：`red/blue`） |
| size | サイズ |
| size_type | regular / petite / plus / big and tall / maternity |
| size_system | サイズ規格 |

## 10. プロモーション・ローカル在庫

| 属性 | 説明 |
|---|---|
| promotion_id | プロモーションIDの紐付け |
| custom_label_0 〜 custom_label_4 | カスタムラベル（広告ターゲティング用） |
| ads_grouping | 広告グループ分類 |
| ads_labels | 広告ラベル |
| pickup_method | 店舗受取方法 |
| pickup_sla | 店舗受取SLA |

## 11. ターゲット国・言語

| 属性 | 説明 |
|---|---|
| feed_label | フィードラベル（複数地域配信用） |
| content_language | コンテンツ言語（ja 等） |
| target_country | 配信対象国（JP 等） |

## 12. メタ情報

| 属性 | 説明 |
|---|---|
| additional_image_link | 追加画像URL（最大10枚） |
| mobile_link | モバイル用ランディングページ |
| canonical_link | 正規URL（重複コンテンツ回避） |
| external_seller_id | マルチアカウント時の販売者ID |

## 必須／推奨／オプションの目安

### 全カテゴリ必須
id, title, description, link, image_link, availability, price, brand, condition

### カテゴリ別必須（多い）
gtin（多くのカテゴリ）、size/color/gender/age_group（衣料品）

### 強く推奨
google_product_category, product_type, shipping

### あると有利
additional_image_link, item_group_id（バリエーション）, product_highlight, sale_price

## 属性の制約

### 文字数
- title：150字以内（推奨：商品の特徴がわかる範囲）
- description：5,000字以内
- brand：70字以内
- id：50字以内

### 形式
- price：`数値 通貨コード`（例 `1980 JPY`）
- date：ISO 8601形式（`2026-04-01T00:00:00+09:00`）
- URL：HTTPS必須、有効なURL形式
- color：英語名（red, blue, black）または複数色は `red/blue`

### 一意性
- id：同一フィード内で一意、変更したら別商品扱い
- item_group_id：バリエーション親として使う

## 入力例（TSV）

```
id	title	description	link	image_link	availability	price	brand	gtin	condition	google_product_category
TSH001	軽量Tシャツ	高品質コットン	https://example.com/p/tsh001	https://cdn/img/tsh001.jpg	in_stock	1980 JPY	MyBrand	4901234567894	new	Apparel & Accessories > Clothing > Shirts & Tops
```

## 入力例（XML / RSS 2.0 + g:）

```xml
<item>
  <g:id>TSH001</g:id>
  <g:title>軽量Tシャツ</g:title>
  <g:description>高品質コットン</g:description>
  <g:link>https://example.com/p/tsh001</g:link>
  <g:image_link>https://cdn/img/tsh001.jpg</g:image_link>
  <g:availability>in_stock</g:availability>
  <g:price>1980 JPY</g:price>
  <g:brand>MyBrand</g:brand>
  <g:gtin>4901234567894</g:gtin>
  <g:condition>new</g:condition>
  <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops</g:google_product_category>
</item>
```

## まとめチェック

- [ ] 必須9属性（id/title/description/link/image_link/availability/price/brand/condition）
- [ ] 該当カテゴリの追加必須属性（衣料品なら size/color/age_group/gender）
- [ ] GTIN or identifier_exists:false
- [ ] google_product_category
- [ ] shipping
- [ ] HTTPSのlinkとimage_link
- [ ] price は通貨単位付き
- [ ] バリエーションは item_group_id でグルーピング
