---
name: yahoo-product-csv-validator
description: Yahoo!ショッピングの商品CSV／在庫CSV／オプションCSVの列名・文字コード・上限・整合性を検証するスキル。「Yahoo CSV エラー」「商品CSVアップロードでエラー」「Shift_JIS 文字化け」「列名のスペルミス」「全角75文字超え」「product-category 設定」「JAN欠損」「孤立在庫」「在庫CSV」「オプションCSV」「ヘッダー列が認識されない」などのリクエストで使う。Yahoo!のCSV仕様（Shift_JIS／CR+LF／ハイフン区切りヘッダー）に特化した一括点検と修正指示の出力。※商品名のSEO最適化は別スキル `yahoo-shopping-seo-title`、カテゴリ選定は `yahoo-category-path-selector`、楽天やAmazonのCSV検証はそれぞれ別スキル。
verified_at: 2026-05
---

# Yahoo!ショッピング 商品CSVバリデータ

## 概要

Yahoo!ショッピングのCSV取込は、列名のハイフン区切り（例：`product-category`）、文字コード Shift_JIS（CP932）、改行 CR+LF、ヘッダー全角不可、といった独自仕様で詰まりやすい。

本スキルは、商品データCSV／在庫データCSV／オプションデータCSVの列定義、必須・任意の上限、よくあるヘッダーミス、CSV間の整合性（孤立在庫・孤立オプション）を一括点検し、行単位の修正指示を出力する。

## 最重要原則

**CSV取込エラーの9割は「列名スペル違い／文字コード違反／文字数オーバー／孤立データ」のいずれか。それを最初の30秒で見つける。** 細部の中身検証よりも、まず構造（ヘッダー・文字コード・改行コード・列数）と整合性（CSV間のcode一致）を見るのが時間効率上 最も合理的。

## 知識ベース

| トピック | 参照 |
|---|---|
| CSV列定義（商品／在庫／オプション）完全リスト | `references/csv-columns.md` |
| 文字コード・改行コード・BOMチェック | `references/encoding-checks.md` |
| よくあるエラーとその直し方 | `references/common-errors.md` |
| 修正例（Before/After） | `references/examples.md` |

要点：
- 文字コード Shift_JIS（CP932）、改行 CR+LF、ヘッダー半角英小文字
- name 上限 全角75文字（150byte）、headline 全角60文字、caption 全角5,000文字、abstract 全角160文字、explanation 全角3,000文字、meta-description 80文字
- 必須列：code、name、price、path、display（任意だが実質必須：product-category、product-code、quantity）
- 在庫CSVとオプションCSVは商品CSVの code に依存（存在しない code は孤立データ）

## 処理フロー

### Step 1：ファイル単位の構造チェック
- 文字コード：Shift_JIS（CP932）であるか（UTF-8 はNG、BOM付きも要確認）
- 改行コード：CR+LF（Windows）であるか（LFのみはNG）
- ヘッダー1行目が半角英小文字のハイフン区切りか
- 列数と全行のカラム数が一致するか（カラム欠落・余剰）

### Step 2：ヘッダー列名検証
`references/csv-columns.md` の正規列名と照合。よくあるミス：
- `codes`／`prices`（複数形NG、単数形）
- `cation`（caption の typo）
- `product_category`（アンダースコアNG、ハイフン）
- `productCode`（キャメルケースNG）
- 全角ヘッダー、大文字ヘッダー

### Step 3：必須列の充足チェック
- code、name、price、path、display が全行で空欄でないか
- code がストア内ユニークか（重複検出）

### Step 4：文字数・byte数チェック
| 列 | 上限 |
|---|---|
| name | 全角75文字（150byte） |
| headline | 全角60文字 |
| caption | 全角5,000文字 |
| abstract | 全角160文字 |
| explanation | 全角3,000文字 |
| meta-description | 80文字 |

全角・半角混在は byte 換算で判定。

### Step 5：データ型・値域チェック
- price、quantity：半角整数か
- display：1 or 0 か
- taxable：0 or 1 か
- sale-period-start / sale-period-end：`YYYY-MM-DD hh:mm:ss` 形式か
- product-code：JAN-13（数値13桁）か、ISBN-13（978/979始まり）か

### Step 6：CSV間の整合性チェック
- 在庫CSVの code が商品CSVに存在するか（孤立在庫の検出）
- オプションCSVの code が商品CSVに存在するか
- 商品CSVの code に対応する在庫が在庫CSVにあるか（欠損）

### Step 7：推奨設定の有無
- product-category（Yahoo!プロダクトカテゴリID）が設定されているか
- product-code（JAN）が設定されているか
- shopping-search-keywords が空欄でないか
- ystore-image1（メイン画像）が設定されているか

### Step 8：エラー一覧と修正指示の出力
行番号・列名・現在値・推奨修正値の表で出力。

## 代表例

### 検出される代表的エラー

```
行3 | name | "本革 二つ折り財布 メンズ 薄型 大容量 カードたくさん入る 通勤 ビジネス 父の日 プレゼント ギフト 30代 40代 50代 高級感"
→ 全角文字数 80字（上限75字超過）
→ 修正案：「カードたくさん入る」を shopping-search-keywords へ移動。残り70字以内に。

行7 | product_category | "1234"
→ ヘッダー名NG。`product-category` （ハイフン）に修正。

行12 | code | "AB-001"（行5と重複）
→ ストア内ユニーク違反。

行15 | quantity | "５"
→ 全角数字NG。半角「5」へ。

文字コード | UTF-8 検出
→ Shift_JIS（CP932）に変換。

孤立在庫 | code="XYZ-999" が在庫CSVに存在するが商品CSVに無し
→ 商品CSVに XYZ-999 を追加するか、在庫CSVから削除。
```

## 出力フォーマット

````markdown
# Yahoo!商品CSV バリデーション結果

## 1. ファイル構造チェック
| 項目 | 検出 | 推奨 | 判定 |
|---|---|---|---|
| 文字コード |  | Shift_JIS (CP932) |  |
| 改行コード |  | CR+LF |  |
| ヘッダー形式 |  | 半角英小文字ハイフン区切り |  |
| 列数一致 |  | 全行同数 |  |

## 2. ヘッダー列名チェック
| 行 | 検出列名 | 正規列名 | 修正必要 |
|---|---|---|---|

## 3. 必須列充足
| 行 | 列 | 状況 |
|---|---|---|

## 4. 文字数・byte数オーバー
| 行 | 列 | 検出文字数 | 上限 | 修正案 |
|---|---|---|---|---|

## 5. データ型・値域エラー
| 行 | 列 | 現在値 | 推奨値 |
|---|---|---|---|

## 6. CSV間整合性
| 種別 | 状況 |
|---|---|
| 孤立在庫 |  |
| 孤立オプション |  |
| 在庫CSVに無い商品 |  |

## 7. 推奨設定の充足率
| 推奨項目 | 充足率 |
|---|---|
| product-category 設定 | XX% |
| product-code 設定 | XX% |
| shopping-search-keywords 設定 | XX% |
| ystore-image1 設定 | XX% |

## 8. 修正指示一覧（行単位）
| 行 | 列 | 現在 | 修正後 | 理由 |
|---|---|---|---|---|

## 9. 最終チェック
- [ ] 文字コード Shift_JIS
- [ ] 改行コード CR+LF
- [ ] ヘッダー全行半角英小文字ハイフン区切り
- [ ] 必須列（code/name/price/path/display）全行充足
- [ ] code はストア内ユニーク
- [ ] 文字数上限を超える行なし
- [ ] CSV間で孤立データなし
- [ ] アップロード前にバックアップ取得済み
````

## 品質ゲート

- 検出はファイル全体を走査したか（先頭10行で打ち切らない）
- 文字コード・改行コードの判定根拠を明示しているか
- 全角／半角混在の文字数チェックは byte 換算で行ったか
- 孤立データの方向（在庫→商品方向、商品→在庫方向）を両方チェックしたか
- 修正案は行番号・列名・現在値・修正後値・理由を揃えているか

## エッジケース

- **絵文字・サロゲートペアの混入**：Shift_JISに変換できず文字化けまたは欠落する。商品名・caption内の絵文字を検出して削除案を提示
- **半角カナ・機種依存文字**：半角カナ（ﾒﾝｽﾞ）、丸数字（①②）、㎏㎝などの単位記号、ローマ数字（ⅠⅡ）は変換または削除
- **caption内のHTML**：caption は HTML可だが、`<script>` 等のセキュリティ系タグや閉じ忘れタグは検出して指摘
- **sale-period 形式**：`YYYY/MM/DD hh:mm` のスラッシュ・コロンなしは構文エラー。`YYYY-MM-DD hh:mm:ss` 厳守
- **大量行（数万行）処理**：エラーが多数の場合、深刻度（致命的／警告／推奨）でソートし、致命的エラーを先頭に表示
- **display=0 と削除の混同**：display=0 は非表示であって削除ではない。削除は別CSV／管理画面で実施

## 注意事項

- Yahoo!ショッピングのCSV仕様（列追加・廃止・上限変更）はストアクリエイターPro側で更新されることがある。**取込前に必ず最新の公式ヘルプを確認**する
- CSVを一括反映する前に必ず**現状のフルダウンロードでバックアップ**を取得する
- 列が増減した場合、ヘッダー1行目とデータ行のカラム数を必ず一致させる
- 在庫CSVの加減算・上書きはストア設定に依存。設定を取り違えると在庫破壊リスクあり
- アップロード後は管理画面でステータスを確認し、エラー商品の修正を即時実行する

## references/ 一覧

- `references/csv-columns.md` — 商品／在庫／オプションCSV列定義の完全リスト
- `references/encoding-checks.md` — 文字コード・改行・BOMチェック方法
- `references/common-errors.md` — よくあるエラーと修正方法
- `references/examples.md` — 修正例（Before/After）

## 参考公式情報源

- Yahoo!ショッピング ストアクリエイターProヘルプ「商品データ項目定義」
- Yahoo!ショッピング ストアクリエイターProヘルプ「CSV一括登録／更新」
- Yahoo!ショッピング ストアクリエイターProヘルプ「在庫データ／オプションデータ」
