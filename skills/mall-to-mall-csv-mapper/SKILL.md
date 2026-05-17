---
name: mall-to-mall-csv-mapper
description: 楽天RMS（normal-item.csv）／Amazonフラットファイル／Yahoo!ショッピング商品CSV／Shopify products.csv の主要列を相互に対応付け、商品名・キャッチコピー・説明文・価格・在庫・画像・バリエーション・カテゴリ・配送の項目マッピング表と変換ルールを作るスキル。「楽天からYahoo!にCSV移行」「AmazonからShopifyに商品データを移したい」「楽天とShopifyの列対応」「Shopify→Amazonへ移行」「モール間の項目マッピング」「商品名の文字数を75字に切り詰め」「楽天HTMLからAmazonプレーンへ」「バリエーション構造の変換」「Yahoo!の禁止タグ除去」「ネクストエンジン経由の連携設計」など、モール間のCSV移行・並行運用設計で使う。文字コード（楽天SJIS／Amazon UTF-8タブ／Yahoo!SJIS／Shopify UTF-8）・HTML対応差・byte/文字数制限差・バリエーション構造（楽天項目選択肢／Amazon親子ASIN／Shopify Product+Variant／Yahoo!option）の変換に対応。※文字コード単体の検証は別スキル `csv-encoding-sjis-validator`、JANのチェックデジット検証は `jan-code-checker`、ネクストエンジン商品マスタの整形は `next-engine-product-master-cleaner`、Amazonフラットファイルの属性エラーは `amazon-flat-file-validator-jp`。
verified_at: 2026-05
---

# モール間CSVマッピング作成

## 概要

楽天RMS／Amazonフラットファイル／Yahoo!ショッピング商品CSV／Shopify products.csv の主要列を10カテゴリ（商品識別子・商品名／短文・説明文・価格・在庫・画像・カテゴリ・バリエーション・配送・公開設定）で相互対応付け、移行元から移行先への変換ルール（文字コード／改行／区切り／HTML対応／文字数制限／バリエーション構造）を整理して、サンプル1行の変換例まで提示する。

ネクストエンジン経由のハブ運用や、複数モール並行運用のPIM設計の前段にも使う。

## ★最重要原則

**「項目を1対1で機械的にコピーしない」が最大のルール。** モール間で同じに見える項目でも、文字コード（楽天SJIS／Amazon UTF-8）・byte/文字数制限・HTML対応・バリエーション構造が違うため、**変換ルールを伴わない単純コピーは必ず事故る**。マッピング表は「1対1」「1対多」「多対1」「変換必要」「未対応（手作業）」の5分類で作り、特に **(a) 文字コード変換、(b) 文字数切り詰め、(c) HTML除去／禁止タグ削除、(d) バリエーション構造の組み替え** の4ステップを明示する。

## 知識ベース

詳細は references/ を参照：

- 全モールの主要列対応表（10カテゴリ：識別子・商品名・説明文・価格・在庫・画像・カテゴリ・バリエーション・配送・公開設定）：`references/column-mapping-table.md`
- 実務で頻出する変換ルール集（文字コード変換／文字数調整／HTML除去／税抜税込／バリエーション組替）：`references/conversion-rules.md`
- 文字数・byte制限の比較（モール×項目マトリクス）：`references/length-limits-comparison.md`
- HTML対応と禁止タグ早見表：`references/html-support-differences.md`
- 画像・バリエーション構造の比較：`references/image-variation-structure.md`
- 実例集（楽天→Yahoo!／Shopify→Amazon／楽天→Shopify）：`references/examples.md`

要点（本ファイルに残す）：

### 文字コード・改行・区切り

| モール | 文字コード | 改行 | 区切り |
|---|---|---|---|
| 楽天RMS | Shift_JIS（CP932） | CRLF | カンマ |
| Amazon | UTF-8 | LF | **タブ（TSV）** |
| Yahoo!ショッピング | Shift_JIS（CP932） | CRLF | カンマ |
| Shopify | UTF-8 | LF | カンマ |

→ 楽天⇔Shopify、楽天⇔Amazon、Yahoo!⇔Shopify、Yahoo!⇔Amazonは **文字コード変換が必須**。Amazonはタブ区切り（区切り変換も必要）。

### 主要項目の最短文字数（移行先で最も厳しい制限）

| 項目 | 最厳格 | 制限 |
|---|---|---|
| 商品名 | Yahoo! | 全角75字 |
| キャッチコピー／短文 | Yahoo! headline | 全角60字 |
| 説明文 | Amazon | 2,000字／HTML不可 |
| 検索キーワード | Amazon | 249byte |
| 商品コード（半角英数） | ネクストエンジン参考 | 30字 |

→ 「**全モール展開を前提にする商品は最厳格モールに合わせる**」のが設計の鉄則。

### HTML対応の早見

| モール | HTML | 主な禁止タグ |
|---|---|---|
| 楽天PC説明 | 可 | （外部リンク・他店誘導が規約違反） |
| 楽天SP説明 | 可（厳しめ） | div, script, iframe, form, input, style |
| Amazon product_description | **不可** | プレーンテキストのみ |
| Yahoo! caption | 可 | script, iframe, form, input, style |
| Shopify Body (HTML) | 自由 | （script はサニタイズされる） |

### バリエーション構造の対応

| モール | 構造 | バリエーション上限 |
|---|---|---|
| 楽天 | 商品管理番号＋項目選択肢（横軸×縦軸） | 横40×縦40＝1,600（実用は色×サイズ） |
| Amazon | parent_sku ＋ child item_sku（variation_theme） | 実質無制限（カテゴリ別制限あり） |
| Yahoo! | code＋option1×option2 | option仕様 |
| Shopify | Product ＋ Variant | **1Productで100Variant**（最厳格） |

→ Shopifyの100上限が最も厳しい。色×サイズが100超なら複数Product分割が必要。

## 処理フロー

### Step 1：移行元・移行先の確定

ユーザーから受け取る：

- 移行元モール（楽天／Amazon／Yahoo!／Shopify／ネクストエンジン）
- 移行先モール
- 商品カテゴリ（カテゴリ別の必須属性に影響）
- バリエーション有無
- HTML説明文の有無
- 画像URLの取り扱い（移行先で再アップロードか流用か）

不足情報は「仮定」「不足情報」「確認したいこと」に分け、急ぎなら主要カテゴリ仮定で暫定マッピングを出す。

### Step 2：項目を5分類でマッピング

1. **1対1自動変換**：商品コード／JAN／価格／在庫数／重量
2. **1対1だが変換必要**：文字コード変換、文字数切り詰め、HTML除去
3. **1対多**：楽天キャッチコピー → Amazon bullet_point1〜5に分割
4. **多対1**：Amazon親子ASIN（複数行）→ 楽天1商品管理番号＋項目選択肢
5. **未対応（手作業）**：カテゴリID／ジャンルID／検索キーワード／配送設定／画像再アップロード

### Step 3：文字コード・改行・区切りの変換

- 楽天 ⇔ Yahoo!：両者SJIS+CRLF、**変換不要**（ただしモール固有禁止タグは別途処理）
- 楽天 ⇔ Shopify：SJIS+CRLF ⇔ UTF-8+LF、機種依存文字置換も必要
- Amazon ⇔ Shopify：両者UTF-8、ただしタブ⇔カンマ変換が必要
- Amazon ⇔ 楽天/Yahoo!：UTF-8 ⇔ SJIS変換＋タブ⇔カンマ変換

### Step 4：文字数・HTMLの調整

- 移行先の最厳格項目に合わせて切り詰め
- 切り詰め順序：装飾文 → 重複仕様 → 副次バリエーション → 絵文字 → 副次機能
- **絶対残す**：ブランド／メーカー名（先頭）、商品の本質、サイズ・容量、法的必須表記
- HTML：移行先が不可ならタグ全除去＋プレーンに整形、禁止タグのみなら該当タグだけ削除

### Step 5：バリエーション構造の組み替え

- 楽天項目選択肢 → Amazon親子ASIN：親1行＋子N行のフラットファイル
- Amazon親子ASIN → 楽天：項目選択肢の横軸／縦軸／別在庫／別画像に再構築
- Shopify Variant → 楽天項目選択肢：Option1/Option2を横軸/縦軸に
- Shopify上限100Variant超なら複数Product分割

### Step 6：画像の扱い

- 楽天：楽天キャビネットにアップロード必須（外部URL不可）
- Amazon：外部URLをAmazonが取り込み
- Yahoo!：ストアエディタにアップロード
- Shopify：ShopifyのCDN（Filesアップロード）

→ モール間で**画像URLはそのまま流用できない**。再アップロード前提で設計。

### Step 7：サンプル1行変換＋検証チェックリスト

1行を実際に変換して提示し、本番移行前のチェックリストを出す。

## 実例

### 例1：楽天 → Yahoo!（同じSJIS+CRLF）

楽天「商品名」255byte → Yahoo! name 全角75字に切り詰め。両者SJISなので文字コード変換は不要だが、楽天の `<div>` を含むHTMLはYahoo! caption ではNGなので除去または `<p>` に置換。バリエーションは楽天の項目選択肢→Yahoo!のoption1/option2に組み替え。

その他の実例（楽天→Shopify、Shopify→Amazon、Amazon→楽天）は `references/examples.md` 参照。

## 出力フォーマット（必須）

````markdown
# モール間CSVマッピング設計

## 0. 移行設定
- 移行元：<楽天／Amazon／Yahoo!／Shopify／ネクストエンジン>
- 移行先：<同上>
- 商品カテゴリ：
- バリエーション有無：あり/なし
- 文字コード変換要否：要/不要
- 区切り変換要否：要/不要

## 1. 項目マッピング表
| 概念 | 移行元列 | 移行先列 | 分類 | 変換ルール |
|---|---|---|---|---|
| 商品コード |  |  | 1対1 |  |
| JAN |  |  | 1対1 |  |
| 商品名 |  |  | 1対1+切詰 | XX字に切り詰め |
| キャッチコピー |  |  | 1対多 | bullet1〜5に分割 |
| 説明文 |  |  | 変換必要 | HTML除去＋XX字 |
| 価格 |  |  | 1対1 |  |
| 在庫 |  |  | 1対1 |  |
| 画像メイン |  |  | 未対応 | 移行先で再アップロード |
| カテゴリ |  |  | 未対応 | 手作業マッピング |
| バリエーション |  |  | 多対1 or 1対多 | 構造組替 |
| 配送 |  |  | 未対応 |  |

## 2. 文字コード・形式の変換
| 項目 | 移行元 | 移行先 | 変換 |
|---|---|---|---|
| 文字コード |  |  | SJIS↔UTF-8 / 不要 |
| 改行 |  |  | CRLF↔LF / 不要 |
| 区切り |  |  | カンマ↔タブ / 不要 |
| BOM |  |  |  |

## 3. 文字数・HTML調整
| 項目 | 上限 | 切詰ルール |
|---|---|---|
| 商品名 |  | 末尾装飾→重複仕様→副次バリエーションの順で削る |
| 説明文 |  | HTML有無、移行先禁止タグ |

## 4. 未対応項目（手作業）
| 項目 | 理由 | 対応方針 |
|---|---|---|
| カテゴリID | モール固有 | 手作業マッピング表を別途作成 |
| 画像URL | 流用不可 | 移行先で再アップロード |
| 検索キーワード | モール固有 | 移行先用に再設計 |

## 5. サンプル1行変換
- 入力（移行元1行）：
- 出力（移行先1行）：
- 注意点：

## 6. 検証チェックリスト
- [ ] 移行元と移行先の文字コード・改行・区切りが一致
- [ ] 商品名が移行先の上限内
- [ ] 説明文がHTML対応／禁止タグに準拠
- [ ] 画像URLの再アップロード手順を確定
- [ ] バリエーション数が移行先上限内（Shopifyなら100以内）
- [ ] カテゴリ／ジャンルIDを手作業マッピング済
- [ ] JANはチェックデジット検証済（`jan-code-checker` 推奨）
- [ ] CSVバックアップ取得済
- [ ] テスト商品1件で本番移行前に動作確認
````

## 品質ゲート

- [ ] 移行元・移行先の文字コード／改行／区切り／BOM要件を最初に明示している
- [ ] 項目を5分類（1対1／変換必要／1対多／多対1／未対応）で整理している
- [ ] 文字数切り詰めは移行先の最厳格項目（多くはYahoo!商品名75字／Amazon説明2000字）に合わせている
- [ ] HTML対応の差（Amazon不可、楽天SP・Yahoo!の禁止タグ）を変換ルールに反映している
- [ ] バリエーション構造の組替（楽天項目選択肢／Amazon親子／Shopify Variant／Yahoo! option）を明示している
- [ ] Shopifyの100Variant上限への抵触を確認している
- [ ] 画像URLはモール間で流用不可と明示している
- [ ] サンプル1行変換を実際に示している

## エッジケース

- **絵文字・機種依存文字**：SJIS範囲外の文字は楽天／Yahoo!で「?」「・」に化ける。事前検出は別スキル `csv-encoding-sjis-validator` を併用
- **半角カナ**：SJISで1byte、UTF-8で3byteと挙動が違い、byte換算がモール間でズレる
- **税抜・税込**：楽天／Amazon／Yahoo!は税込入力が標準、Shopifyは税抜が初期値（設定で税込扱いに変更可）
- **JANの先頭0落ち**：Excel経由で `0049...` が `49...` になる事故。テキスト型インポートで防ぐ
- **バリエーション100超**：Shopifyでは1Product 100Variantが上限なので、色×サイズが100超なら親商品を分割
- **画像のテキスト占有率**：楽天は20%以内、Amazonは商品占有率85%以上の純白背景。モール毎にやり直しが多い
- **モール固有項目の喪失**：楽天のスーパーDEAL設定／Yahoo!の優良配送／Shopifyのmetafields は移行先に無く、情報が消える

## 注意事項

- カテゴリID／ジャンルID（楽天ジャンルID／Amazon item_type／Yahoo! path／Shopify Type）はモール固有で**自動変換不可**。手作業マッピングが必須
- モール仕様（列名・byte制限・禁止タグ）は更新される。最新は各モールの公式ヘルプを確認
- 本番移行前に必ずテスト商品1件で動作確認
- 顧客固有のSKU命名規則を出力に含めない（汎用例で記載）
- 画像・商品名・説明文の薬機法／景表法表現は移行時に再検査（別スキル `yakki-keihyo-expression-check`）

## references/ 一覧

- `references/column-mapping-table.md` — 全モール主要列対応表（10カテゴリ完全版）
- `references/conversion-rules.md` — 文字コード／文字数／HTML／税／バリエーションの変換ルール集
- `references/length-limits-comparison.md` — 文字数・byte制限のモール×項目マトリクス
- `references/html-support-differences.md` — HTML対応と禁止タグ早見表
- `references/image-variation-structure.md` — 画像・バリエーション構造の比較
- `references/examples.md` — 楽天→Yahoo!／Shopify→Amazon／楽天→Shopifyの実変換例

## 参考公式情報源

- 楽天RMS「商品データ一括登録」「normal-item.csv 仕様」
- Amazon Seller Central「フラットファイル仕様」「インベントリファイル」
- Yahoo!ショッピング「商品データ仕様」
- Shopify「商品CSVファイルのフォーマット」
- ネクストエンジン公式ヘルプ「商品マスタ仕様」「モール連携設定」
