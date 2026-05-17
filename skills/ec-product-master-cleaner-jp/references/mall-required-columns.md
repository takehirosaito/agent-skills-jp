# モール別 商品マスタ必須列・推奨列

各モールの仕様は変更されるため、最終的には各モール公式ヘルプで確認すること。

## 楽天市場（RMS）

### 商品ページ作成（item.csv 等）の主要列
- 商品管理番号
- 商品番号（モール上のURL構成要素）
- 商品名
- カタログID（あれば）
- ジャンルID
- 販売価格
- 在庫数
- 商品画像URL（1〜20枚）
- PC用商品説明文
- スマートフォン用商品説明文
- PC用販売説明文
- 商品オプション（バリエーション）
- 注意事項
- 送料区分
- 在庫管理単位（SKU）
- SKUごとのバリエーション項目（カラー・サイズ等）

### SKUプロジェクト後
- SKU管理番号
- システム連携用SKU番号
- SKU横軸（バリエーション項目1〜複数）
- SKUごと在庫数

### 注意
- ジャンルIDは別スキル（rakuten-genre-id-selector）で扱う
- 商品名は255バイト以内（全角約127文字）の制限
- HTMLは商品説明欄のみ許可、商品名には不可

## Amazon（フラットファイル／セラーセントラル）

### 主要列（テンプレートにより異なる）
- SKU（出品者SKU）
- product-id（JAN/UPC/EAN/ISBN）
- product-id-type（JAN=2、UPC=3、ISBN=4 等）
- item-name（商品名）
- brand-name
- manufacturer
- standard-price
- list-price（メーカー希望小売価格）
- quantity
- main-image-url、other-image-url1〜
- bullet-point1〜5
- product-description
- search-terms（キーワード、検索対象タグ）
- category（カテゴリID／ブラウズノードID）
- variation-theme（バリエーション軸）
- parent-child（親子関係）

### 注意
- 商品名は200文字以内（カテゴリ別に細かい規定あり）
- bullet-pointは1点250文字以内推奨
- 半角英数のみのSKU命名が安全（ハイフン・アンダースコア可）
- フラットファイルのテンプレートはカテゴリ別にダウンロード

## Yahoo!ショッピング

### 主要列
- 商品コード（半角英数）
- 商品名（150文字以内）
- 価格
- 商品在庫
- 商品状態
- 送料区分
- メーカー名
- ブランド名
- カテゴリID
- 画像URL（メイン・サブ）
- 商品説明文
- スマートフォン用商品説明文
- バリエーション項目（カラー・サイズ）

### 注意
- 文字数制限：商品名150文字以内
- 検索キーワードは商品名に含める方針
- ジャンルIDが楽天と別体系

## Shopify

### 主要列（products.csv エクスポート時）
- Handle（URLハンドル）
- Title
- Body (HTML)
- Vendor
- Product Category
- Type
- Tags
- Published
- Option1 Name / Value（バリエーション1）
- Option2 Name / Value
- Option3 Name / Value
- Variant SKU
- Variant Grams
- Variant Inventory Tracker
- Variant Inventory Qty
- Variant Inventory Policy
- Variant Fulfillment Service
- Variant Price
- Variant Compare At Price
- Variant Requires Shipping
- Variant Taxable
- Variant Barcode（JAN）
- Image Src
- Image Position
- Image Alt Text

### 注意
- HandleはURL構成要素、半角英数推奨
- Variant Inventory Policy: deny（在庫切れで購入不可）/ continue（在庫切れでも購入可）
- Compare At Priceは比較対照価格（二重価格表示は景表法に注意）

## ネクストエンジン（在庫・受注一元化）

### 商品マスタ主要列
- 商品コード
- 商品名
- カテゴリ
- 仕入価格
- 販売価格
- 在庫数
- セット商品の構成
- メーカー型番
- JAN
- 各モールごとの「商品連携コード」（楽天商品管理番号／Amazon SKU等）

### 在庫連動
- ネクストエンジンの在庫を「マスター」として、各モールへ自動連動
- バリエーション単位での連動可能
- 連動エラーが頻発する原因：モール側で別商品扱いになっている、商品連携コードのスペル違い等

## Makeshop / futureshop / BASE / カラーミーショップ

### 共通的に押さえる列
- 商品コード
- 商品名
- 価格（税込／税抜の設定方針）
- 在庫
- 画像
- カテゴリ
- 商品説明
- メタタグ（SEO）
- 配送設定

### 注意
- 商品コードは半角英数・ハイフン・アンダースコアのみ推奨
- 価格の税表示はモール設定に依存
- BASEは特に簡素な項目構成

## 共通の落とし穴

1. **商品コードに全角文字・スペース・特殊記号**：URL構成・APIで弾かれる
2. **モール間で商品コードが違う**：在庫連動・受注紐付けの破綻
3. **価格列の税込／税抜の取り違え**：表示価格が崩れる
4. **画像URL切れ**：撮影元のサーバ停止・ファイル名変更で発生
5. **カテゴリ階層の深さ**：モールにより最大階層数が異なる
6. **CSV末尾の改行漏れ**：最終行が読み込まれない不具合

## 推奨されるマスタ構造（自社管理）

```
[商品基本マスタ]
- 商品コード（社内固有・不変）
- 商品名（社内標準）
- 仕入価格
- 標準販売価格
- 標準カテゴリ
- JAN
- 重量・寸法

[モール別マスタ]
- 商品コード（FK）
- モール名
- モール固有商品コード（楽天商品管理番号等）
- モール上の商品名
- モール上の販売価格
- モールカテゴリID
- 在庫連動方針

[バリエーションマスタ]
- 商品コード（FK）
- バリエーション軸（カラー／サイズ）
- バリエーションSKU
- バリエーション固有JAN
- バリエーション固有在庫
- バリエーション固有価格
```

このように分けることで、商品マスタ正規化時の影響範囲を限定できる。
