# 実務でよく使う変換ルール集

## 文字コード・改行コード変換

### 楽天 ⇔ Shopify
- 楽天：SJIS(CP932) + CR+LF
- Shopify：UTF-8 + LF
- **必ず変換が必要**
- 機種依存文字を事前置換（SJIS外文字は `csv-encoding-sjis-validator` スキル参照）

### 楽天 ⇔ Yahoo!
- 両者 SJIS + CR+LF → **変換不要**
- ただしモール固有の禁止タグは別途処理

### Amazon ⇔ Shopify
- 両者 UTF-8 → **変換不要**
- Amazonはタブ区切り、Shopifyはカンマ区切り → 区切り変換が必要

### Amazon ⇔ 楽天/Yahoo!
- UTF-8 ⇔ SJIS の変換が必要
- AmazonはタブTSV、楽天/Yahoo!はカンマCSV

## 文字数調整

### 商品名

| 移行元 | 移行先 | ルール |
|---|---|---|
| 楽天 255byte | Yahoo! 全角75字 | 75字超過分を末尾から切り詰め。ブランド名・主要機能・サイズは残す |
| 楽天 255byte | Amazon 200字（カテゴリ別80-130） | カテゴリ別の推奨字数に合わせる |
| 楽天 255byte | Shopify | 255字内で運用、SEOタイトル別途設定（60-70字） |
| Shopify 255 | Yahoo! 75字 | 大幅短縮、要約スキルと併用推奨 |

### 説明文

| 移行元 | 移行先 | ルール |
|---|---|---|
| 楽天 PC 10,240byte HTML | Amazon product_description 2,000字 | HTML全除去 → プレーンテキスト2,000字に要約 |
| 楽天 PC 10,240byte HTML | Yahoo! caption 5,000字 HTML | 楽天SP用禁止タグ除去 → そのまま流用可 |
| 楽天 PC HTML | Shopify Body (HTML) | UTF-8化のうえ流用可、Shopifyテーマで表示確認 |

### 切り詰めの優先順位

切る順番（重要度の低い順）：
1. 末尾の余計な装飾文（「※在庫限り」等）
2. 重複する仕様情報
3. 副次的なバリエーション情報
4. ブランド名の繰り返し
5. 絵文字・記号類
6. 副次的な機能説明
7. 最後にメイン機能の細かい補足

絶対残すべき要素：
- ブランド／メーカー名（先頭）
- 商品名の本質
- サイズ・容量（誤購入防止）
- 法的に必須の表記（食品の原材料・賞味期限等）

## HTML除去ルール

### 楽天 → Amazon（HTML→プレーン）

```html
<p>軽量18gの<strong>超薄型</strong>ケース。</p>
<ul>
  <li>耐衝撃テスト合格</li>
  <li>ワイヤレス充電対応</li>
</ul>
<table>
  <tr><th>素材</th><td>TPU</td></tr>
  <tr><th>重量</th><td>18g</td></tr>
</table>
```

↓

```
軽量18gの超薄型ケース。
・耐衝撃テスト合格
・ワイヤレス充電対応
素材：TPU
重量：18g
```

または、ブレットポイント分離：
- product_description：`軽量18gの超薄型ケース。素材：TPU 重量：18g`
- bullet_point1：`耐衝撃テスト合格`
- bullet_point2：`ワイヤレス充電対応`

### 禁止タグ一括除去（Yahoo!向け）

楽天PC用HTMLからYahoo!caption用に：
- `<div>` → `<p>` 置換 または 除去
- `<script>` `<iframe>` `<form>` `<input>` `<style>` → 完全削除
- 外部CSS／外部JSの参照 → 削除

## 価格の税込・税抜変換

### モール別の標準

| モール | 入力 |
|---|---|
| 楽天 | 税込 |
| Amazon | 税込 |
| Yahoo! | 税込 |
| Shopify | 税抜が初期値（管理画面の税設定で税込にできる） |

### 楽天 → Shopify（税込→税抜）

楽天で `1,980円（税込）` → Shopifyで `1,800円（税抜）` + 税率10%設定
（1980 / 1.1 = 1800、Shopify側の「税抜価格＋自動税計算」モードを使う場合）

または Shopifyで `1,980円（税込価格として表示）` + 「商品価格を税込として扱う」設定をON
（Markets / Taxes設定）

### Shopify → 楽天/Amazon/Yahoo!

- Shopifyで税抜価格なら → 税込価格に換算（×1.10）して入力
- Shopifyで税込価格設定なら → そのまま入力

## バリエーション構造の変換

### 楽天 → Amazon

楽天1商品（項目選択肢で9SKU） → Amazon 1親ASIN + 9子ASIN
- 各子ASINに固有のitem_sku, external_product_id, main_image_urlを設定
- variation_themeはカテゴリ別の指定値（Color, Size, SizeColor等）から選択

### Shopify → 楽天

Shopify 1Product 9Variant → 楽天 1商品 + 項目選択肢9パターン
- Option1 Name=Color → 楽天 横軸：カラー
- Option1 Value 黒/白/赤 → 楽天 横軸選択肢：黒/白/赤
- Option2 Name=Size → 楽天 縦軸：サイズ
- Variant SKU → 楽天 SKU管理番号
- Variant Inventory Qty → 楽天 項目選択肢別在庫

### Amazon → Yahoo!

Amazon 1親+9子 → Yahoo! 1code（option1×option2）
- variation_theme=SizeColor → option1=Color, option2=Size
- 子ASINのitem_skuを Yahoo!のオプション値ベースで再構成

## カテゴリ／ジャンルID変換

モール固有のIDのため**自動変換不可**。手作業マッピング：

| 概念 | 楽天ジャンルID | Amazon item_type | Yahoo! product-category | Shopify Type |
|---|---|---|---|---|
| レディースファッション | 100371 | apparel | 2492 等 | Apparel & Accessories |
| 食品 | 100227 | grocery | （食品系path） | Food & Beverages |
| 美容・コスメ | 100939 | beauty | （美容系path） | Health & Beauty |

→ カテゴリ選定は別スキル `rakuten-genre-id-selector` 等を参照。

## 検索キーワードの変換

| 移行元 | 移行先 | ルール |
|---|---|---|
| 楽天 タグID | Amazon generic_keywords | タグID意味を抽出して249byteに収める |
| 楽天 タグID | Shopify Tags | カンマ区切りで設定 |
| Shopify Tags | Yahoo! abstract | 検索表示用160字に要約 |

## 在庫の表現差

| モール | 在庫切れ時の標準 |
|---|---|
| 楽天 | 在庫切れ時表示文（個別設定可） |
| Amazon | 在庫切れ → 自動非表示（再入荷予定機能あり） |
| Yahoo! | order-accept-typeで予約注文受付可 |
| Shopify | Variant Inventory Policy (deny=売切扱い／continue=受注継続) |

## 自動変換できる項目／手作業項目

### 自動変換可
- 商品コード（命名規則を統一すれば）
- JAN/EAN
- 数値型（価格・在庫数・重量）
- プレーンテキストの説明文
- 単純なHTML

### 手作業推奨
- カテゴリ／ジャンルID（モール固有）
- バリエーション親子の再設計
- 画像のリサイズ・背景白化（モール毎の要件）
- 検索キーワードの最適化（モール毎のアルゴリズム）
- 配送設定（送料区分・離島対応）
- 商標／薬機法／景表法のチェック（モール毎の運用差）

## 1ソース運用（PIM）の推奨

複数モール運用なら、自社のPIM（Product Information Management）に**最小公倍数の項目**を持っておくと変換が楽：

- 商品コード（半角英数30字以内、ネクストエンジン互換）
- 商品名（フルバージョン200字＋短縮版75字）
- 説明文（HTMLなしのプレーン版＋HTMLあり版）
- キャッチコピー（174byte版＋全角60字版）
- ブレットポイント5本
- JAN/GTIN
- 画像URL（自社CDN、モール用にリサイズ済み版を別途用意）
- 価格（税抜＋税率）
- 在庫数（マスタ）
- カテゴリ（モール別IDを保持）
- バリエーション（色×サイズの3次元配列）
