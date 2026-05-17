# モール間 主要列対応表（完全版）

楽天RMS（normal-item.csv）／Amazonフラットファイル／Yahoo!ショッピング商品CSV／Shopify products.csv の主要列を10カテゴリで対応付け。

公式仕様は変更されるため、登録前に各モール公式ヘルプで最新を確認。実務ノウハウは「公式必須要件」と断定しない。

## 1. 商品識別子

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 内部商品コード | 商品管理番号（32byte） | item_sku | code | Handle |
| 表示用商品コード | 商品番号 | （無し・SKU兼用） | display-code | Variant SKU |
| JAN/EAN/UPC | カタログID（30byte） | external_product_id + external_product_id_type | product-code | Variant Barcode |
| ブランド/メーカー | （単独列なし、テキストで） | brand_name / manufacturer | brand-code | Vendor |

## 2. 商品名・短文

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 商品名 | 商品名（255byte/全角127字） | item_name | name（全角75字） | Title |
| 短い宣伝文（1行） | キャッチコピー（174byte/全角87字） | （bullet_pointで代用） | headline（全角60字） | （対応列なし、メタフィールド代用） |
| 検索用キーワード | （タグID/商品名にキーワード） | generic_keywords / search_terms（249byte） | （商品名・キャプションで対応） | Tags |
| 抄録 | （無し） | （無し） | abstract（全角160字） | （対応列なし、メタフィールド） |

## 3. 説明文

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 説明文（メイン） | PC用商品説明文（10,240byte、HTML可） | product_description（2,000字、HTML不可） | caption（全角5,000字、HTML可） | Body (HTML)（実質無制限、HTML可） |
| モバイル説明文 | スマートフォン用商品説明文（10,240byte） | （PC/SP同一） | （PC/SP同一） | （PC/SP同一） |
| ブレットリスト | （HTMLの`<ul>`で代用） | bullet_point1-5（各255byte/検索対象は先頭1,000byte） | （HTML/箇条書きで代用） | （HTML/箇条書きで代用） |
| 仕様情報 | （HTMLの`<table>`で代用） | （フラットファイル属性列で） | （HTMLの`<table>`で代用） | Metafields（仕様用） |

## 4. 価格・割引

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 販売価格 | 販売価格（税込） | standard_price（税込） | price（税込） | Variant Price |
| 二重価格元値 | 表示価格／二重価格表示 | list_price | sale-priceとの組合せ | Variant Compare At Price |
| セール価格 | （販売価格を変える） | sale_price + sale_from_date + sale_end_date | sale-price + sale-period | （販売チャネル毎の割引アプリ） |
| 税の扱い | 税込入力 | 税込入力 | 税込入力 | 税抜が初期値（税設定による） |
| 通貨 | JPY | JPY | JPY | 通貨設定（複数通貨対応） |

## 5. 在庫

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 在庫数 | 在庫数 | quantity | quantity | Variant Inventory Qty |
| 在庫管理方法 | 在庫タイプ（通常/項目選択肢別等） | （fulfillment_channelで自社/FBA区別） | inventory-area | Variant Inventory Tracker |
| 在庫切れ表示 | 在庫切れ時表示文 | （ASIN単位のステータス） | order-accept-type | Variant Inventory Policy (deny/continue) |

## 6. 画像

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| メイン画像 | 商品画像URL1（キャビネットURL） | main_image_url | image-path（path指定） | Image Src |
| サブ画像 | 商品画像URL2-20 | other_image_url1-8 | sub-image-path-1 〜 | 同一Image Srcに別行で追加 |
| 画像名・代替テキスト | 商品画像名1-20 | （無し） | image-alt | Image Alt Text |
| バリエーション画像 | バリエーション項目選択肢別画像 | 親子ASINで子別画像 | option-image | Variant Image |

## 7. カテゴリ・分類

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| カテゴリ | ジャンルID（6桁数字） | item_type / browse_node_id | path（階層） / product-category | Type, Collection |
| タグ | タグID（最大32個） | （無し、検索キーワードで） | abstract / keyword | Tags（カンマ区切り） |
| 商品コレクション | （カテゴリページで） | （無し） | product-category | Collection（手動・自動） |

## 8. バリエーション（色・サイズ等）

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 構造 | 親=商品管理番号、項目選択肢で展開 | parent_sku + child_skus + relationship_type=Variation | option1-name, option1-value, option2-... | Product+Variant（1Product=複数Variant） |
| バリエーションテーマ | 項目選択肢／横軸/縦軸 | variation_theme（Size, Color, SizeColor等） | option1-2 | Option1 Name, Option2 Name, Option3 Name |
| バリエーション値 | 横軸選択肢値・縦軸選択肢値 | item_name + 値の組合せ | option1-value-1, option1-value-2 | Option1 Value, Option2 Value |
| 上限 | 横40×縦40（最大1600通り、実用は色×サイズ） | 実質無制限 | （仕様確認） | 1Product 100バリエーション |

## 9. 配送・送料

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 送料設定 | 送料区分（送料込/別）・配送方法管理番号 | shipping-template-name | postage-set / postage | Variant Requires Shipping + Shipping zones |
| 重量 | （無し） | item_weight | weight | Variant Grams |
| サイズ | （無し） | item_dimensions | （無し） | （メタフィールド） |
| 配送日数 | （無し） | fulfillment_latency | （無し） | （Shipping app） |
| 配送不可地域 | 配送方法管理番号で設定 | （無し） | （ストア設定） | （Shipping zones） |

## 10. 公開・販売設定

| 概念 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 販売開始 | 販売開始日時 | release_date / launch_date | release-date | Published / Published Scope |
| 販売終了 | 販売終了日時 | （無し） | （無し） | （Published OFF） |
| 公開状態 | 表示・非表示 | item_type + 在庫管理 | display（0/1） | Status (active/draft/archived) |
| 検索結果 | 検索表示 | （在庫切れだとデフォルト非表示） | (display) | Published Scope（販売チャネル別） |

## モール固有・対応列が無い項目

### 楽天固有
- 倍率（販売開始日／販売期限）
- レビュー特典関連
- スーパーDEAL／お買い物マラソン用設定
- ポイント変倍

### Amazon固有
- ASIN（自動採番）
- FBA関連（fulfillment_channel）
- 商品コンディション（new/used/refurbished）
- マーチャント特定の属性（型番／製造年／色コード等のカテゴリ別属性）

### Yahoo!固有
- 優良配送対応設定
- ストアポイント設定
- LYP会員向け施策

### Shopify固有
- Metafields（自由なカスタム属性）
- Vendor（モール仕様外の概念）
- Published Scope（販売チャネル別公開）
- 為替・多通貨

## エンコード／改行

| 項目 | 楽天 | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|
| 文字コード | Shift_JIS(CP932) | UTF-8 | Shift_JIS(CP932) | UTF-8 |
| 改行 | CR+LF | LF / CR+LF | CR+LF | LF |
| 区切り | カンマ | タブ(TSV) | カンマ | カンマ |
| BOM | 無 | 無 推奨 | 無 | 無 |

楽天⇔Shopify、Yahoo!⇔Shopifyは必ずエンコード変換が必要。
