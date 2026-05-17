# 親子バリエーション設計

Amazon の親子バリエーション（Variation Relationship）の必須列と整合性チェック。

## 親子の役割

### 親（parent）
- 商品ページに表示される統一ページ
- 価格・在庫は持たない（空欄）
- 子のバリエーション選択UI（色・サイズ等）が表示される
- レビュー・Q&A は親に集約される

### 子（child）
- 実際に在庫・価格・JANを持つSKU
- 親の下にぶら下がる
- 各子は色・サイズ等の組合せでユニーク

## 必須列

### 親行

| 列 | 値 |
|---|---|
| `item_sku` | 親の管理SKU |
| `parent_child` | `parent` |
| `parent_sku` | （空欄） |
| `relationship_type` | （空欄） |
| `variation_theme` | カテゴリ別ENUM（例：`Size-Color`） |
| `item_name` | 親商品名（共通） |
| `brand_name` | ブランド名 |
| `item_type` | カテゴリ別ENUM |
| `standard_price` | （空欄） |
| `quantity` | （空欄） |
| `external_product_id` | （空欄） |

### 子行

| 列 | 値 |
|---|---|
| `item_sku` | 子の管理SKU（親とは別） |
| `parent_child` | `child` |
| `parent_sku` | 親のitem_sku |
| `relationship_type` | `variation` |
| `variation_theme` | 親と同じ |
| `item_name` | 子の商品名（色・サイズ含む） |
| `external_product_id` | JAN／GTIN（子ごとに別） |
| `external_product_id_type` | EAN等 |
| `standard_price` | 価格 |
| `quantity` | 在庫数 |
| variation 関連列 | `color_name`, `size_name` 等 |

## variation_theme のカテゴリ別ENUM（代表）

| カテゴリ | 主要なvariation_theme |
|---|---|
| アパレル | `Size` / `Color` / `SizeColor` / `ColorSize` / `SizeName-ColorName` |
| 靴 | `Size` / `Width` / `Color` / `SizeColor` |
| 食品 | `Size` / `Flavor` / `Count` / `Volume` |
| 家電 | `Color` / `Style` / `Wattage` |
| コスメ | `Color` / `Volume` / `Scent` / `Shade` |
| バッグ | `Color` / `Size` / `Pattern` |

`variation_theme` がカテゴリのENUM違反だと、親子が結びつかない。

## 整合性チェック項目

### 親行
- [ ] `parent_child=parent`
- [ ] `parent_sku` が空
- [ ] `relationship_type` が空
- [ ] `variation_theme` が指定されている
- [ ] `standard_price`, `quantity`, `external_product_id` が空

### 子行
- [ ] `parent_child=child`
- [ ] `parent_sku` が親の `item_sku` と一致
- [ ] `relationship_type=variation`
- [ ] `variation_theme` が親と同じ
- [ ] `external_product_id` がユニーク（同じ親の子間で重複NG）
- [ ] バリエーション列（color_name 等）が埋まっている

### 子の組合せ
- [ ] 色×サイズの組合せに重複がない
- [ ] 親が `Size-Color` ならすべての子が `color_name` と `size_name` を持つ
- [ ] 色だけ・サイズだけの中途半端な組合せがない

## バリエーション設計の実例

### 例1：シャツ・色×サイズ

親：`SHIRT-PARENT` (variation_theme=`SizeColor`)
- 子1：`SHIRT-BLK-S` (color=Black, size=S)
- 子2：`SHIRT-BLK-M` (color=Black, size=M)
- 子3：`SHIRT-BLK-L` (color=Black, size=L)
- 子4：`SHIRT-WHT-S` (color=White, size=S)
- 子5：`SHIRT-WHT-M` (color=White, size=M)
- 子6：`SHIRT-WHT-L` (color=White, size=L)

→ 黒3サイズ＋白3サイズ＝6子で完成

### 例2：醤油・容量バリエーション

親：`SOYSAUCE-PARENT` (variation_theme=`Size`)
- 子1：`SOYSAUCE-200ML` (size_name=200ml)
- 子2：`SOYSAUCE-500ML` (size_name=500ml)
- 子3：`SOYSAUCE-1L` (size_name=1L)

### 例3：コスメ・カラー×容量

親：`LIPSTICK-PARENT` (variation_theme=`ColorVolume` 等カテゴリENUMに従う)
- 子1：`LIPSTICK-RED-3G`
- 子2：`LIPSTICK-RED-5G`
- 子3：`LIPSTICK-PINK-3G`
- 子4：`LIPSTICK-PINK-5G`

## よくある不整合エラー

### エラー1：parent_sku の参照ミス
- 子行の `parent_sku` が親行の `item_sku` と一文字違い
- 親が存在しないSKUを参照
- 同じファイル内に親行が存在しない

### エラー2：variation_theme の不一致
- 親 `variation_theme=Size`, 子 `variation_theme=SizeColor` → 不一致でエラー
- 親と子で必ず一致させる

### エラー3：組合せ重複
- 子1（Black, M）と子2（Black, M）が同一 → エラー
- 同じ親の下では色×サイズの組合せは一意

### エラー4：variation 列の欠落
- variation_theme=`SizeColor` なのに `color_name` か `size_name` のどちらかが空 → エラー

### エラー5：external_product_id の重複
- 同じJANが2つの子に紐づいている → 各子は別GTIN必須

### エラー6：親に価格・在庫
- 親行に `standard_price=1980`, `quantity=10` などを入れている → 親は空欄が正しい

## バリエーション設計の修正フロー

1. 親行を1行作る（価格・在庫・JAN空欄、variation_theme設定）
2. 子行を1つずつ追加（parent_sku参照、variation列埋め、JAN個別）
3. 全子のバリエーション組合せが重複しないかチェック
4. 同じファイル内に親・子がすべて含まれているか確認
5. アップロード前にテスト1〜2行で先行検証

## 既存ASINとの親子化

既存単独ASIN（バリエーションなし）を後から親子化する場合：

1. 親SKU を新規作成
2. 既存子SKU の `parent_sku` を新親に設定
3. `relationship_type=variation` 設定
4. `variation_theme` 設定
5. アップロード

ただし、レビュー集約・既存ASINの引継ぎは複雑。バリエーション化はASIN設計の初期に決めるのが鉄則。

## 詳細監査スキル

親子バリエーションの監査専用スキル：`amazon-variation-parent-child-audit`
