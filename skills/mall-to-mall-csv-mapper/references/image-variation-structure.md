# 画像・バリエーション構造の比較

## 画像の保管・指定方法

### 楽天市場

- **楽天キャビネット**にアップロードしたURLを商品画像URL1〜20に指定
- URL形式：`https://image.rakuten.co.jp/<shop_url>/cabinet/.../xxx.jpg`
- 外部CDN／自社ドメイン画像URLは原則NG（楽天サーバー上の画像のみ）
- 推奨：700×700px以上、JPG/PNG/GIF
- テキスト占有率20%以内（2024.6改定、10×10マス中20マス）
- 枠禁止

### Amazon.co.jp

- **外部画像URL（自社CDN等）を指定 → Amazonが取り込み**
- main_image_url + other_image_url1-8（合計9枚まで）
- メイン画像要件：
  - 純白背景 RGB(255,255,255)
  - 商品占有率85%以上
  - 1000px以上（ズーム表示の閾値）
  - JPG/PNG/TIFF/GIF（CMYK不可）
  - テキスト・ロゴ・枠・小道具禁止
- A+コンテンツの画像は別途A+管理画面で個別アップロード

### Yahoo!ショッピング

- **ストアエディタ／ストアクリエイターProでアップロード**したファイル名をimage-pathに指定
- 1商品あたり主要画像＋サブ画像（仕様確認）
- 推奨サイズはYahoo!公式仕様参照

### Shopify

- **Shopify管理画面 / Files / Media APIで管理**
- Image Src列にURL指定（ShopifyのCDN）
- バリエーション毎にVariant Imageを指定可能
- 1商品あたり画像数上限：公式仕様で確認（実用上は問題にならない）
- 推奨：2048×2048px正方形、Zoom対応

### 共通の注意

- モール間で画像URLは**そのまま流用できない**（楽天→Amazonは外部URLを別途用意、Shopify→楽天はキャビネット再アップロード等）
- 画像のリサイズ／背景白化／テキスト除去はモール毎にやり直す必要がある場合あり

## バリエーション構造の違い

### 楽天市場

**モデル**：1商品に「項目選択肢」を縦軸×横軸の最大40×40で設定（実用は色×サイズ）

```
商品管理番号: tshirt-001
  項目選択肢 横軸: カラー (黒/白/赤)
  項目選択肢 縦軸: サイズ (S/M/L)
    → 黒S, 黒M, 黒L, 白S, 白M, 白L, 赤S, 赤M, 赤L = 9SKU
```

- カタログID（JAN）：項目選択肢別にも設定可（カタログID一括）
- 在庫：項目選択肢別在庫
- 画像：項目選択肢別画像（縦軸 or 横軸の片方に対応）

### Amazon

**モデル**：parent ASIN + child ASIN（親子関係）

```
parent: tshirt-001-parent (item_type=parent, relationship_type=Variation)
  child: tshirt-001-black-s (variation_theme=SizeColor)
  child: tshirt-001-black-m
  child: tshirt-001-white-s
  ...
```

- variation_theme：Size / Color / SizeColor / SizeName / ColorName 等
- 子ASIN毎に：item_sku, external_product_id, item_name, standard_price, quantity, main_image_url
- 親ASIN：販売しない、子をまとめる役割

### Yahoo!ショッピング

**モデル**：option1-name, option1-value-1〜N, option2-name, option2-value-1〜N

```
code: tshirt-001
  option1-name: カラー
  option1-value-1: 黒
  option1-value-2: 白
  option1-value-3: 赤
  option2-name: サイズ
  option2-value-1: S
  option2-value-2: M
  option2-value-3: L
```

- 在庫はoption毎の管理
- 画像はoption-image-X-Yで指定

### Shopify

**モデル**：Product + Variant（1商品 = 複数バリエーション）

```
Handle: tshirt-001
  Option1 Name: Color  Option1 Value: 黒  Option2 Name: Size  Option2 Value: S
  Option1 Name: Color  Option1 Value: 黒  Option2 Name: Size  Option2 Value: M
  ...
```

- 最大3オプション
- 1商品100バリエーション上限
- Variant毎に：Variant SKU, Variant Barcode, Variant Price, Variant Inventory Qty, Variant Image
- Productが「親」、Variantが「子」に相当

## 変換ルール

### 楽天 → Amazon

楽天「項目選択肢」9SKU（黒/白/赤 × S/M/L）→ Amazon親子9child ASIN

| 楽天 | Amazon |
|---|---|
| 商品管理番号 tshirt-001 | parent_sku tshirt-001-parent |
| 横軸 黒, 白, 赤 | variation_theme=ColorName / Color |
| 縦軸 S, M, L | + variation_theme=SizeName / Size |
| 項目選択肢別在庫 | child のquantity |
| 項目選択肢別画像 | child のmain_image_url |

→ 子ASINを9行作成、親ASIN行を1行作成 = 計10行のフラットファイル

### Amazon → 楽天

Amazon 9child ASIN → 楽天「項目選択肢」9SKU

- Amazon子ASINの色・サイズを抽出
- 楽天 normal-item.csv の横軸／縦軸／在庫／画像にマッピング
- 親ASIN行は楽天側では不要

### 楽天 → Shopify

楽天9SKU → Shopify 1Product + 9Variant

| 楽天 | Shopify |
|---|---|
| 商品管理番号 | Handle |
| 横軸 黒/白/赤 | Option1 Name=Color, Option1 Value=黒/白/赤 |
| 縦軸 S/M/L | Option2 Name=Size, Option2 Value=S/M/L |
| 在庫 | Variant Inventory Qty |
| 画像 | Variant Image（色別 or サイズ別） |

→ CSV上は同一Handleで9行（または1Product行+9Variant行）

### Shopify → Amazon

| Shopify | Amazon |
|---|---|
| Handle | parent_sku |
| Option1+Option2 | variation_theme |
| Variant SKU | child item_sku |
| Variant Barcode | external_product_id (type=JAN) |
| Variant Price | standard_price |
| Variant Inventory Qty | quantity |
| Variant Image | child main_image_url |

## バリエーションの上限・落とし穴

| モール | 最大バリエーション数（実用） |
|---|---|
| 楽天 | 横40×縦40=1600通り（実用は色×サイズで数十SKU） |
| Amazon | 実質無制限（カテゴリ別の制限あり） |
| Yahoo! | option1×option2の組合せ |
| Shopify | 1Product 100Variant |

→ **Shopifyの100上限が最も厳しい**。色×サイズが多い場合（例：色20×サイズ10=200）はShopify側で複数Productに分割が必要。

## 共通の注意

- バリエーション毎にJAN/GTINが付くのが原則（同一JANを複数SKUに付けない）
- バリエーション毎の在庫・画像・価格を別管理にすると、運用が複雑化するが転換率は上がる
- モール毎に「色名」の表記揺れ（Black/黒/ブラック）が起きると、検索やカタログマッチングで不利
