# Yahoo!ショッピング CSV 列定義（完全リスト）

ストアクリエイターProの「商品データ項目定義」を要点整理したもの。
**最新仕様は必ずストアクリエイターPro公式ヘルプで確認すること**（列追加・廃止・上限変更があり得る）。

---

## 1. 商品データCSV（product-data）

ヘッダーは半角英小文字、改行は CR+LF、文字コードは Shift_JIS（CP932）。

### 必須列

| 列名 | 制限 | 説明 |
|---|---|---|
| code | 半角英数記号、ストア内ユニーク | 商品コード（管理用） |
| name | 全角75文字（150byte） | 商品名（検索・一覧表示） |
| price | 半角整数 | 販売価格（税込／税抜はストア設定に依存） |
| path | ストアカテゴリ階層 | 自店内ストアカテゴリ |
| display | 1 or 0 | 表示／非表示 |

### 主要任意列

| 列名 | 制限 | 説明 |
|---|---|---|
| sale-price | 半角整数 | セール価格 |
| sale-period-start / sale-period-end | YYYY-MM-DD hh:mm:ss | セール期間 |
| headline | 全角60文字 | 見出し（商品名の下に表示） |
| caption | 全角5,000文字 | 商品説明（メイン本文・HTML可） |
| abstract | 全角160文字 | 一覧用説明 |
| explanation | 全角3,000文字 | 商品詳細説明 |
| additional1〜additional3 | 全角1,000文字×3 | 追加説明欄 |
| quantity | 半角整数 | 在庫数 |
| product-category | 数字 | Yahoo!プロダクトカテゴリID |
| product-code | JAN/ISBN | 商品マッチング用 |
| brand-code | 数字 | Yahoo!ブランドコード |
| taxable | 0 / 1 | 税区分（0=標準、1=軽減対象） |
| release-date | YYYY-MM-DD | 発売日 |
| meta-description | 80文字 | SEOメタ説明 |
| meta-key | 全角40文字 | SEOメタキーワード |
| template | テンプレート名 | 商品ページテンプレート |
| sub-code | サブコード | バリエーション管理 |
| weight | 数値 | 重量（送料計算） |
| postage-set | 設定名 | 送料設定 |
| condition | new / used | 商品状態 |
| relevant-links | URL | 関連リンク |
| shopping-search-keywords | 半角空白区切り | 検索キーワード |
| spec1〜specN | 仕様 | スペック項目 |

### 画像関連

| 列名 | 説明 |
|---|---|
| ystore-image1〜ystore-image20 | 商品画像URL（または画像名） |
| image-comment1〜image-comment20 | 画像コメント |

### display／delete

- `display`：1=表示、0=非表示。**削除ではない**。
- 削除は別途「商品削除データ」CSV、または管理画面で実行。

---

## 2. 在庫データCSV（quantity-data）

商品データとは別ファイル。在庫数だけを一括更新する場合に使用。

| 列名 | 制限 | 説明 |
|---|---|---|
| code | 商品データの code と一致 | キー |
| quantity | 半角整数 | 在庫数（**上書き** or **加減算**はストア設定による） |
| sub-code | 任意 | バリエーション在庫 |
| allow-overdraft | 0 / 1 | 0以下を許容するか |

注意：商品データCSVに存在しない code を在庫データCSVに含めると「孤立在庫」エラー。

---

## 3. オプションデータCSV（option-data）

商品ごとのオプション項目（色・サイズ・刻印 等）を定義。

| 列名 | 制限 | 説明 |
|---|---|---|
| code | 商品データの code と一致 | 親商品コード |
| option-name | 全角50文字 | オプション項目名（例：色） |
| option-value | 全角50文字 | 選択肢（例：赤） |
| display-order | 数字 | 表示順 |
| required | 0 / 1 | 必須選択か |

注意：
- 1商品に複数行（オプション項目数 × 選択肢数）
- 商品データに存在しない code を含めると無効

---

## 4. ヘッダー列名でよくあるミス

| 誤 | 正 | 備考 |
|---|---|---|
| codes | code | 単数形 |
| prices | price | 単数形 |
| quanty / quantitiy | quantity | スペル |
| cation | caption | 「c」を欠落 |
| product_category | product-category | アンダースコアではなくハイフン |
| productCode | product-code | キャメルケース不可 |
| ｃｏｄｅ | code | 全角不可 |
| Code | code | 大文字不可 |

---

## 5. byte と文字数の関係

- Yahoo!の文字数表記は基本「全角文字数」
- 全角1文字＝2byte、半角1文字＝1byte
- `name` の上限 75文字（150byte）は **全角75文字**または**半角150文字**まで
- 全角と半角混在の場合は byte 換算で 150byte 以内

---

## 6. 推奨：プロダクトカテゴリ／product-code の設定

| 項目 | 効果 |
|---|---|
| product-category（Yahoo!プロダクトカテゴリID） | 検索精度向上、カテゴリ別ランキング露出 |
| product-code（JAN等） | カタログマッチング、検索精度、価格比較サイト連携 |
| brand-code | ブランドフィルタでの露出 |

これらは**任意項目だが、設定する方が検索流入が増える**。空欄のままにしない。
