# GTIN必須カテゴリと識別子要件

## 1. GTINとは

GTIN（Global Trade Item Number）はGS1が管理する国際商品コード。

- **GTIN-8**（JAN-8）：8桁、小型商品
- **GTIN-12**（UPC-A）：12桁、米加
- **GTIN-13**（JAN-13/EAN-13）：13桁、国際標準・日本
- **GTIN-14**：14桁、ケース・物流梱包
- **ISBN-13**：13桁、書籍（先頭978/979）
- **ISSN**：13桁形式、雑誌（先頭977）

GMCはこれらすべてを `gtin` 属性として受け付ける。

詳細：別スキル `jan-code-checker` 参照。

---

## 2. GTIN必須カテゴリ（メーカー製・新品の場合）

GTINを保有しているメーカー製の新品商品では、GTIN登録が原則必須。代表的なカテゴリ：

### 必須カテゴリ
- 家電・PC・周辺機器
- カメラ・ビデオ
- 食品・飲料
- 化粧品・パーソナルケア
- 書籍（ISBN）
- 音楽CD・映像メディア
- 玩具
- スポーツ用品の一部
- 衣料品（メーカー製ブランド品）
- 時計・宝飾品（メーカー製）
- 自動車部品
- 工具・ハードウェア

### 識別子3点セット（brand + GTIN + MPN）

GMCの商品識別子は次の3つの組合せで判定される：

| 属性 | 内容 | 例 |
|---|---|---|
| `brand` | ブランド名 | "Apple", "ユニクロ" |
| `gtin` | GTIN（JAN等） | "4901234567894" |
| `mpn` | メーカー型番（Manufacturer Part Number） | "MQR03J/A" |

メーカー製商品では **brand + gtin** または **brand + mpn** が原則必須。

---

## 3. GTIN免除（identifier_exists=no）

以下の商品はGTINを持たないため、`identifier_exists=no` で免除可能：

### 免除可能
- 自社オリジナル商品（ハンドメイド・自社ブランド）
- カスタマイズ商品（名入れ・サイズオーダー）
- ヴィンテージ・アンティーク
- 中古品の一部
- 業者・アーティスト固有の商品

### 免除設定
- フィードに `identifier_exists=no` を設定
- ただし「メーカー製の市販品」を免除設定にするとポリシー違反になり得る

---

## 4. 中古品（condition=used）

- 中古品はGTINを **持っていても・持っていなくても** 良い
- `condition` 属性で `new` / `used` / `refurbished` を指定
- 中古品でGTINが特定できないなら `identifier_exists=no`

---

## 5. 並行輸入品のGTIN

- 海外仕様の同一商品でGTINが異なる場合がある（米UPC-A、欧EAN-13、日本JAN-13）
- 日本のAmazon/楽天では日本仕様のJAN-13を期待
- 海外GTINでも受け付けられるが、カタログマッチングで問題になる場合あり

---

## 6. ISBN（書籍）

- 書籍は **ISBN-13**（先頭978または979）を `gtin` 属性に設定
- 著者・出版社の情報も併記

---

## 7. GTIN記載時の典型ミス

| 症状 | 原因 | 修正 |
|---|---|---|
| 桁数違反 | スペース・ハイフン混入／全角数字 | 半角数字のみ、ハイフン除去 |
| チェックデジット不一致 | 入力ミス／メーカー型番をGTINに入れた | 別スキル `jan-code-checker` で検証 |
| インストアコード（02/20-29）使用 | 社内コードを誤って公開 | GS1正式JANを取得 |
| ISBN混入 | 書籍以外でISBN番号使用 | 適切なGTIN取得 |
| 古いGTIN | 商品リニューアル時の旧コード | 最新のGTIN取得 |

---

## 8. フィードでの記述例

### 一般商品（GTINあり）
````
brand: ユニクロ
gtin: 4901234567894
mpn: 425678-00
identifier_exists: yes
condition: new
````

### 自社オリジナル
````
brand: 自社ブランド名
gtin: (空欄)
mpn: (空欄またはSKU)
identifier_exists: no
condition: new
````

### 書籍
````
brand: 出版社名
gtin: 9784101234567  (ISBN-13)
mpn: (空欄)
identifier_exists: yes
condition: new
````

### 中古品
````
brand: メーカー名
gtin: 4901234567894 (あれば)
mpn: 元型番
identifier_exists: yes (GTINあり) / no (なし)
condition: used
````

---

## 9. GTIN取得方法

### 自社オリジナル商品でGTINが必要な場合
- **GS1 Japan の事業者コード取得**（年間登録料あり）
- 事業者コード（7/9/10桁）+ 商品アイテムコード + チェックデジット
- GS1 Japan：https://www.gs1jp.org/

### メーカーからの仕入商品
- メーカーに問合せ
- 商品パッケージのバーコード
- メーカーのカタログ

### Amazon GTIN免除申請
- Amazonセラーセントラルで「商品IDのGTIN免除申請」
- ブランド登録（Amazon Brand Registry）が条件の場合あり

---

## 10. GMCのGTIN関連エラーメッセージ

| メッセージ | 原因 | 対応 |
|---|---|---|
| Invalid GTIN | チェックデジット不一致／文字種違反 | `jan-code-checker` で検証 |
| Missing required identifier | brand/GTIN/MPN不足 | 3点セットの補完 or 免除設定 |
| GTIN does not match product | GTINと商品名・brandが不一致 | 正しいGTINに修正 |
| Duplicate GTIN | 同一GTINが複数商品 | バリエーション別GTINに分離 |
| Manufacturer-assigned identifier required | メーカー製商品でGTIN必須 | GTIN取得 or 商品見直し |

---

## 11. 業種別のGTIN対応推奨

| 業種 | 推奨設定 |
|---|---|
| 化粧品（メーカー製） | gtin必須、brand+mpn併記 |
| 化粧品（自社製造） | identifier_exists=no |
| サプリ（メーカー製） | gtin必須 |
| ハンドメイド | identifier_exists=no、brand=自社名 |
| 中古アパレル | condition=used、GTINあれば設定 |
| 書籍 | ISBN-13をgtinに設定 |
| 食品 | gtin必須、賞味期限・原材料も記載 |
| 並行輸入家電 | 海外GTIN設定可、condition=newまたはused（日本でメーカー保証なしなら明示） |
