# variation_theme カテゴリ別ENUM

Amazon.co.jp の親子バリエーション設定で使用する `variation_theme` のカテゴリ別の主要値。

## 重要原則

- `variation_theme` はカテゴリ別のENUM
- 親と全子で**完全一致**が必須
- 値はカテゴリのテンプレートで確認（最新版を取得）
- 自由入力すると親子関係が壊れる

## アパレル・服

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Size | size_name |
| Color | color_name |
| SizeColor | size_name, color_name |
| ColorSize | size_name, color_name（順序違いだけ） |
| SizeName-ColorName | size_name, color_name |

### 使い分け
- **Size のみ**：単色商品でサイズ展開のみ
- **Color のみ**：単一サイズで色展開のみ
- **SizeColor**：色×サイズ両方の組合せ

### サイズ表記の例
- 数値：「26」「28」（ジーンズ等）
- 表記：「S」「M」「L」「XL」「XXL」
- 文字：「Small」「Medium」「Large」

### カラー表記の例
- 「Black」「White」「Navy」（英語）
- 「黒」「白」「紺」（日本語）
- 「ブラック」「ホワイト」「ネイビー」（カタカナ）

→ 親と全子で表記統一が必須。

## 靴

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Size | size_name |
| Width | width_name |
| Color | color_name |
| SizeColor | size_name, color_name |
| SizeWidth | size_name, width_name |
| SizeColorWidth | size_name, color_name, width_name |

### サイズ表記
- 「23.0」「23.5」「24.0」（cm）
- 「6」「6.5」「7」（US）

### Width
- 「Regular」「Wide」「Extra Wide」

## 食品・飲料

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Size | size_name（容量） |
| Flavor | flavor_name |
| Count | count_name（個数） |
| Volume | volume_name |
| ItemPackageQuantity | item_package_quantity |

### 例
- Size：「100ml」「500ml」「1L」
- Flavor：「醤油味」「塩味」「味噌味」
- Count：「3個入り」「5個入り」「10個入り」

## 家電

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Color | color_name |
| Style | style_name |
| Wattage | wattage |
| Capacity | capacity |

### 例
- Color：「ホワイト」「ブラック」「ブルー」
- Style：「スタンダード」「プレミアム」
- Capacity：「30L」「45L」（冷蔵庫）

## コスメ・スキンケア

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Color | color_name |
| Volume | volume_name |
| Scent | scent_name |
| Shade | shade_name（口紅・ファンデーション） |

### 例
- Color：「Red」「Pink」「Beige」（口紅）
- Volume：「30ml」「50ml」「100ml」
- Scent：「Rose」「Citrus」「Lavender」
- Shade：「Light」「Medium」「Tan」

## バッグ・小物

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Color | color_name |
| Size | size_name |
| Pattern | pattern_name |
| Material | material_type |

### 例
- Color：色名
- Size：「Small」「Medium」「Large」
- Pattern：「Solid」「Striped」「Floral」

## ペット用品

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Size | size_name |
| Color | color_name |
| Style | style_name |

### 例（ペットフード）
- Size：「2kg」「5kg」「10kg」
- Flavor：「チキン」「サーモン」「ビーフ」

### 例（ペット服）
- Size：「XS」「S」「M」「L」（犬の体重別）

## ベビー・キッズ

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Size | size_name |
| Color | color_name |
| Age | target_age |

### 例（ベビー服）
- Size：「60」「70」「80」「90」（cm基準）
- Color：「ピンク」「ブルー」「イエロー」

## スポーツ・アウトドア

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Size | size_name |
| Color | color_name |
| Type | type_name |

### 例（ヨガマット）
- Size：「Standard（173x61cm）」「Long（183x66cm）」
- Color：「ピンク」「ブルー」「グレー」

## 文房具・オフィス

### 主要 variation_theme

| 値 | 必須属性 |
|---|---|
| Color | color_name |
| Size | size_name |
| Style | style_name |

### 例（ノート）
- Size：「A5」「B5」「A4」
- Style：「Blank」「Lined」「Grid」

## variation_theme 選定の指針

### 1属性のみ → Single Theme
- 色のみ違う：`Color`
- サイズのみ違う：`Size`
- 容量のみ違う：`Volume`

### 2属性 → Combined Theme
- 色×サイズ：`SizeColor` or `ColorSize`
- サイズ×幅：`SizeWidth`

### 3属性以上 → Multi Theme
- サイズ×色×幅：`SizeColorWidth`
- ただし対応するENUMがない場合は2属性に簡略化を検討

## ENUM違反の典型

### NG 例

```text
親：variation_theme=Color, Size
子1：variation_theme=ColorSize
```

→ カンマ区切りは無効、`SizeColor` のようなENUM値を使用。

### NG 例 2

```text
親：variation_theme=Size
子1：variation_theme=size  （小文字）
```

→ 大文字小文字も厳密。

### NG 例 3

```text
親：variation_theme=SizeName-ColorName
子1：variation_theme=Size-Color
```

→ ENUM 値の正確な綴り。

## 親と子で一致させる項目

```text
親行：
  parent_child: parent
  variation_theme: SizeColor
  
子行（全子で同じ）：
  parent_child: child
  parent_sku: [親のitem_sku]
  relationship_type: variation
  variation_theme: SizeColor  ← 親と一致
```

## 既存テーマの変更

既存ASIN で variation_theme を変更：
- 親子関係が一度切れる
- レビュー集約・購入履歴がリセットされる可能性
- 重大な影響あり、慎重に判断

代替案：
- 旧親子を販売停止
- 新親子を別に作成
- 段階的に移行

## カテゴリ別ENUM の取得方法

1. セラーセントラル「在庫＞商品登録＞テンプレートのダウンロード」
2. 該当カテゴリのテンプレート（Excel）
3. 「Valid Values」シートで `variation_theme` の有効値確認
4. 採用する値をコピー

## 不明な場合のフォールバック

カテゴリの公式ENUMが見つからない・該当値がない場合：
1. セラーセントラル「お問い合わせ」でカタログサポートに相談
2. 類似商品（同カテゴリの上位ASIN）の variation_theme を参考
3. 最も近いENUM 値を採用

詳細：`amazon-catalog-conflict-ticket-builder` スキル

## 国別の違い

- 日本Amazon と米国Amazon でENUM 値が異なる場合あり
- 米国出品時は別途確認
- 詳細：`amazon-us-localization-jp-brand` スキル
