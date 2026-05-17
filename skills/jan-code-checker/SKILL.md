---
name: jan-code-checker
description: JAN／GTIN／EAN／UPC／ISBNなど商品識別コードの桁数・チェックデジット・重複・国コード・商品との紐付けを検証するスキル。「JANチェック」「チェックデジット確認」「JANの重複を見て」「GTIN妥当性」「EAN検証」「ISBN正しい？」「JANと商品名がズレてる」「インストアコードでいい？」「13桁か8桁か」「JANがない商品の登録」など、JAN／GTIN系の妥当性検証で使う。楽天カタログID／Amazon external_product_id／Yahoo product-code／Google Merchant GTIN／自社マスタの整合性確認まで対応。※Amazonフラットファイル全体の検証は別スキル `amazon-flat-file-validator-jp`、Google Merchant Centerのフィードエラー修正は `merchant-center-feed-error-fixer`、文字化け・SJIS問題は `csv-encoding-sjis-validator`。
verified_at: 2026-05
---

# JANコード／GTIN 妥当性チェック

## 概要

JAN（GTIN-13）／GTIN-8／GTIN-12（UPC-A）／GTIN-14（ITF）／ISBN-13など商品識別コードの形式・チェックデジット・国コード（プリフィックス）・重複・商品マスタとの紐付け整合性を検証する。

楽天カタログID／Amazon external_product_id／Yahoo product-code／Google Merchant Center gtin／ネクストエンジン／クロスモール等の商品マスタにJANを登録する前段の品質チェックに使う。

## ★最重要原則

**チェックデジットが合わない／重複している／インストアコードを社外に出している、の3つが致命傷。** これらはモール登録時のエラー、リスティング不承認、商品取り違えの直接原因になる。本スキルは「JANを生成する」道具ではなく「**既存のJANの妥当性を検証する**」道具。JANを持っていない商品に勝手にJANを当てない。

## 知識ベース

詳細は references/ を参照：

- JAN-13／GTIN-8／GTIN-12／GTIN-14のチェックデジット算出アルゴリズム：`references/check-digit-algorithm.md`
- 国コード（プリフィックス）一覧と書籍・インストア・クーポン用の特殊レンジ：`references/prefix-country-codes.md`
- 楽天カタログID／Amazon external_product_id／Yahoo product-code／Google Merchant gtin の登録仕様差異：`references/mall-integration-notes.md`
- 実例集（重複検出／チェックデジット誤り／インストアコード混入）：`references/examples.md`

要点（本ファイルに留めるもの）：

| コード種別 | 桁数 | 用途 |
|---|---|---|
| JAN-13 / GTIN-13 | 13桁 | 国際標準。日本は45・49で始まる |
| JAN-8 / GTIN-8 | 8桁 | 小型商品の短縮版 |
| GTIN-12 / UPC-A | 12桁 | 米国・カナダ |
| GTIN-14 / ITF | 14桁 | ケース・段ボール単位 |
| ISBN-13 | 13桁 | 書籍（978／979で始まる） |
| インストア | 13桁 | 02／20-29で始まる。**社内専用、社外配信NG** |

国コード（プリフィックス）の代表例：

| プリフィックス | 地域 |
|---|---|
| 45 / 49 | 日本 |
| 00-13 | 米国・カナダ |
| 30-37 | フランス |
| 40-44 | ドイツ |
| 690-699 | 中国 |
| 880 | 韓国 |
| 978 / 979 | 書籍（ISBN） |
| 02 / 20-29 | インストア（社内専用） |

詳細は `references/prefix-country-codes.md`。

## 処理フロー

### Step 1：形式チェック

- 半角数字のみか（全角混入・ハイフン混入・空白を検出）
- 桁数が13／12／8／14のいずれか
- 先頭ゼロが落ちていないか（Excelで「4901234」のように先頭0/4が消えている事例）

### Step 2：チェックデジット検証

JAN-13の場合（12桁目までから13桁目を算出）：

1. 1・3・5・7・9・11桁目（奇数桁）の和 = A
2. 2・4・6・8・10・12桁目（偶数桁）の和 × 3 = B
3. A + B の下1桁を取り、10から引く（下1桁が0なら0）

**検算例**：`490123456789` の13桁目を計算

- 奇数桁（1,3,5,7,9,11桁目）：4 + 0 + 2 + 4 + 6 + 8 = 24
- 偶数桁（2,4,6,8,10,12桁目）：(9 + 1 + 3 + 5 + 7 + 9) × 3 = 34 × 3 = 102
- A + B = 24 + 102 = 126 → 下1桁 = 6
- 10 - 6 = 4 → チェックデジット = 4
- 完成形：**4901234567894**

GTIN-12／GTIN-8／GTIN-14／ISBN-13も同じく「奇数桁＋偶数桁×3」方式（桁位置の数え方は左右どちらから始めるかで実装が変わるため、`references/check-digit-algorithm.md` の擬似コードに従う）。

### Step 3：プリフィックス（国コード）検証

- 自社が日本ブランドで「49・45以外」 → 海外OEM／並行輸入／メーカー直登録の確認
- 「02・20-29」で始まる → インストアコード（社内専用）。**社外配信用CSVに含めない**
- 「978・979」で始まる → 書籍。書籍以外なら誤登録

### Step 4：重複検出

- 同一CSV内で同じJANに異なる商品名／SKUが紐付いていないか
- 既存マスタとの突合で「同じJANが別商品に既に登録」されていないか
- バリエーション親子で「親と子で同じJAN」になっていないか（親はJAN不要、子別にJAN）

### Step 5：商品名・型番との整合性

- メーカー型番からGS1のGEPIRで照会できる場合は照合
- 商品名のキーワードとJANプリフィックスが矛盾していないか
- 旧型番のJANを新商品に流用していないか

### Step 6：モール仕様との突合

`references/mall-integration-notes.md` を参照：

- 楽天：カタログIDは13桁推奨。JAN/EAN/ISBN/UPC可
- Amazon：external_product_id_type（EAN／GTIN／UPC／ISBN）と external_product_id をペアで指定。ブランド登録でGTIN免除も可
- Yahoo：product-code欄
- Google Merchant：gtin属性。新商品ブランドでGTINない場合は identifier_exists=no

## 出力フォーマット（必須）

````markdown
# JAN／GTIN 検証結果

## 0. サマリ
- 検査件数：N件
- 正常：N件 / 警告：N件 / エラー：N件

## 1. エラー（即修正）
| 行 | JAN | SKU | 商品名 | 種別 | 詳細 |
|---|---|---|---|---|---|
|  |  |  |  | チェックデジット誤り | 入力CD=X、計算CD=Y |
|  |  |  |  | 桁数異常 | 12桁入力／13桁必要 |
|  |  |  |  | インストア混入 | プリフィックス20-29 |

## 2. 警告（要確認）
| 行 | JAN | SKU | 商品名 | 種別 | 詳細 |
|---|---|---|---|---|---|
|  |  |  |  | 重複JAN | 別SKUに同一JAN |
|  |  |  |  | 国コード相違 | 日本ブランドだが49/45以外 |

## 3. JANなし商品の扱い
- N件がJAN空欄
- 推奨対応：<GS1新規取得／ブランド登録でGTIN免除／identifier_exists=no 設定>

## 4. 修正案
- CSVの該当行・該当列・修正値を提示

## 5. 確認チェックリスト
- [ ] CSVのバックアップを取得した
- [ ] チェックデジット計算は手動でも1件以上検算した
- [ ] インストアコードを社外配信CSVに含めていない
- [ ] バリエーション親に誤ってJANを入れていない
- [ ] モール側のJAN登録仕様（楽天カタログID／Amazon external_product_id_type／Yahoo product-code／GMC gtin）を確認した
````

## 品質ゲート

- [ ] チェックデジット計算が正しい方式で実装されている（奇数和＋偶数和×3、桁位置の数え方が一貫）
- [ ] 検算例の数値が実際に計算で再現する
- [ ] インストアコード（02／20-29）を「社外配信NG」と明示している
- [ ] JAN空欄商品に勝手にJANを生成・割当していない
- [ ] バリエーション親子のJAN扱いを区別している
- [ ] 重複検出が「同一CSV内」と「既存マスタとの突合」の両方を含む

## エッジケース

- **Excel保存で先頭0が落ちる** → CSVを「テキスト」型でインポート、または0付き文字列で保持。詳細は `references/examples.md`
- **ハイフン入りISBN** → 「978-4-...」表記を内部処理ではハイフン除去で13桁検証
- **8桁JAN（短縮JAN）** → 桁数違いではない。チェックデジット式は同じだが先頭6桁が事業者コード
- **GS1未登録ブランドのGTIN要求（Amazon／GMC）** → ブランド登録 or identifier_exists=no で運用
- **同一商品の同梱バンドル** → 個別JANと別にバンドル用JANを取得する原則。流用しない

## 注意事項

- JANはGS1ジャパン（旧財団法人流通システム開発センター）の登録制。社内発番のJANを社外に出さない
- チェックデジットが合うだけでは「正しいJAN」とは限らない（重複・型番違い・古い廃番JAN流用などの可能性）
- モール側のJAN登録仕様は改定される。最新の公式ヘルプを確認
- 顧客固有のSKU／取引コードを出力に含めない

## references/ 一覧

- `references/check-digit-algorithm.md` — JAN-13／8／12／14／ISBN-13のチェックデジット算出方式と擬似コード
- `references/prefix-country-codes.md` — 国コード（プリフィックス）一覧、インストア・書籍・クーポン用特殊レンジ
- `references/mall-integration-notes.md` — 楽天／Amazon／Yahoo／GMCのJAN登録仕様差異
- `references/examples.md` — 重複検出／チェックデジット誤り／インストア混入の実例集

## 参考公式情報源

- GS1ジャパン「GTINの基礎知識」「GS1事業者コードの取得」
- 流通システム開発センター「JANコード解説」
- 楽天RMS「カタログID／商品コード仕様」
- Amazon「商品識別子（GTIN・EAN・UPC）」「ブランド登録によるGTIN免除」
- Google Merchant Center ヘルプ「gtin属性」「identifier_exists属性」
