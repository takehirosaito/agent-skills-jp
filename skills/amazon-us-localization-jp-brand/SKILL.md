---
name: amazon-us-localization-jp-brand
description: 日本ブランドが Amazon.com（米国Amazon）へ出品する際の商品ページを、英語タイトル・bullet・Description・Search Terms・単位換算・規格対応・規制対応まで含めてローカライズするスキル。「Amazon US向けに英語化して」「Amazon.com出品準備」「日本商品を米国向けに」「ヤード・ポンド換算」「FDA表記」「FCC認証」「Prop 65」「米国Amazon SEO」「日本ブランドの越境EC」「USタイトル」「USバレット」など、日本商品の米国Amazon出品リクエストで必ずこのスキルを使う。日本語→英語の直訳ではなく、米国購入者の検索意図・表現様式（数字訴求・KEY ATTRIBUTE先頭大文字・直接的表現）に合わせた現地化、ml→fl oz／g→oz／cm→inch／℃→℉の単位換算、PSE→UL/ETL／FCC／FDA／Prop 65（カリフォルニア州）など規格・規制への対応を一気通貫で出力。化粧品・食品・電化製品・アパレル・ホーム&キッチン等のカテゴリに対応。※Amazon.co.jp（日本）のタイトル・bulletは別スキル `amazon-title-bullet-rewriter-jp`、米国の利益計算・関税は別途要確認、A+コンテンツ構成は `amazon-a-plus-content-brief`、薬機・景表（日本）は `yakki-keihyo-expression-check`。
verified_at: 2026-05
---

# 日本ブランド Amazon.com（米国Amazon）ローカライズ

## 概要

日本ブランドが Amazon.com（米国Amazon）へ越境出品する際に、商品ページを米国市場向けに最適化するスキル。

直訳ではなく米国購入者の検索意図と表現様式に合わせ、単位を米国系に換算し、FDA／UL／FCC／Prop 65 等の規制・認証対応を踏まえて、英語タイトル・bullet・Description・Search Termsを設計する。

「Helps support」「May reduce」のような遠回しな英語ではなく、米国Amazonで響く「直接的・数字訴求・KEY ATTRIBUTE先頭大文字」の表現様式を採用する。

## ★最重要原則：「直訳しない／数字で訴求／米国単位／規制確認を必ず明示」

4つの絶対ルール：

1. **直訳しない**：「Helps support healthy skin」より「Supports healthy skin」、「May contribute to」より「Contributes to」。米国Amazon は断定的・直接的な表現が標準
2. **数字で訴求**：「Strong suction」より「20 kPa Suction Power」、「Long battery life」より「40-min Continuous Runtime」、「Many sizes」より「Available in 4 Sizes」
3. **米国単位**：ml→fl oz、g→oz、kg→lb、cm→inch、m→ft、℃→℉。日本単位は括弧書きでサブ表記
4. **規制確認を必ず明示**：化粧品はFDA・Prop 65、電化製品はUL/ETL・FCC、食品はFDA Food Labeling、玩具はASTM／CPSC など、対応状況を出力に明記

電化製品の電圧（100V専用は米国不可）、化粧品の効能訴求（FDAルール）、食品のアレルゲン表示（FDA Big 9）など、**規制不適合品は売上ロスではなく法的リスク**なので、不明箇所は「要確認」フラグを必ず立てる。

入力情報が不足している場合（規格認証の有無、原産地、ターゲット顧客など）でも止まらず、仮定ベースの初稿を出し「最終判断には認証書・規格適合書の確認が必要」を冒頭明示するハイブリッド対応。

## 知識ベース

| トピック | 場所 |
|---|---|
| 英語タイトル・bullet・Description のライティング様式（Title Case／KEY ATTRIBUTE／数字訴求） | `references/english-writing.md` |
| 単位換算表（ml/g/kg/cm/m/℃ → fl oz/oz/lb/inch/ft/℉） | `references/unit-conversion.md` |
| 米国規格・認証対応（PSE→UL/ETL／FCC／FDA／Prop 65／ASTM） | `references/regulations-us.md` |
| カテゴリ別規制（化粧品／食品／電化製品／アパレル／玩具） | `references/category-regulations.md` |
| 実例（化粧品・電化製品・食品・アパレル・キッチン） | `references/case-studies.md` |

詳細は references/ を参照。

### 英語タイトルの基本フォーマット

```text
[Brand] [Product Name], [Key Attribute 1] [Key Attribute 2] [Variation], [Quantity]
```

例：
```text
[Brand] Cordless Vacuum Cleaner, 2.6 lb Lightweight, LED Headlight, 20 kPa Strong Suction, 40-min Runtime, 2-Year US Warranty
```

### 英語 bullet の基本フォーマット

```text
KEY ATTRIBUTE: Benefit description in 1-2 sentences. Additional context.
```

冒頭に KEY ATTRIBUTE を UPPERCASE で強調 → コロン → ベネフィット → 補足。1 bullet 250〜500字（英語）。

### 主要な単位換算

| 日本単位 | 米国単位 | 換算 |
|---|---|---|
| 1 ml | 0.034 fl oz | 30ml ≈ 1 fl oz |
| 1 g | 0.035 oz | 100g ≈ 3.5 oz |
| 1 kg | 2.205 lb | 1.2kg ≈ 2.6 lb |
| 1 cm | 0.394 inch | 30cm ≈ 11.8 inch |
| 1 m | 3.281 ft | 1m ≈ 3.3 ft |
| ℃ | ℉ | ℉ = ℃×1.8+32 |

## 処理フロー

### Step 1：入力情報の確認

- 対象商品の日本語商品ページ（タイトル・bullet・商品説明・A+）
- 商品スペック（重量・寸法・容量・成分・電圧・電源・素材）
- ターゲット国・州（米国全域／カリフォルニア州含む等）
- 既取得の規格認証（PSE／UL／ETL／FCC／FDA／CE等）
- ブランドストーリー・歴史
- 価格戦略（USD建て）

不足時は仮定で進め、認証要確認を冒頭明示。

### Step 2：カテゴリ別規制チェック

`references/category-regulations.md` `references/regulations-us.md` でカテゴリ別の規制を確認：

- **電化製品**：UL or ETL（電気安全）、FCC（電波）、電圧（100V専用はNG、ユニバーサル100-240Vが推奨）
- **化粧品**：FDA Cosmetic Labeling、Prop 65（カリフォルニア州）、INCI名成分表記、SPF表記要件
- **食品・サプリ**：FDA Food Labeling、Nutrition Facts、アレルゲン Big 9 表示、Supplement Facts
- **アパレル**：FTC ラベリング（素材・原産国・洗濯表示）、カリフォルニア州染色規制
- **玩具**：ASTM F963、CPSC、6歳未満は小部品警告
- **電池**：UN 38.3、IATA／航空輸送規制

不適合・未確認の項目は出力に「要確認」フラグ。

### Step 3：単位換算

商品ページ内の全数値を米国単位に換算：

- 重量：g → oz、kg → lb
- 容量：ml → fl oz、L → gal／fl oz
- 寸法：mm/cm → inch、m → ft
- 温度：℃ → ℉

例：「1.2kg / 30ml / 25cm / 60℃」→「2.6 lb / 1 fl oz / 9.8 inch / 140℉」

米国単位を主、日本単位を括弧書きでサブ表記する場合もあり。

### Step 4：英語タイトルの作成

- ブランド + Product Name + Key Attributes + Variation + Quantity
- Title Case または一部 UPPERCASE
- 米国Amazon のカテゴリ別文字数上限内（多くは150〜200字、推奨60〜80字）
- 数字訴求（「Strong」より「20 kPa」）
- 米国単位

### Step 5：bullet 5箇条の作成

`references/english-writing.md`：

- KEY ATTRIBUTE: で冒頭強調
- 直接的・断定的表現（米国式）
- 数字訴求
- 1 bullet 250〜500字
- 顧客便益→属性→補足の順
- 米国市場の価値観（Convenience／Time-saving／Family-friendly／Eco-friendly／Made in USA／FDA-approved）に響く言葉選び

### Step 6：Product Description / A+ の作成

- Description：2,000字以内、改行・段落で読みやすく
- A+ コンテンツ：ブランドストーリーや使用シーンを画像中心で展開
- 「日本らしさ」を活用する場合は「Japanese craftsmanship」「Made in Japan」「Japanese-style」など米国で価値が伝わる表現

### Step 7：Search Terms（generic_keywords 米国版）

- 米国Amazon の generic_keywords は249バイト相当（英語ベースで100〜200語可能）
- 米国顧客が使う実際の語（「futon」「kawaii」など日本語ローン語も該当に応じて）
- 同義語、表記揺れ（color/colour）、米国スラング

### Step 8：規制対応のチェックリスト出力

未確認の規制項目を「要確認リスク」として明示：

| 規制 | 状態 | 影響 |
|---|---|---|
| UL/ETL認証 | 未取得 | 米国Amazon 電化製品出品の事実上の前提、要取得 |
| FCC ID | 取得済 | パッケージ・商品本体への表記必須 |
| Prop 65 | 未確認 | カリフォルニア州販売時に化学物質警告ラベル要 |

### Step 9：価格戦略・関税の確認指示

- USD建て価格設定
- 米国Amazon の販売手数料率（日本と異なる）
- 関税（HS Code・FTAの有無）
- 輸入諸経費（フォワーダー・通関）
- FBA US の保管料・配送代行料（日本FBAと別体系）

詳細は別途専門家確認を促す。

## 代表例（コードレス掃除機）

### 英語タイトル
```text
[Brand] Cordless Vacuum Cleaner, 2.6 lb Lightweight, LED Headlight, 20 kPa Strong Suction, 40-min Runtime, HEPA Filter, 2-Year US Warranty
```

### bullet 1
```text
LIGHTWEIGHT 2.6 LB DESIGN: Weighing just 2.6 pounds (1.2 kg), this cordless vacuum can be operated with one hand, reaching ceiling dust and high corners with ease. Designed for everyone in the family, including seniors who find traditional vacuums too heavy.
```

### 規制チェック
- 電圧：100-240V ユニバーサル → 米国販売OK
- UL認証：取得済 → タイトル・パッケージに UL マーク
- FCC：未取得 → 無線機能なしのため対象外
- Prop 65：含有物質確認、必要なら警告ラベル

詳細5ジャンル例（化粧品・電化製品・食品・アパレル・キッチン）は `references/case-studies.md`。

## 出力フォーマット

````markdown
# Amazon.com ローカライズ：[商品名]

## 0. 前提・仮定
- 対象商品：[ ]
- 日本語ASIN：[ ]
- カテゴリ（米国Amazon）：[ ]
- 既取得認証：[UL／ETL／FCC／FDA／その他]
- ターゲット州：[米国全域／西海岸／カリフォルニア含む]
- 仮定：[ ]
- 確認したい点：[ ]

## 1. カテゴリ別規制チェック

| 規制 | 必要性 | 取得状況 | 対応 |
|---|---|---|---|
| UL認証 | 電化製品の前提 | 取得済 | タイトル明記 |
| FCC | 無線機器に必須 | 不要 | - |
| FDA Cosmetic | 化粧品に必須 | - | - |
| Prop 65 | カリフォルニア州 | 要確認 | 含有物質チェック |

## 2. 単位換算

| 項目 | 日本単位 | 米国単位 |
|---|---|---|
| 重量 | 1.2kg | 2.6 lb |
| 容量 | 30ml | 1 fl oz |
| 寸法 | 25cm | 9.8 inch |

## 3. 英語タイトル

```text
[Brand] Cordless Vacuum Cleaner, 2.6 lb Lightweight, LED Headlight, 20 kPa Strong Suction, 40-min Runtime, HEPA Filter, 2-Year US Warranty
```

- 文字数：[XXX]字（上限内）
- 主要KW：cordless vacuum cleaner / lightweight / HEPA

## 4. Bullet Points（5箇条）

1. `LIGHTWEIGHT 2.6 LB DESIGN: ...`
2. `POWERFUL 20 KPA SUCTION: ...`
3. `40-MIN RUNTIME & LED HEADLIGHT: ...`
4. `HEPA FILTRATION: ...`
5. `2-YEAR US WARRANTY: ...`

## 5. Product Description

```text
[英語Description本文 / 2,000字以内]
```

## 6. Search Terms（バックエンドKW）

```text
[半角スペース区切りの英語KW列]
```

- バイト数：[XXX] / 249

## 7. ローカライズメモ

- 日本らしさを残す表現：「Japanese craftsmanship」「Made in Japan」
- 米国で響く価値：Convenience／Time-saving／Family-friendly
- 直訳を避けた箇所：「Helps support」→「Supports」、「May reduce」→「Reduces」

## 8. 要確認リスク

| 項目 | リスク | 対応 |
|---|---|---|
| Prop 65 化学物質 | カリフォルニア州販売不可リスク | 第三者検査機関で含有量測定 |
| FBA US 配送代行料 | 利益見積もり要 | 専門家相談 |
| 関税（HS Code） | コスト構造変化 | 通関業者確認 |
| 商標 USPTO登録 | 米国での権利保護 | 弁理士相談 |

## 9. 価格戦略（仮）

- 日本販売価格（参考）：JPY 10,000
- 想定USD価格：$79.99
- FBA配送代行・保管料：別途算出（米国FBA料金体系）
- 関税・輸入諸経費：別途算出
- 利益・限界ACOS：別スキル `amazon-profit-fee-checker` で算出（米国版要追加調査）
````

## 品質ゲート

- 直訳調が抜けている（「Helps support」「May contribute to」「Aims to」等の遠回し表現が修正済み）
- すべての数値が米国単位に換算されている（重量 lb／容量 fl oz／寸法 inch／温度 ℉）
- カテゴリ別の主要規制（UL／FCC／FDA／Prop 65／ASTM）が確認またはフラグ立てされている
- bullet 冒頭が KEY ATTRIBUTE: の UPPERCASE 形式
- 各bullet に数字（英語数字 or 単位付き）が最低1つ
- 効能訴求（FDA違反となるような医薬品的表現）が含まれていない
- Title Case が一貫している（前置詞・冠詞は小文字、主要語は大文字）
- 半角スペース・半角記号で統一（全角の混入なし）
- 要確認リスクが具体的（「規制を確認する」だけでなく対応策を明示）

## エッジケース

- **電圧100V専用の家電**：そのまま米国販売は故障リスク・PL責任。変圧器同梱 or ユニバーサル電圧モデルへ変更
- **化粧品の効能訴求**：FDAは「美白」「メラニン抑制」を「医薬品扱い（drug）」と判断する場合あり。「Brightens」「Reduces appearance of dark spots」など現地表現
- **食品の機能性訴求**：FDA Structure/Function Claim ルール。「治療」「予防」は medical claim、米国でも NG
- **玩具の年齢表記**：3歳未満／6歳未満で小部品警告ラベルが法定。安全規格適合がない場合は出品不可
- **木製品**：Lacey Act（違法伐採規制）、CITES（絶滅危惧種）。原産地・樹種証明書
- **テキスタイル**：FTC ラベリング義務（素材組成・洗濯表示・原産国）。カリフォルニア州で染色規制
- **アルコール・タバコ**：基本的に米国Amazon で個人セラー販売不可
- **重量・容量が小さい商品**：FBA US Small and Light プログラム対象になる可能性

## 注意事項

- 米国規制は連邦・州で重層的。カリフォルニア州（Prop 65）、ニューヨーク州など州別追加規制に注意
- FBA US の料金体系は日本FBA と別。配送代行料・保管料・長期保管料・返品処理料すべて別レート
- 関税・輸入諸経費・通関は本スキル範囲外。専門家・通関業者へ
- 商標は USPTO（米国特許商標庁）登録で保護。日本の商標登録は米国では効力なし
- レビュー獲得は Amazon Vine（米国版）が有効。Brand Registry 必要
- 言語は米国英語（color／organize）が標準。英国英語（colour／organise）は避ける
- 仕様変動するため、最新は Amazon.com Seller Central のスタイルガイドで確認

## references/ 一覧

- `references/english-writing.md`：英語タイトル・bullet・Descriptionの様式
- `references/unit-conversion.md`：単位換算表（重量・容量・寸法・温度）
- `references/regulations-us.md`：米国規格・認証（UL／ETL／FCC／FDA／Prop 65）
- `references/category-regulations.md`：カテゴリ別規制（化粧品／食品／電化／アパレル／玩具）
- `references/case-studies.md`：カテゴリ別実例

## 参考公式情報源

- Amazon.com Seller Central スタイルガイド
- FDA Cosmetic Labeling Guide / Food Labeling Guide
- FCC Equipment Authorization
- UL Solutions / Intertek（ETL）
- California Office of Environmental Health Hazard Assessment（Prop 65）
- USPTO（米国特許商標庁）
- ASTM International / CPSC（玩具・消費者製品安全）
