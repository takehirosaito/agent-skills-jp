---
name: amazon-flat-file-validator-jp
description: Amazon.co.jpのフラットファイル（商品登録CSV／TSV）を検証するスキル。「Amazon出品ファイル検証」「フラットファイルのエラー」「商品登録CSVチェック」「item_type違反」「文字化け修正」「JANのエラー」「親子バリエーションが反映されない」「アップロード後にエラーが出た」「フラットファイル不備」など、Amazon.co.jpのフラットファイル作成・検証・エラー解析のリクエストで必ずこのスキルを使う。必須列／データ型／バイト数／ENUM／JANチェックデジット／親子バリエーション／文字コード／改行コードを検証し、エラー番号・原因・対処を出力。アップロード前の事前検証フロー、テスト登録、全件登録、登録後検証の4フェーズに対応。※JAN単体のチェックデジット検証は `jan-code-checker`、親子バリエーション設計の監査は `amazon-variation-parent-child-audit`、出品停止・非表示の復旧は `amazon-suppressed-listing-recovery`。
verified_at: 2026-05
---

# Amazon.co.jp フラットファイル検証

## 概要

Amazon.co.jpのフラットファイル（カテゴリ別の商品登録テンプレート、CSV／TSV形式）をアップロードする前後に検証するスキル。必須列・データ型・バイト数・ENUM・JANチェックデジット・親子バリエーション・文字コードを横断チェックする。

アップロード後にエラーが出る原因の多くは「事前検証不足」。本スキルは「事前検証 → テスト登録 → 全件登録 → 登録後検証」の4フェーズフローで、事故・売上ロス・カタログ汚染を防ぐ。

## ★最重要原則：「テスト1〜2行で先行アップロード、エラー検出後に全件展開」

全件を一発でアップロードすると、些細なENUM違反や文字コード問題で大量エラーになる。**代表1〜2SKUのテストファイルを先行アップロードして、エラーパターンを確認してから全件展開する**。これにより事故率を大幅に下げられる。

カテゴリのテンプレートバージョンは年単位で変動する。アップロード前に**必ず最新テンプレートを取得し、既存テンプレートとの差分を確認**する。

## 知識ベース

| トピック | 場所 |
|---|---|
| 主要列の仕様（item_sku／external_product_id／item_name 等） | `references/columns-spec.md` |
| よくあるエラーパターン（エラー番号・原因・対処） | `references/error-patterns.md` |
| item_type のカテゴリ別ENUM値の取り方 | `references/item-type-values.md` |
| 4フェーズ検証ワークフロー（事前・テスト・全件・登録後） | `references/validation-workflow.md` |
| 親子バリエーションの整合チェック | `references/variation-relationship.md` |

詳細は references/ を参照。

### 主要列の早見（要点）

| 列 | 必須 | 仕様 |
|---|---|---|
| item_sku | ◎ | 半角英数記号、40字程度、ユニーク |
| external_product_id | ◎ | JAN／EAN／UPC／ISBN、CD検証必須 |
| external_product_id_type | ◎ | EAN／UPC／JAN／ISBN |
| brand_name | ◎ | 50字程度、Brand Registry名と一致 |
| item_type | ◎ | カテゴリ別ENUM、ブラウズツリーガイドで確認 |
| recommended_browse_nodes | ◎ | ブラウズノードID（数値） |
| item_name | ◎ | カテゴリ別バイト数（一般200／アパレル130／カメラ50字） |
| bullet_point1〜5 | 推奨 | 各255バイト |
| generic_keywords | 推奨 | 249バイト（超過は無視） |
| main_image_url | 推奨 | HTTPS必須・純白RGB(255,255,255)・85%占有・1000px以上 |
| standard_price | ◎（出品時）| 親行は空欄 |
| quantity | ◎（出品時）| 親行は空欄 |
| parent_child / parent_sku / relationship_type / variation_theme | バリエ時◎ | 親子整合必須 |

## 処理フロー

### フェーズ1：事前検証（オフライン）

#### Step 1：テンプレートの最新化
- セラーセントラル「在庫＞商品登録＞カテゴリ／テンプレートのダウンロード」
- 対象カテゴリのテンプレートをダウンロード
- 既存テンプレートと差分確認（列名・必須／推奨・ENUM）
- バージョン取得日を記録

#### Step 2：商品情報の社内集約
- 商品マスター（PIM）から該当商品を抽出
- 必須列：SKU・JAN・商品名・ブランド・カテゴリ・価格・在庫
- 推奨列：bullet・キーワード・画像URL
- 親子バリエーション設計（あれば）

#### Step 3：一次検証
- 必須列の存在
- データ型・桁数・バイト数
- JAN／GTINチェックデジット
- 親子バリエーション整合
- `item_type` ENUM違反
- 文字コード（UTF-8 BOMなし or Shift_JIS統一）
- 改行コード（CR+LF）

#### Step 4：関連スキル連携

| 検証観点 | 関連スキル |
|---|---|
| JAN／GTIN | `jan-code-checker` |
| メイン画像 | `amazon-main-image-checker` |
| タイトル | `amazon-title-bullet-rewriter-jp` |
| bullet | `amazon-bullet-attribute-benefit` |
| キーワード | `amazon-search-term-builder-jp` |
| バリエーション | `amazon-variation-parent-child-audit` |
| 薬機・景表 | `yakki-keihyo-expression-check` |

### フェーズ2：テスト登録

#### Step 5：テスト用1〜2行サブセット作成
- 全件の代表として1〜2SKUを抽出
- 全列の代表値を含む
- 親子ありなら親＋子1〜2行

#### Step 6：セラーセントラルへアップロード
- アップロード結果レポートを確認
- エラー番号・行番号・列名を整理（`references/error-patterns.md`）

#### Step 7：エラー解析・修正
- エラー番号別に対処（後述の早見）
- テストSKUを再アップロード、エラーゼロを確認

### フェーズ3：全件登録

#### Step 8：全件アップロード
- 50〜100行単位で分割アップロード推奨（一度の大量UPはタイムアウトのリスク）
- 各バッチでエラーレポート確認

#### Step 9：エラー対応
- 残エラーを修正して再アップロード
- 部分成功の場合、成功分は再UPしない（重複登録回避）

### フェーズ4：登録後検証

#### Step 10：商品ページ目視
- 商品ページが意図通り表示
- 画像・bullet・タイトル・価格・カテゴリ
- 検索結果での表示

#### Step 11：48時間後の二次確認
- カタログ反映には遅延がある
- 48時間後も「検索結果から非表示」状態なら `amazon-suppressed-listing-recovery` で復旧

### よくあるエラー番号 早見（要点）

| エラー番号 | 内容 | 対処 |
|---|---|---|
| 8541 | 必須列の欠落 | 該当列を埋める |
| 8013 | ENUM違反（item_type等） | Valid Valuesから取得 |
| 8052 | 文字種違反 | 半角英数のみ等を厳守 |
| 8087 | バイト数超過（item_name等） | カテゴリ別上限まで短縮 |
| 8112 | external_product_id不一致 | CD検証・GTIN種別確認 |
| - | parent_sku不存在 | 同一ファイル内に親行を追加 |
| - | variation_theme親子不一致 | 親と全子を揃える |
| - | 画像HTTPSでない | HTTPSのURLに変更 |

詳細は `references/error-patterns.md`。

## 代表例（化粧品・3SKU親子バリエーション）

入力：
- カテゴリ：ビューティ／スキンケア
- 親1：保湿クリーム（容量バリエーション3種）
- 子3：30g／50g／100g

検証ポイント：
- 親：parent_child=parent、価格・在庫・JAN空欄、variation_theme=Size
- 各子：parent_sku=親SKU、relationship_type=variation、variation_theme=Size、size_name埋まる
- 各子に別JAN、CD検証OK
- item_type：`body-cream` 等のENUM値（ブラウズツリーガイド確認）
- recommended_browse_nodes：ブラウズノードID
- 全成分表示の `ingredients` 列が埋まる（化粧品必須）

## 出力フォーマット

````markdown
# フラットファイル検証レポート

## 0. 対象ファイル概要
- カテゴリ：[ ]
- テンプレートバージョン取得日：YYYY-MM-DD
- 行数：[N行]（親[N]＋子[M]）
- 文字コード：[UTF-8 BOMなし／Shift_JIS]
- 改行コード：[CR+LF]

## 1. 必須列の充足チェック
| 列名 | 充足 | 備考 |
|---|---|---|
| item_sku | ✓ | ユニーク |
| external_product_id | ✓ | JAN CD検証済 |
| external_product_id_type | ✓ | EAN |
| brand_name | ✓ | Brand Registry一致 |
| item_type | ✓ | ENUM準拠 |
| recommended_browse_nodes | ✓ | [NodeID] |
| item_name | ✓ | XX バイト |
| standard_price | ✓ | [親は空欄] |
| quantity | ✓ | [親は空欄] |

## 2. エラー検出

### 致命的エラー（要修正）
| 行 | 列 | エラー番号 | 内容 | 対処 |
|---|---|---|---|---|
| 3 | item_type | 8013 | ENUM違反 | `body-cream` に修正 |

### 警告（推奨対応）
| 行 | 列 | 内容 | 対処 |
|---|---|---|---|
| 5 | item_name | 全角210字 | 全角200字以内に短縮 |

## 3. 親子バリエーション整合
- parent_child：親[parent]・子[child]
- parent_sku：全子で親と一致 ✓
- relationship_type：全子=variation ✓
- variation_theme：親子一致 ✓
- バリエーション属性（size_name）：全子充足 ✓
- 子別JAN：ユニーク・CD検証済 ✓

## 4. 関連スキル連携
| 観点 | 状態 | 関連スキル |
|---|---|---|
| JAN | 検証済 | `jan-code-checker` |
| メイン画像 | 要確認 | `amazon-main-image-checker` |
| タイトル | OK | `amazon-title-bullet-rewriter-jp` |
| bullet | OK | `amazon-bullet-attribute-benefit` |
| キーワード | OK | `amazon-search-term-builder-jp` |
| 薬機・景表 | 要確認 | `yakki-keihyo-expression-check` |

## 5. 推奨アップロード手順
1. テスト用1〜2行サブセットを先行UP
2. エラーゼロ確認後、50〜100行単位で分割UP
3. 48時間後に商品ページ目視
4. 「検索結果から非表示」状態があれば `amazon-suppressed-listing-recovery` 参照

## 6. 次アクション
- [ ] テンプレート差分の最終確認
- [ ] テスト用ファイル作成・アップロード
- [ ] エラー修正・全件UP
- [ ] 登録後の目視確認
````

## 品質ゲート

- 必須列（item_sku／external_product_id／external_product_id_type／brand_name／item_type／recommended_browse_nodes／item_name／standard_price／quantity）がすべて充足
- 全 external_product_id がCD検証OK
- item_type が公式ENUM値で自由入力なし
- バイト数違反（item_name／bullet／generic_keywords）なし
- 親子バリエーションの整合（parent_sku／variation_theme／relationship_type／バリエ属性）が取れている
- 文字コード・改行コードが統一
- メイン画像URLがHTTPS、画像規定（後述の関連スキル）にも準拠

## エッジケース

- **Excel開いてJANが「4.90E+12」化**：テキストエディタで開く／セル型を文字列指定
- **先頭0落ち（型番が "0001"）**：列型を文字列に
- **食品の expiration_date 形式違反**：「YYYY-MM-DD」形式厳守
- **食品 food_allergen_information 欠落**：特定原材料8品目（えび・かに・くるみ・小麦・そば・卵・乳・落花生）の必須対応
- **化粧品 ingredients の列順序違反**：全成分表示の記述形式・順序を厳守
- **制限カテゴリ（医薬品・酒類等）の出品申請未承認**：カテゴリ出品申請を先行
- **タイムアウトで500行一括UPが失敗**：50〜100行単位で分割

## 注意事項

- カテゴリ別のテンプレート・必須列・ENUM・上限バイト数は年単位で更新される。最新は Amazon セラーセントラル「商品登録テンプレート」を確認
- アップロード処理結果には遅延がある（即時〜数時間）。すぐ反映されなくても再UPしない
- バリエーション関係を後から組み替えると、レビューや売上履歴がリセットされる場合あり。新規時に正しく設計
- 制限カテゴリ（医薬品・酒類・コンタクトレンズ等）はカテゴリ出品申請が前提

## references/ 一覧

- `references/columns-spec.md`：主要列の仕様
- `references/error-patterns.md`：エラー番号・原因・対処
- `references/item-type-values.md`：item_type のカテゴリ別ENUM値
- `references/validation-workflow.md`：4フェーズ検証ワークフロー
- `references/variation-relationship.md`：親子バリエーション整合チェック

## 参考公式情報源

- Amazon セラーセントラル「商品登録テンプレート」
- Amazon セラーセントラル「ブラウズツリーガイド」
- Amazon スタイルガイド（カテゴリ別）
