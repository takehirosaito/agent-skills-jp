# 主要列の仕様

Amazon.co.jp のフラットファイル（商品登録CSV／TSV）の主要列。カテゴリにより列名・必須／推奨が異なる場合があるため、最新は Amazon セラーセントラルの公式テンプレートを参照。

## 識別系

### item_sku（必須）
- 出品者が自由に決める商品の管理SKU
- 半角英数記号のみ推奨（日本語・全角は避ける）
- 40字程度を目安
- 他出品商品との重複NG
- 例：`SKU-001-BLK-M`

### external_product_id（必須）
- 商品識別コード（JAN／EAN／UPC／ISBN）
- 数字のみ
- チェックデジット検証必須（`jan-code-checker` 参照）

### external_product_id_type（必須）
- ENUM：`EAN` / `UPC` / `JAN` / `ISBN`
- 日本国内商品の多くは `EAN`（JAN-13は GTIN-13 に該当し EAN 値で登録）
- 大文字・小文字の違いに注意（仕様により小文字`ean`が必要なテンプレートあり）

### product_id_type / product_id（特殊カテゴリ）
- 一部カテゴリでは旧表記が残る

## ブランド・分類系

### brand_name（必須）
- ブランド名
- 50字程度
- Brand Registry 登録ブランド名と一致させる

### manufacturer（推奨）
- 製造元
- 50字程度

### item_type（必須）
- カテゴリ固有のENUM
- カテゴリの「ブラウズツリーガイド」で確認
- 例：`vacuum-cleaner` / `body-cream` / `instant-noodles`
- 自由入力するとエラー

### recommended_browse_nodes（必須）
- ブラウズノードID（数値）
- カテゴリの「ブラウズツリーガイド」で確認

### product_tax_code（推奨）
- 税区分コード（標準税率／軽減税率）
- 食品の一部は軽減税率対象

## 表示系

### item_name（必須）
- 商品名／タイトル
- カテゴリ別バイト数：
  - 一般：全角200字（推奨80字）
  - アパレル：130字
  - カメラ：50字
- 禁止：プロモ語（割引中／セール／送料無料）、絵文字、HTML、全大文字

### product_description（推奨）
- 商品説明（HTMLは原則不可、改行は仕様により可）
- 全角2,000字程度

### bullet_point1〜5（推奨）
- 商品仕様5箇条書き
- 各255バイト
- 検索インデックスは先頭1,000バイト
- 詳細：`amazon-bullet-attribute-benefit` スキル

### generic_keywords / search_terms（推奨）
- 検索キーワード
- 249バイト（超過分は無視）
- スペース区切り
- 詳細：`amazon-search-term-builder-jp` スキル

## 画像系

### main_image_url（推奨）
- メイン画像のHTTPS URL
- 1000px以上、JPG/PNG、純白背景RGB(255,255,255)、85%占有
- 詳細：`amazon-main-image-checker` スキル

### other_image_url1〜8（推奨）
- サブ画像のHTTPS URL
- 順番に埋める（飛び番号NG）
- 用途：使用シーン／素材アップ／サイズ感／パッケージ／インフォグラフィック

## 価格・在庫系

### standard_price（必須）
- 標準販売価格（税込）
- 整数
- 例：`1980`（1,980円）

### sale_price / sale_from_date / sale_end_date（任意）
- セール価格と期間
- 二重価格表示の8週間ルールに注意（景表法）

### quantity（必須・FBM）
- 在庫数（自社発送の場合）
- 整数・非負

### fulfillment_channel（任意）
- ENUM：`DEFAULT`（自社発送） / `AMAZON_NA`（FBA・北米）/ `AMAZON_JP`（FBA・日本）

### handling_time（推奨）
- 出荷準備日数（営業日）
- 整数

## 配送系

### package_height / package_length / package_width（cm）
### package_weight（kg）
- 数値、小数可

## 親子バリエーション系

### parent_child（バリエーション時必須）
- ENUM：`parent` / `child`

### parent_sku（child行で必須）
- 親のitem_sku

### relationship_type（child行で必須）
- ENUM：`variation`

### variation_theme（バリエーション時必須）
- ENUM：カテゴリ別
- 例：`Size` / `Color` / `SizeColor` / `SizeName-ColorName`
- カテゴリ別の組合せは `references/variation-relationship.md` 参照

### color_name / size_name（バリ列）
- variation_theme に応じた値
- 子行ごとに重複しない組合せにする

## カテゴリ別の特殊列

各カテゴリで以下のような特殊列が必須／推奨になる：

| カテゴリ | 特殊列 |
|---|---|
| 食品 | `expiration_date`, `food_ingredients`, `country_of_origin`, `food_allergen_information` |
| 化粧品 | `volume_capacity_name`, `ingredients` |
| 家電 | `power_source_type`, `wattage`, `voltage`, `model_number` |
| アパレル | `apparel_size`, `apparel_color`, `material_composition`, `target_gender` |
| ベビー | `target_age_min_max`, `safety_warning` |
| 食品（軽減税率対象） | `product_tax_code` を要確認 |

詳細はカテゴリ別の「ブラウズツリーガイド」「商品情報スタイルガイド」を参照。

## バイト計算の基本

- 全角＝3バイト、半角＝1バイト（UTF-8 ベース）
- `item_name` 200字＝全角200字＝600バイト相当（仕様文字数は字数ベース、バイト数ベース両方がカテゴリで混在するので注意）
- bullet, generic_keywords は明示的にバイトベース

## 列名の表記揺れ

仕様により以下のような表記揺れがある（テンプレート最新版で確認）：
- `external_product_id` vs `external-product-id`
- `item_name` vs `item-name`
- `bullet_point1` vs `bullet-point1`

ハイフン版・アンダースコア版どちらかでテンプレートが配布されている。テンプレートのヘッダー行をそのまま使うのが安全。
