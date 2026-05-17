# モール別 属性スキーマ

各モールの属性スキーマは変更されるため、最新の各モール公式情報を確認。以下は目安。

## 楽天市場

### 商品属性（属性値）の入力欄
- ジャンルID別に必要な属性が異なる
- ジャンル登録時に「商品属性」リストが提示される
- カラー・サイズ・素材は多くのジャンルで必須・推奨

### カラー属性
- 楽天では多くのジャンルでカラー絞り込み機能あり
- カタカナ統一推奨
- 自由記述だが、検索・絞り込みで効くキーワード

### サイズ属性
- アパレル：S/M/L/LL/3L のサイズ表記
- 寸法（実寸）は別属性

### 商品オプション（バリエーション）
- SKUプロジェクト後はバリエーション項目で管理
- 軸の名前と値を自由設定（「カラー：ネイビー、ブラック」「サイズ：M、L」）

### 楽天独自の属性
- 商品コード／カタログID
- ジャンルID
- メーカー型番

## Amazon

### 商品属性（フラットファイル）
- カテゴリ別にテンプレートが異なる
- 多くのカテゴリで以下が必須：
  - brand_name
  - manufacturer
  - color
  - size
  - material_type
  - department_name（メンズ／レディース等）

### バリエーション軸
- variation_theme で軸を指定（color／size／color-size／size-color など）
- 親子関係：parent-child SKU 構造
- 子SKU：個別バリエーション

### 属性値の標準化
- Amazonには「属性値辞書」がある（一部カテゴリ）
- 既定の値リストから選ぶことが望ましい（自由記述だと検索性低下）

### Amazonでよくある属性名
- color_name
- size_name
- material_type
- pattern_style（無地／柄物等）
- target_audience（メンズ／レディース／キッズ）
- season（春／夏／秋／冬）

## Yahoo!ショッピング

### スペック情報
- カテゴリ別にスペック項目が定義されている
- 商品スペック情報として入力

### スペック情報の例
- カラー
- サイズ
- 素材
- 重量
- 容量

### バリエーション
- カラー・サイズ等のバリエーション軸を持てる
- 商品コードはバリエーションごと個別

## Shopify

### 商品オプション
- Option1 / Option2 / Option3 の3軸まで（標準機能）
- 軸名は自由（Color / Size / Material 等）
- Variant単位でSKU・JAN・在庫・価格を管理

### Metafields
- 標準属性以外の情報をMetafieldsで拡張
- 例：「fit」「fabric_care」「country_of_origin」

### Shopify Markets
- 国別の言語・通貨設定
- 国別の商品属性カスタマイズ

## Google Merchant Center

### 必須属性
- id
- title
- description
- link
- image_link
- availability
- price
- brand
- gtin（JAN）
- mpn（メーカー型番）
- google_product_category
- condition

### 推奨属性
- color
- size
- size_type
- size_system
- gender
- age_group
- material
- pattern
- item_group_id（バリエーション親）

### 値の標準化
- gender: male / female / unisex
- age_group: newborn / infant / toddler / kids / adult
- condition: new / refurbished / used
- color: 英語表記推奨

### feed要件
- 価格は ISO 4217 通貨コード（「3000 JPY」「100 USD」）
- size の値は GMC が認識可能な形式
- 詳細はGoogle Merchant Centerヘルプ参照

## モール間のマッピング例

| 自社属性 | 楽天 | Amazon | Yahoo! | GMC |
|---|---|---|---|---|
| カラー | カラー（カタカナ） | color_name（英語＋日本語） | カラー | color（英語） |
| サイズ | サイズ | size_name | サイズ | size |
| 素材 | 素材 | material_type | 素材 | material |
| メーカー型番 | メーカー型番 | part_number | メーカー型番 | mpn |
| ブランド | ブランド／メーカー | brand_name | ブランド | brand |
| 対象 | （ジャンル次第） | department_name | （カテゴリ次第） | gender |

## 各モールでの注意点

### 楽天
- カラー・サイズの自由記述で揺れが発生しやすい → 自社標準値の徹底
- ジャンルIDの最新情報は別スキル（rakuten-genre-id-selector）

### Amazon
- 既定の属性値リストから選ぶことを推奨
- バリエーション軸の不適切な指定は親子関係エラー
- 「Variation Theme」をカテゴリに合わせて選択

### Yahoo!
- カテゴリパスの最新情報は別スキル（yahoo-category-path-selector）

### GMC
- 不承認になりやすい属性：価格欠落、画像不適切、ポリシー違反文言
- 詳細は別スキル（merchant-center-feed-error-fixer）

## モール間で属性値を変える戦略

- **統一値方針**：全モールで同じ表記（管理が楽）
- **モール最適化方針**：各モール検索性に合わせて値を変える（運用負荷高い）

実務上、コア属性（カラー・サイズ・素材）は統一値で、検索キーワードの工夫はタイトル・説明文で行うことが多い。

## バリエーション軸の運用ベストプラクティス

1. **同型商品のバリエーション**（カラー／サイズ違い）：親子バリエーションで管理
2. **モデル違い**（同型でもグレード違い）：別商品コード
3. **セット数違い**（3個入り／6個入り）：軸を分けるかバンドル扱いか
4. **対象違い**（メンズ／レディース）：別商品コード推奨
