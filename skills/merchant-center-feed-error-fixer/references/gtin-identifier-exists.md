# GTIN・identifier_exists の扱い

GMCにおける商品識別子（GTIN/MPN/ブランド）の扱いは、カテゴリと商品種別で変わる。**多くのカテゴリでGTINが必須**、自社製造の場合は `identifier_exists: false` で回避。

## 識別子の3要素

| 属性 | 意味 | 例 |
|---|---|---|
| gtin | GTIN（JAN/EAN/UPC/ISBN） | 4901234567894 |
| mpn | メーカー型番 | XYZ-12345-AB |
| brand | ブランド | Apple, ユニクロ |
| identifier_exists | 識別子の存在 | true / false |

## GTIN必須カテゴリ（一般的に）

以下のカテゴリは**GTINがあれば必須**：

- 食品・飲料
- 健康食品
- 化粧品・パーソナルケア
- 医薬品（一部）
- 家電・電子機器
- 書籍・メディア（ISBN）
- スポーツ・アウトドア用品
- おもちゃ
- ペット用品

**最新のGTIN必須カテゴリリストは Google Merchant Center ヘルプを確認**。

## GTIN推奨カテゴリ

GTINがなくても他属性（brand+mpn）で代替可能なカテゴリ：

- ハンドメイド・自社製造商品
- アンティーク・ヴィンテージ
- カスタマイズ商品（オーダーメイド）
- 一部のアパレル（無印のオリジナル等）

## GTINの形式

| 形式 | 桁数 | 用途 |
|---|---|---|
| GTIN-13 (JAN-13/EAN-13) | 13桁 | 日本・国際標準 |
| GTIN-12 (UPC-A) | 12桁 | 米国・カナダ |
| GTIN-8 (JAN-8) | 8桁 | 小型商品 |
| GTIN-14 (ITF) | 14桁 | 物流梱包 |
| ISBN-13 | 13桁 | 書籍（先頭978/979） |

### チェックデジット検証

GMCはGTINのチェックデジットを検証する。不一致なら無効扱い。

汎用アルゴリズム（GS1標準）：
1. チェックデジットを除いた本体部分
2. 本体を右端から `3, 1, 3, 1, ...` の重みでかける
3. 合計を求める
4. 合計 mod 10 = r
5. CD = (10 - r) mod 10

詳細は `jan-code-checker` スキルの `references/check-digit-algorithm.md` を参照。

### NG例

- 桁数違反：12桁または14桁を13桁として入力
- チェックデジット不一致：末尾1桁が間違い
- 文字種違反：英字混入、ハイフン混入

### OK例

- `4901234567894`（GTIN-13、CD=4）
- `9784101234567`（ISBN、CD=7）
- `012345678905`（UPC-A、CD=5）

## identifier_exists の使い方

### `identifier_exists: false` が使えるケース

- 自社製造のオリジナル商品（GTINを取得していない）
- 完全カスタマイズ商品
- ハンドメイド
- アンティーク・ヴィンテージ

### 必須となる代替属性

`identifier_exists: false` を使う場合：
- **brand**：必須
- mpn：推奨（あれば）
- 他の必須属性（title, description, etc.）も当然必要

### NG：identifier_existsを使うべきでないケース

- GTINがあるのに「面倒だから」`false` にする
- メーカー品をGTIN取得せず `false` 申請
- → ポリシー違反、不承認

## ブランドの扱い

### brand 属性

- 全カテゴリで実質必須（identifier_exists:false のときは絶対必須）
- 70字以内
- 商品ページのブランド表記と一致

### ブランドが「Generic」「ノーブランド」の場合

- 「Generic」「No Brand」「ノーブランド」と入力（推奨される表記はGoogleヘルプ参照）
- ただしブランドなしの商品は不承認になる場合あり
- 自社ブランドを命名するのが推奨

## MPN（メーカー型番）の扱い

- メーカー独自の商品コード
- GTINがない場合の補完
- 例：`XPS-13-9300`, `iPhone15-128GB-BLK`

## GTIN取得方法

### 日本国内：GS1 Japan

1. GS1 Japan の事業者コード取得（年間登録料：売上規模による）
2. 事業者コード + 商品アイテムコード + チェックデジット = GTIN
3. 商品毎にGTINを採番

### 海外輸入品

- メーカー発行のGTINをそのまま使う
- 並行輸入の場合、輸入元のGTINを確認

### 書籍

- ISBN-13（先頭978/979）
- 国際標準書籍番号、出版社が発行

## バリエーション商品のGTIN

バリエーション（色・サイズ違い）毎に**別GTIN**が原則。

NG：
- 黒S, 黒M, 黒L 全て `4901234567894`

OK：
- 黒S: `4901234567894`
- 黒M: `4901234567901`
- 黒L: `4901234567918`

メーカーが意図的に同一GTINを採番している場合もあるが、その場合はメーカーに確認。

## エラー対応フロー

### Case A: `Invalid GTIN` エラー

1. GTINの形式確認（8/12/13/14桁、数字のみ）
2. チェックデジット検証（`jan-code-checker` で）
3. 不一致なら正しいGTINに修正
4. GTINが間違いだったらメーカーに問合せ

### Case B: `Missing identifier: GTIN, MPN, or identifier_exists` エラー

1. 商品にGTINがあるか確認
2. GTINがあれば入力
3. GTINがなく、ブランド品なら GTINをメーカーから取得
4. 自社オリジナルなら `identifier_exists: false` + brand 必須

### Case C: `Identifier_exists set to false but identifiers found`

1. `identifier_exists: false` を設定しているが、商品ページにGTINが見つかった
2. → どちらかに統一
3. GTIN取得済みなら `identifier_exists: true` (default) + gtin 入力
4. GTIN未取得なら `identifier_exists: false`、商品ページからGTIN削除

### Case D: `Brand attribute required`

1. brand 属性を入力
2. 70字以内
3. 商品ページのブランド表記と一致

## 設定パターン早見表

| 商品種別 | gtin | mpn | brand | identifier_exists |
|---|---|---|---|---|
| メーカー品（GTINあり） | 入力 | 推奨 | 必須 | 省略可（デフォルトtrue） |
| メーカー品（GTINなし） | 空 | 入力 | 必須 | false |
| 自社オリジナル（GTIN取得済） | 入力 | 任意 | 必須 | 省略可 |
| 自社オリジナル（GTIN未取得） | 空 | 任意 | 必須 | false |
| ハンドメイド | 空 | 任意 | 必須（自社名） | false |
| 書籍 | ISBN-13 | 書籍コード | 出版社 | 省略可 |
| 並行輸入 | 元国のGTIN | 任意 | 海外ブランド | 省略可 |

## カテゴリ別の運用

### 食品・飲料
- GTIN必須
- expiration_date（消費期限／賞味期限）
- unit_pricing_measure（容量・重量）

### 化粧品
- GTIN必須
- 薬機法表現に注意（別スキル）
- ブランドと型番（mpn）

### 家電
- GTIN推奨
- mpn 推奨
- カテゴリ別のスペック属性

### 書籍
- gtin に ISBN-13
- mpn に出版社コード
- brand に出版社名

### 衣料品
- GTIN推奨
- size, color, age_group, gender 必須
- mpn は型番（あれば）

## 公式リソース

- Google Merchant Center ヘルプ「GTIN要件」
- Google Merchant Center ヘルプ「商品データの仕様」
- GS1 Japan「GS1事業者コード新規登録」
- GS1 Japan「チェックデジットの計算方法」
