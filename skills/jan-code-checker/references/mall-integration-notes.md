# モール別の運用メモ

以下は2025-2026年時点の運用ノウハウ。**モール仕様は変更されるため、登録前に各モールの公式ヘルプで最新を確認**すること。実務ノウハウを公式必須要件のように断定しない。

## Amazon.co.jp

- フラットファイルの **external_product_id** 列に JAN/EAN/UPC/ISBN/GTIN を入力
- **external_product_id_type** 列に `JAN` / `EAN` / `UPC` / `ISBN` / `GTIN` を指定
- **GTIN免除申請**：プライベートブランド・ハンドメイド・部品・卸売商品等は、ブランド登録のうえGTIN免除申請が可能（Amazonポリシーに従う）
- 同一GTINで複数ASINが存在する場合、Amazonカタログ上で相乗りまたは重複出品となり、最悪サスペンドのリスク
- 中古品・並行輸入品は新品ASINと別ASINを作成
- UPC-A（GTIN-12）は `external_product_id_type=UPC` のまま登録可能

## 楽天市場

- normal-item.csv の **カタログID** 列に JAN/EAN/ISBN/UPC を入力（30byte以内）
- カタログIDが入っていると楽天市場商品ランキングや楽天カタログとマッチングする
- UPC-A（12桁）の取り扱いは楽天側のカタログID仕様による。先頭0でGTIN-13化する運用は実務でよく見られるが、楽天側公式の必須要件かは別途確認すること（断定しない）
- 文字コードは Shift_JIS（CP932）、改行コードは CR+LF

## Yahoo!ショッピング

- **product-code** 列に JAN/ISBN
- 13桁標準、8桁JANも可
- Yahoo!検索のキーワードとしてもJANが効くため、未入力は機会損失

## Shopify

- variant の **barcode** プロパティに記入
- variant単位で持つ
- Google Merchant Center連携時、GTIN必須化政策（特定カテゴリ）に注意

## Google Merchant Center

- 新製品・ブランド品は `gtin` 属性が必須になる場合がある（カテゴリ次第）
- 自社製造・ハンドメイドは `identifier_exists: false` で回避できる場合がある
- 詳細はGoogle Merchant Centerの最新ポリシーに従う

## ネクストエンジン・クロスモール（受注・在庫連携）

- 各モールに登録されているJAN/SKUを軸に在庫を連携
- 同一JANで複数モールに登録されている場合、SKUマッピングを正しく設定すれば在庫が連動
- バリエーション毎に別JANが付いていれば管理しやすい

## まとめ

| モール | JAN列名 | 主な注意点 |
|---|---|---|
| Amazon | external_product_id（type指定） | 同一GTINの重複出品はサスペンドリスク |
| 楽天 | カタログID（30byte） | UPC-A取扱はRMS最新仕様を確認 |
| Yahoo! | product-code | 8桁/13桁いずれも可 |
| Shopify | variant.barcode | GMC連携時はGTIN必須カテゴリに注意 |
| GMC | gtin属性 | 自社製造はidentifier_exists:falseで回避可 |

## 共通の運用注意

- 重複JAN（複数SKUに同一GTIN）は原則NG。バリエーションは別GTINが原則
- インストアコード（02 / 20-29）はどのモールでも登録NG
- 文字コード問題：楽天はSJIS、AmazonはUTF-8/TSVが主流、ShopifyはUTF-8
- 仕様変動が頻繁なため、登録前に必ず各モールの最新ヘルプを確認
