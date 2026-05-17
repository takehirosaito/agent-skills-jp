# GMC 頻出エラーコード集と修正方針

GMCで表示される代表的なエラー・警告と対応方法。エラーコード名称はGMC UI／APIにより微妙に異なる場合がある。

## エラーの重大度

| レベル | 表示 | 影響 |
|---|---|---|
| 重大 / エラー | Disapproved | 不承認、広告・無料リスティング停止 |
| 警告 | Warning | 表示はされるが品質低下、要修正 |
| 通知 | Notice | 改善推奨、表示は影響なし |

## A. 必須属性関連

### A1. `Missing required attribute: title`
- 原因：title未入力
- 対応：商品名を入力（150字以内）

### A2. `Missing required attribute: description`
- 原因：description未入力
- 対応：商品説明を5,000字以内で入力

### A3. `Missing required attribute: image_link`
- 原因：image_link未入力
- 対応：メイン画像URLを入力（HTTPS）

### A4. `Missing required attribute: brand`
- 原因：brand未入力
- 対応：ブランド名を入力（70字以内）

### A5. `Missing identifier: GTIN, MPN, or identifier_exists`
- 原因：GTINもMPNもなく、identifier_existsも未設定
- 対応：
  - GTINがあれば入力
  - 自社オリジナル商品なら `identifier_exists: false`（brand必須）
  - メーカー型番があれば mpn を入力

## B. 値の形式違反

### B1. `Invalid GTIN`
- 原因：GTINが無効（チェックデジット不一致、桁数違反、文字種違反）
- 対応：
  - 8/12/13/14桁の有効なGTINに修正
  - チェックデジット計算（`jan-code-checker` スキル）
  - 桁数間違いはGTIN-13に統一推奨

### B2. `Invalid value for attribute: price`
- 原因：通貨単位なし、税抜価格、文字混入
- 対応：
  - 形式：`数値 通貨コード`（`1980 JPY`）
  - 税込価格を入力
  - カンマ・通貨記号・全角文字を除去

### B3. `Invalid URL: link / image_link`
- 原因：URL形式違反、HTTP（HTTPS必須）、リダイレクトループ
- 対応：
  - HTTPSに変換
  - リダイレクトを最小化
  - URLパラメータの正規化

### B4. `Invalid value for attribute: availability`
- 原因：in_stock/out_of_stock/preorder/backorder 以外の値
- 対応：4つのうちのいずれかに統一

### B5. `Invalid value for attribute: condition`
- 原因：new/refurbished/used 以外
- 対応：3つのうちのいずれかに

### B6. `Invalid google_product_category`
- 原因：存在しないカテゴリID、または英語カテゴリパス間違い
- 対応：
  - Googleの最新カテゴリ分類を確認
  - 数値IDまたは英語パスで指定
  - 階層は ` > ` で区切り

## C. 画像エラー

### C1. `Image link crawl error`
- 原因：
  - URLが404
  - robots.txt で Googlebot 不許可
  - HTTPでアクセス不可（HTTPS必須）
  - サーバーエラー（5xx）
  - クロール時のタイムアウト
- 対応：
  - URLをブラウザ＋シークレットモードで開いて確認
  - robots.txt で /images/ や該当パスを許可
  - HTTPSに変換
  - サーバー負荷確認

### C2. `Image too small`
- 原因：画像サイズが100×100未満（衣類は250×250未満）
- 対応：800×800以上にリサイズ

### C3. `Image too large`
- 原因：64MP（メガピクセル）超
- 対応：解像度を下げる（通常 2048×2048 程度で十分）

### C4. `Promotional overlay on image`
- 原因：画像にテキスト・ロゴ・透かし・枠
- 対応：オーバーレイ除去、商品本体のみの画像に

### C5. `Invalid image format`
- 原因：対応外フォーマット
- 対応：JPEG/PNG/GIF/WebP/BMP/TIFFに変換

## D. ランディングページ不一致

### D1. `Price mismatch`
- 原因：フィード価格と商品ページ価格が不一致
- 対応：
  - 税込／税抜の統一（日本は税込が標準）
  - セール価格の反映
  - 商品ページとフィードの価格表記を統一

### D2. `Availability mismatch`
- 原因：フィードin_stock、ページ「在庫切れ」表示
- 対応：在庫情報をリアルタイム連動

### D3. `Shipping cost mismatch`
- 原因：フィードのshipping情報とページの送料表記が違う
- 対応：両者の送料計算ロジックを統一

### D4. `Item not found / page does not exist`
- 原因：商品ページが404、または認証必要
- 対応：URLを修正、認証要求を解除

## E. タイトル・説明の問題

### E1. `Promotional text in title`
- 原因：タイトルに「送料無料」「セール中」「半額」「期間限定」等のプロモテキスト
- 対応：プロモテキストを削除し、商品の特徴のみで構成

### E2. `Title contains capital letters / excessive symbols`
- 原因：全大文字、絵文字、装飾記号の過剰使用
- 対応：自然な大文字小文字、絵文字最小化

### E3. `Title too long / description too long`
- 原因：title 150字超、description 5,000字超
- 対応：制限内に短縮

### E4. `Misleading title / description`
- 原因：商品ページと内容が大きく異なる、誇大表現
- 対応：商品ページの内容に合わせて修正

## F. ポリシー違反

### F1. `Restricted product / prohibited product`
- 原因：禁止商品（武器、タバコ、医薬品の一部、成人向け、模倣品等）
- 対応：除外、または別商品に変更

### F2. `Misleading claims`
- 原因：「No.1」「最安」「治る」「絶対」等の根拠なし表現
- 対応：表現を客観的・控えめに修正

### F3. `Healthcare and medicines policy violation`
- 原因：医薬品・健康食品の誇大効果効能の主張
- 対応：薬機法・景表法に基づく表現に修正（`yakki-keihyo-expression-check` スキル）

### F4. `Counterfeit goods`
- 原因：模倣品・偽ブランド
- 対応：本物のみ出品、ブランド許可確認

## G. カテゴリ別必須属性

### G1. `Missing required attribute for Apparel: size`
- 原因：衣料品カテゴリで size 未入力
- 対応：size, color, age_group, gender を入力

### G2. `Missing required attribute for Food: gtin`
- 原因：食品カテゴリでGTIN未入力（または無効）
- 対応：GTIN取得・入力

### G3. `Missing required attribute: gender`
- 原因：衣料品 / アクセサリーカテゴリで gender 未入力
- 対応：male / female / unisex のいずれかに

## H. その他

### H1. `Duplicate id`
- 原因：同一IDの商品が複数行
- 対応：IDを一意化

### H2. `Item group id without variant`
- 原因：item_group_id が指定されているがバリエーション属性（color/size等）なし
- 対応：バリエーション属性を入力、または item_group_id を削除

### H3. `Wrong currency`
- 原因：通貨コードが対象国と不一致（日本フィードにUSD等）
- 対応：JPYに統一

### H4. `Inactive ASIN / inactive product`
- 原因：商品ページが非公開／削除済
- 対応：商品ページを再公開、または該当商品をフィードから除外

## エラー対応の優先順位

1. **重大エラー（不承認）**：即対応、フィード再アップロードで解除
2. **画像クロール失敗**：サーバー側修正必要、対応に時間がかかる
3. **ランディングページ不一致**：フィード＋商品ページの両方修正
4. **必須属性欠落**：データ補完
5. **警告**：時間を見て修正
6. **通知**：改善余地、後で対応

## 再アップロード後の確認

- フィード再アップロード後、即時～数時間でエラー再評価
- エラー解除には24-72時間かかる場合あり
- ポリシー違反は手動審査の場合あり（最大1週間）

## 検出の自動化

```python
def validate_feed_item(item: dict) -> list[str]:
    errors = []
    required = ["id", "title", "description", "link", "image_link",
                "availability", "price", "brand", "condition"]
    for r in required:
        if not item.get(r):
            errors.append(f"Missing required: {r}")
    # GTIN check
    gtin = item.get("gtin")
    if gtin and not is_valid_gtin(gtin):
        errors.append("Invalid GTIN")
    # Price format
    price = item.get("price", "")
    if not re.match(r"^\d+(\.\d+)?\s+[A-Z]{3}$", price):
        errors.append("Invalid price format")
    # HTTPS check
    for url_attr in ["link", "image_link"]:
        url = item.get(url_attr)
        if url and not url.startswith("https://"):
            errors.append(f"{url_attr} must be HTTPS")
    return errors
```
