---
name: merchant-center-feed-error-fixer
description: Google Merchant Center（GMC）の商品フィードで発生する不承認・警告・通知を、必須属性欠落／値形式違反／画像クロール失敗／ランディングページ不一致／ポリシー違反の5系統に分類し、修正値と再アップロード手順までを示すスキル。「Merchant Centerのエラー」「GMC不承認」「商品フィードエラー」「Googleショッピングで承認されない」「Invalid GTIN」「Missing required attribute」「Image link crawl error」「Price mismatch」「Availability mismatch」「Promotional overlay」「Disapproved」「identifier_exists」「item_group_id」「google_product_category」「Schema.org Product」など、GMCのフィード品質エラーの原因特定と修正で使う。タイトル150字／説明5,000字／価格（通貨単位付き）／HTTPS／GTINチェックデジット／identifier_exists運用／画像要件（HTTPS・800×800以上・テキスト無し）／ランディングページとの価格・在庫・送料整合／衣料品のsize/color/age_group/gender必須／GMCポリシー（誇大表現・薬機法・偽造品）に対応。※GMCのカテゴリ別ポリシー診断・参入可否判定は別スキル `google-merchant-center-policy-diagnosis`、薬機法・景表法の表現修正は `yakki-keihyo-expression-check`、JANのチェックデジット計算は `jan-code-checker`。
verified_at: 2026-05
---

# Google Merchant Center フィードエラー修正

## 概要

Google Merchant Center（GMC）で表示されるエラー・警告・通知を、(A) 必須属性関連、(B) 値の形式違反、(C) 画像エラー、(D) ランディングページ不一致、(E) タイトル・説明の問題、(F) ポリシー違反、(G) カテゴリ別必須属性、(H) その他の8系統に分類し、それぞれの修正値・修正方法・再アップロード後の解除タイミングを示す。

衣料品の size/color/age_group/gender、食品・化粧品のGTIN必須、自社オリジナル品の identifier_exists:false 運用、item_group_id によるバリエーション設計、Schema.org Product 構造化データでのランディングページ整合まで対応。

## ★最重要原則

**「フィード値と商品ページの実表示の整合」が最大の検査ポイント。** GMCは送られたフィードを取り込むと同時に `link` で指定された商品ページを必ずクロールし、**price／availability／shipping** がフィードと一致するかを検査する。不一致は即不承認になる。したがって本スキルは「フィード単体の修正」だけでなく、**(a) フィードの形式エラー、(b) 商品ページとの整合、(c) GMCポリシー違反の3つを同時に検査**する。GTINを「捏造」しない、`identifier_exists:false` を「面倒だから」使わない、ポリシー違反は修正できないなら除外、の3点を厳守する。

## 知識ベース

詳細は references/ を参照：

- 頻出エラーコード集（必須属性／値形式／画像／LP不一致／タイトル・説明／ポリシー違反／カテゴリ別必須／その他8系統）：`references/error-codes.md`
- フィード主要属性（必須9＋カテゴリ別＋item_group_id／custom_label など）：`references/feed-attributes.md`
- GTIN／MPN／brand／identifier_exists の運用パターン早見表：`references/gtin-identifier-exists.md`
- ランディングページとフィードの整合検査（価格・在庫・送料・タイトル・画像）：`references/landing-page-consistency.md`
- 画像要件（HTTPS／サイズ／フォーマット／オーバーレイ禁止／robots.txt）：`references/image-requirements.md`
- GMCポリシー違反（禁止商品／誇大表現／薬機法・景表法／偽造品）：`references/policy-violations.md`
- 実例集（Invalid GTIN／Image crawl error／Price mismatch／Promotional overlay）：`references/examples.md`

要点（本ファイルに残す）：

### 必須9属性

| 属性 | 制約 |
|---|---|
| id | 50字以内、一意、再利用不可 |
| title | 150字以内 |
| description | 5,000字以内 |
| link | HTTPS必須 |
| image_link | HTTPS、JPEG/PNG/GIF/WebP/BMP/TIFF |
| availability | in_stock / out_of_stock / preorder / backorder |
| price | `数値 通貨コード`（例 `1980 JPY`、税込が標準） |
| brand | 70字以内 |
| condition | new / refurbished / used |

### カテゴリ別追加必須

- 衣料品：size / color / age_group / gender / size_system
- 食品・飲料：gtin / unit_pricing_measure / expiration_date
- 書籍：gtin（ISBN-13）
- 化粧品・健康用品：gtin / brand

### identifier_exists の運用

| 商品種別 | gtin | mpn | brand | identifier_exists |
|---|---|---|---|---|
| メーカー品（GTINあり） | 入力 | 推奨 | 必須 | 省略可（true） |
| メーカー品（GTINなし） | 空 | 入力 | 必須 | false |
| 自社オリジナル（GTIN未取得） | 空 | 任意 | 必須（自社名） | false |
| ハンドメイド | 空 | 任意 | 必須（自社名） | false |
| 書籍 | ISBN-13 | 書籍コード | 出版社 | 省略可 |

### エラー対応の優先順位

1. **重大エラー（Disapproved／不承認）**：即対応、再アップロードで解除
2. **画像クロール失敗**：サーバー側修正が必要なため時間がかかる
3. **ランディングページ不一致**：フィードと商品ページ双方の修正
4. **必須属性欠落**：データ補完
5. **警告（Warning）**：時間を見て修正
6. **通知（Notice）**：改善余地、後で対応

## 処理フロー

### Step 1：エラーの分類

ユーザーから受け取るエラー一覧（GMC画面 or Diagnostics API）を、A〜Hの8系統に分類：

| 系統 | 例 |
|---|---|
| A 必須属性 | Missing required attribute: title / brand / image_link |
| B 値形式 | Invalid GTIN / Invalid price / Invalid URL |
| C 画像 | Image link crawl error / Image too small / Promotional overlay |
| D LP不一致 | Price mismatch / Availability mismatch / Shipping cost mismatch |
| E タイトル・説明 | Promotional text in title / Title too long / Misleading |
| F ポリシー | Misleading claims / Restricted product / Counterfeit |
| G カテゴリ別必須 | Missing size / gender / age_group（衣料品） |
| H その他 | Duplicate id / Wrong currency / Inactive product |

### Step 2：必須属性欠落の修正（A）

`references/feed-attributes.md` を参照しつつ、欠落属性を補完：

- title／description：商品ページから抽出
- brand：商品ページのブランド表記と一致させる
- gtin or identifier_exists：商品種別で判定（`references/gtin-identifier-exists.md`）

### Step 3：値形式違反の修正（B）

- GTIN：8/12/13/14桁・チェックデジット検証（別スキル `jan-code-checker` の `references/check-digit-algorithm.md` のアルゴリズムを使用）
- price：`数値 通貨コード`（カンマ・通貨記号・全角を除去、税込に統一、JPY）
- link / image_link：HTTPS化、リダイレクト最小化
- availability：4値のいずれか
- condition：3値のいずれか

### Step 4：画像エラーの修正（C）

`references/image-requirements.md` を参照：

- HTTPS化
- 800×800以上に統一、64MP超は縮小
- robots.txt で Googlebot/Googlebot-Image を許可
- 画像内のテキスト・ロゴ・透かし・枠を除去
- 純白背景（RGB 255,255,255）推奨

### Step 5：ランディングページ不一致の修正（D）

`references/landing-page-consistency.md` を参照：

- 価格：商品ページの最終販売価格（税込）と一致
- 在庫：商品ページの在庫表示と一致（in_stock ↔ 「在庫あり」「カート追加可」）
- 送料：shipping 属性と商品ページの送料計算ロジックを一致
- Schema.org Product 構造化データの実装で機械的に整合性確保

### Step 6：タイトル・説明の修正（E）

- プロモテキスト除去：「送料無料」「セール中」「期間限定」「半額」「今すぐ」をtitleから削除
- 大文字・絵文字・装飾記号の濫用を抑制
- 文字数制限：title 150字／description 5,000字／brand 70字以内
- 商品ページとの内容整合（誇大・誤解を招く表現を修正）

### Step 7：ポリシー違反の修正（F）

`references/policy-violations.md` を参照：

- 誇大表現（「No.1」「最安」「絶対」「完全」）→ 客観的・控えめな表現に
- 医療効能（「治る」「効く」「免疫力UP」）→ 別スキル `yakki-keihyo-expression-check` で薬機法準拠の表現に
- 偽造品・知財侵害 → 除外
- 修正できない禁止カテゴリ → フィードから除外

### Step 8：カテゴリ別必須の補完（G）

- 衣料品：size, color, age_group（adult/kids/toddler/infant/newborn）, gender（male/female/unisex）
- 食品：gtin, expiration_date, unit_pricing_measure
- 化粧品：gtin, brand, 薬機法表現チェック

### Step 9：再アップロードと解除確認

- フィード再送信
- エラー解除は通常24〜72時間
- ポリシー違反は手動審査の場合あり（1〜7日）
- 24時間後・72時間後にDiagnosticsで再確認

## 実例

### 例1：Invalid GTIN

```
入力：gtin=4901234567891
チェックデジット計算（JAN-13）：
  奇数桁(1,3,5,7,9,11) 4+0+2+4+6+8 = 24
  偶数桁(2,4,6,8,10,12) (9+1+3+5+7+9)×3 = 102
  A+B = 126 → 下1桁6
  10-6 = 4
  正しいCD = 4 → 正規GTIN = 4901234567894
```

→ メーカーに正しいGTINを問い合わせ、`4901234567894` に修正。チェックデジット詳細は別スキル `jan-code-checker` 参照。

その他の実例（Image crawl error／Price mismatch／Promotional overlay）は `references/examples.md` 参照。

## 出力フォーマット（必須）

````markdown
# GMC フィードエラー修正結果

## 0. サマリ
- 検査商品数：N件
- 不承認：N件 / 警告：N件 / 通知：N件
- 主要エラー系統：

## 1. 必須属性欠落（A）
| id | 欠落属性 | 修正値 | 出所 |
|---|---|---|---|
|  | title |  | 商品ページから抽出 |
|  | gtin or identifier_exists |  | 商品種別で判定 |

## 2. 値形式違反（B）
| id | 属性 | 入力値 | 修正値 | 理由 |
|---|---|---|---|---|
|  | gtin |  |  | CD不一致 |
|  | price |  |  | 通貨単位なし |
|  | image_link |  |  | HTTPS必須 |

## 3. 画像エラー（C）
| id | エラー | 対応 |
|---|---|---|
|  | Image link crawl error | robots.txt許可／HTTPS化 |
|  | Image too small | 800×800以上にリサイズ |
|  | Promotional overlay | 画像を作り直し（テキスト・枠除去） |

## 4. LP不一致（D）
| id | 属性 | フィード | LP表示 | 修正方針 |
|---|---|---|---|---|
|  | price | 1980 JPY | 2,180円（税込） | フィードを2180に |
|  | availability | in_stock | 在庫切れ | 連動更新 |
|  | shipping | 0 JPY | 送料500円 | shipping 500 JPY |

## 5. タイトル・説明（E）
| id | NG | OK |
|---|---|---|
|  | 【送料無料】軽量Tシャツ★期間限定 | 軽量Tシャツ |

## 6. ポリシー違反（F）
| id | 違反種別 | 対応 |
|---|---|---|
|  | Misleading claims (No.1) | 表現修正 |
|  | Healthcare policy | 薬機法準拠表現（別スキル） |
|  | Restricted product | 除外 |

## 7. カテゴリ別必須（G）
| id | カテゴリ | 欠落属性 | 修正値 |
|---|---|---|---|
|  | 衣料品 | size, gender, age_group |  |

## 8. 修正後CSVサンプル（TSV/XML）
（修正済みフィードの該当行を提示）

## 9. 再アップロード手順
1. 修正フィードをGMCにアップロード
2. 24〜72時間でエラー再評価
3. ポリシー違反は手動審査（最大1週間）
4. 解除確認、未解除は再修正

## 10. 確認チェックリスト
- [ ] 必須9属性すべて入力
- [ ] GTINのチェックデジット検証済
- [ ] HTTPSのlinkとimage_link
- [ ] priceは通貨単位付き（JPY、税込）
- [ ] 商品ページのprice/availability/shippingとフィードが一致
- [ ] 画像は800×800以上・テキスト/ロゴなし
- [ ] 衣料品はsize/color/gender/age_groupを入力
- [ ] item_group_idでバリエーションをグルーピング
- [ ] タイトルにプロモテキスト・誇大表現なし
- [ ] 薬機法・景表法のNG表現なし
````

## 品質ゲート

- [ ] エラーを8系統（必須属性／値形式／画像／LP不一致／タイトル説明／ポリシー／カテゴリ別必須／その他）で分類している
- [ ] GTINを「捏造」せず、なければ identifier_exists:false + brand 必須 を案内している
- [ ] price は通貨単位付き（`1980 JPY`）の形式で提示している
- [ ] image_link が HTTPS、800×800以上、テキスト・ロゴ・枠なしを確認している
- [ ] フィードと商品ページの price/availability/shipping を厳密に整合させている
- [ ] 衣料品で size/color/age_group/gender を漏らさず案内している
- [ ] バリエーションは item_group_id でグルーピングしている
- [ ] タイトルからプロモテキスト・誇大表現を除いている
- [ ] 薬機法・景表法のNG表現は別スキル `yakki-keihyo-expression-check` と連携している
- [ ] 再アップロード後の解除時間（24〜72h、ポリシーは最大1週間）を明示している

## エッジケース

- **identifier_exists:false の誤用**：GTINがあるのに「面倒」で false にすると別エラー（`Identifier_exists set to false but identifiers found`）になる
- **バリエーションの個別GTIN**：色×サイズ毎に別GTINが原則。同一GTINを複数SKUに付与するとカタログマッチング不利
- **price の税抜入力**：日本では税込が標準。Shopifyの税抜デフォルトには注意
- **shipping mismatch の地域別送料**：北海道・沖縄追加料金を shipping 属性で複数行表現
- **構造化データの効果**：Schema.org Product を入れるとGoogleが価格を機械抽出でき、LP不一致が大幅に減る
- **アカウント停止後の復旧**：偽造品・安全性問題は復旧困難なので未然防止を最優先
- **手動審査**：ポリシー違反の再審査は最大1週間。間に他商品も影響を受ける場合あり

## 注意事項

- GMCの仕様・ポリシー・カテゴリ別必須属性は **頻繁に更新される**。最新は Google Merchant Center ヘルプ「商品データの仕様」「Shopping 広告のポリシー」を確認
- GTINを社内で「とりあえず採番」しない。GS1ジャパン経由の正規取得かメーカー由来GTINを使う
- 禁止商品カテゴリ（武器・タバコ・特定医薬品・偽造品）は出品自体不可
- 薬機法・景表法に関わる表現修正は別スキル `yakki-keihyo-expression-check` を併用
- アカウント停止リスクのある違反（偽造品・安全性問題）は即座に商品除外
- 顧客個人情報・購入履歴を出力に含めない

## references/ 一覧

- `references/error-codes.md` — 頻出エラーコード集と修正方針（8系統）
- `references/feed-attributes.md` — フィード主要属性（必須9＋カテゴリ別＋拡張）
- `references/gtin-identifier-exists.md` — GTIN／MPN／brand／identifier_exists の運用パターン
- `references/landing-page-consistency.md` — LP整合検査（価格・在庫・送料）
- `references/image-requirements.md` — 画像要件（HTTPS／サイズ／オーバーレイ／robots.txt）
- `references/policy-violations.md` — ポリシー違反（禁止商品／誇大表現／薬機法／偽造品）
- `references/examples.md` — Invalid GTIN／Image crawl error／Price mismatch等の実例

## 参考公式情報源

- Google Merchant Center ヘルプ「商品データの仕様」
- Google Merchant Center ヘルプ「Shopping 広告のポリシー」
- Google Merchant Center ヘルプ「GTIN 要件」「identifier_exists 属性」
- Google Merchant Center ヘルプ「画像要件」
- Schema.org「Product」
- GS1 Japan「GS1 事業者コード新規登録」「チェックデジット計算」
