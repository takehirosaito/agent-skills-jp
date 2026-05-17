---
name: amazon-variation-parent-child-audit
description: Amazon.co.jp の親子バリエーション（variation theme／parent-child）構造を診断し、誤った組合せ・選択肢表示不備・JAN重複・レビュー統合リスクを洗い出して修正案を出すスキル。「Amazonのバリエーション診断して」「親子関係がおかしい」「色サイズの組合せを直して」「variation_theme選び方」「SizeColor／ColorSize」「親子の整合チェック」「レビュー統合リスク」「バリエーション統合したい」「親ASINと子ASINの違い」「フラットファイルで親子作って」「relationship_type=variation」「子の選択肢が出ない」など、Amazon親子バリエーションの設計・監査・修正のリクエストで必ずこのスキルを使う。30項目監査チェックリスト（親5・子10・組合せ5・共通5・データ5）、カテゴリ別variation_theme ENUM（アパレル／靴／食品／家電／コスメ／バッグ／ペット／ベビー／スポーツ／文房具）、別商品統合NG・新カラー追加・廃番扱い・移行手順までを一気通貫で対応。あらゆるカテゴリに対応。※フラットファイルの形式チェックは別スキル `amazon-flat-file-validator-jp`、カタログ競合（相乗り）の交渉は `amazon-catalog-conflict-ticket-builder`、検索非表示・出品停止からの復旧は `amazon-suppressed-listing-recovery`、タイトル・bullet改善は `amazon-title-bullet-rewriter-jp`、米国Amazonのバリエーションは `amazon-us-localization-jp-brand`。
verified_at: 2026-05
---

# Amazon 親子バリエーション 監査

## 概要

Amazon.co.jp の親子バリエーション（parent-child relationship）構造を、30項目の監査チェックリストで診断し、設計ミス・データ不整合・レビュー統合の妥当性を確認するスキル。

親子バリエーションは正しく設計すれば「色違い・サイズ違いを1ページに集約・レビューを統合・選択肢で誘導」できる強力な仕組みだが、誤った設計（別商品の統合・variation_theme の不一致・JAN重複・属性値表記揺れ）はカタログ非表示・サスペンドの原因になる。

本スキルは既存ASINの監査だけでなく、新規バリエーション設計、新カラー追加、廃番処理、誤統合の解消までを対象とする。

## ★最重要原則：「親と全子で variation_theme 完全一致／別商品を統合しない／JAN は子ごとにユニーク」

3つの絶対ルール：

1. **variation_theme は親と全子で完全一致**（大文字小文字・スペル・順序まで厳密）。カテゴリ別ENUMから選び、自由入力NG
2. **別商品を統合しない**（用途・対象・主成分が違うものを「シリーズ」として親子化するとカタログ違反・レビュー操作とみなされる可能性）
3. **JAN（external_product_id）は子ごとにユニーク**。親は空欄、子は重複なし、チェックデジットOK

親に画像・bullet・タイトル を持たせ、子は variation 属性（color／size／flavor等）と価格・在庫を持つ、という役割分担を死守する。

入力情報が不足している場合（カテゴリ別 variation_theme ENUM不明、子ASIN一覧未提供）でも止まらず、最も可能性が高いカテゴリを仮定して暫定診断を出し、「最終判断にはカテゴリテンプレートの確認が必要」を冒頭明示するハイブリッド対応。

## 知識ベース

| トピック | 場所 |
|---|---|
| 30項目監査チェックリスト（親5／子10／組合せ5／共通5／データ5） | `references/audit-checklist.md` |
| カテゴリ別 variation_theme ENUM（アパレル／靴／食品／家電／コスメ／バッグ／ペット／ベビー／スポーツ／文房具） | `references/variation-themes.md` |
| 親子バリエーション設計パターン（色のみ／サイズのみ／色×サイズ／フレーバー／容量） | `references/design-patterns.md` |
| 既存ASIN移行・統合解消・新カラー追加の手順 | `references/migration-guide.md` |
| 修正事例（誤統合の解消・新色追加・廃番処理） | `references/examples.md` |

詳細は references/ を参照。

### 30項目監査の構成

| 大分類 | 項目数 | 対象 |
|---|---:|---|
| A. 親の確認 | 5 | parent_child=parent／価格JAN空欄／variation_theme／ブランド名／画像bullet |
| B. 子の確認 | 10 | parent_child=child／parent_sku／relationship_type／variation_theme／属性値／JAN／価格／在庫／子別商品名 |
| C. 組合せの妥当性 | 5 | 完全性／重複なし／表記統一／在庫切れ管理／廃番扱い |
| D. 共通要素の整理 | 5 | bullet／メイン画像／サブ画像／商品仕様／カテゴリ |
| E. データ整合性 | 5 | フラットファイル整合／JANチェックデジット／カテゴリENUM／親子検索表示／レビュー統合 |

### 主要 variation_theme ENUM（抜粋）

| カテゴリ | 主要ENUM |
|---|---|
| アパレル | Size / Color / SizeColor / ColorSize / SizeName-ColorName |
| 靴 | Size / Width / Color / SizeColor / SizeWidth / SizeColorWidth |
| 食品 | Size（容量）/ Flavor / Count / Volume / ItemPackageQuantity |
| 家電 | Color / Style / Wattage / Capacity |
| コスメ | Color / Volume / Scent / Shade |
| バッグ | Color / Size / Pattern / Material |

完全リストは `references/variation-themes.md`。

## 処理フロー

### Step 1：入力情報の確認

- 親ASIN・子ASIN一覧
- 商品タイプ（カテゴリ）
- 現行 variation_theme
- 各子のJAN／価格／在庫
- 各子の商品名・属性値（color_name／size_name等）
- 既存レビュー件数（親・各子）
- フラットファイル（任意・データ整合確認用）

不足時は仮値で進め、最終確認をフラグ化。

### Step 2：variation_theme の正当性確認

`references/variation-themes.md` でカテゴリ別ENUMを確認：

- 親と全子で完全一致か（大文字小文字・スペル）
- カテゴリのENUM値か（自由入力されていないか）
- カンマ区切り「Color, Size」のような無効値でないか

### Step 3：親（Parent）の整合性確認（5項目）

- `parent_child` = `parent`
- `standard_price`／`quantity`／`external_product_id`（JAN）が空欄
- `variation_theme` が設定済み
- `brand_name`／`item_name`（全バリエーション包括名）
- 親に画像・bullet 5箇条が登録されている

### Step 4：子（Child）の整合性確認（10項目）

各子について：

- `parent_child` = `child`
- `parent_sku` が親の `item_sku` と一字一句一致
- `relationship_type` = `variation`
- `variation_theme` が親と完全一致
- variation_theme=Size なら全子で `size_name` 埋まる（Color／SizeColor も同様）
- `external_product_id`（JAN）が子ごとにユニーク、チェックデジットOK（`jan-code-checker` で検証）
- `standard_price` 設定済み
- `quantity` 設定済み
- 子の `item_name` にバリエーション属性が反映（色名・サイズ等）

### Step 5：組合せの妥当性（5項目）

- variation_theme=SizeColor の場合、色×サイズの全組合せが揃っているか（2色×3サイズ=6子）
- 同じ色×同じサイズの子が複数ないか（重複）
- 色名・サイズ表記の統一（「Black」と「黒」が混在しない）
- 在庫切れ子は quantity=0 で残し、削除しない
- 廃番子は販売停止（削除はレビュー喪失のリスク）

### Step 6：共通要素・データ整合性（10項目）

- 親のbullet 5箇条が全バリエーション包括内容
- 親メイン画像は代表色／代表サイズ
- 子メイン画像は各バリエーション固有
- 商品仕様欄の共通項目は親で設定
- カテゴリは親子で同一
- フラットファイル整合
- レビュー統合が妥当（別商品の統合になっていないか）

### Step 7：別商品統合のチェック（重要）

以下が混ざっていないか：

- 用途が違う（朝用クリーム／夜用クリーム → 別商品）
- 対象が違う（赤ちゃん用／大人用 → 別商品）
- 主成分が違う（同じシリーズ名でも処方が全く違うなら別商品）
- 規格・適合機種が違う（USB-C専用／USB-A専用 → 別商品）

別商品を統合するとカタログ違反・レビュー操作とみなされる可能性。

### Step 8：修正案の出力

問題箇所ごとに：

- 修正内容
- フラットファイル列・値
- セラーセントラル操作 or サポート問い合わせ
- 影響範囲（レビュー・カート・在庫）

`references/migration-guide.md` で既存ASIN変更時の段階的手順を確認。

### Step 9：サポート問い合わせ文案（必要時）

variation_theme 変更・親子関係再構築は通常フラットファイル再アップで反映できるが、誤統合の解消・親子関係の切り離しは Catalog Support（カタログサポート）への問い合わせが必要なケースあり。

`amazon-catalog-conflict-ticket-builder` と連携。

## 代表例（コスメ・保湿クリーム ColorVolume 設計）

親ASIN：`B0XXXXXXXX`（variation_theme=`Volume`）
子ASIN：3SKU（30ml／50ml／100ml）

| 項目 | 親 | 子30ml | 子50ml | 子100ml |
|---|---|---|---|---|
| parent_child | parent | child | child | child |
| parent_sku | - | [親sku] | [親sku] | [親sku] |
| relationship_type | - | variation | variation | variation |
| variation_theme | Volume | Volume | Volume | Volume |
| volume_name | - | 30ml | 50ml | 100ml |
| standard_price | （空欄） | 2,800 | 4,500 | 7,800 |
| quantity | （空欄） | 100 | 80 | 50 |
| external_product_id | （空欄） | 4901234567890 | 4901234567894 | 4901234567898 |

監査結果：30項目すべてPASS。

別商品統合NGの例：「保湿クリーム30ml」と「クレンジングオイル100ml」を1つの親で統合 → カテゴリ・用途・主成分が違うため別商品扱い。`relationship_type=variation` 不可。

詳細7ジャンル例（家電・コスメ・食品・アパレル・日用品・ベビー・ペット）は `references/examples.md`。

## 出力フォーマット

````markdown
# 親子バリエーション監査：[親ASIN]

## 0. 前提・仮定
- 親ASIN：[ ]
- 子ASIN数：[N]
- カテゴリ：[コスメ／家電／…]
- 現行 variation_theme：[ ]
- 仮定：[カテゴリENUM未確認 等]
- 確認したい点：[セラーセントラル「在庫＞商品登録テンプレート」で最新ENUM確認]

## 1. variation_theme 適合性

| 項目 | 状態 | 判定 |
|---|---|---|
| カテゴリENUM準拠 | [Volume] | OK |
| 親と全子で一致 | 一致／不一致 | [親=Volume, 子1=volume → NG（大文字小文字）] |

## 2. 監査結果（30項目）

| # | 項目 | 状態 | 修正内容 |
|---|---|---|---|
| 1 | 親の parent_child=parent | OK | - |
| 2 | 親の価格・JAN空欄 | OK | - |
| 3 | 親の variation_theme 設定 | OK | - |
| ... | ... | ... | ... |
| 11 | 各子のJAN ユニーク | NG（B0XXXX1とB0XXXX2でJAN重複） | JAN再採番、子B0XXXX2 を 4901234567902 へ |
| ... | ... | ... | ... |

## 3. 問題箇所のサマリー

| 問題 | 影響 | 緊急度 | 修正案 |
|---|---|---|---|
| JAN重複 | 検索ペナルティ | 高 | 再採番 |
| 色名表記揺れ（「Black」「黒」混在） | 選択肢表示乱れ | 中 | 「ブラック」に統一 |

## 4. 選択肢名（子の表示名）案

| 子ASIN | 現行表示 | 改善案 |
|---|---|---|
| B0XXXX1 | 30ml | 30ml（旅行サイズ） |
| B0XXXX2 | 50ml | 50ml（レギュラー） |
| B0XXXX3 | 100ml | 100ml（お徳用） |

## 5. 修正手順

| # | 作業 | 方法 | 影響 |
|---|---|---|---|
| 1 | JAN再採番 | フラットファイル再アップ | 子ASIN保持・レビュー保持 |
| 2 | 色名統一 | セラーセントラル「商品編集」 | 子ASIN変更なし |
| 3 | 選択肢名改善 | フラットファイル `item_name` 更新 | 検索KW追加効果 |

## 6. 別商品統合の判定

| 子ASIN | 用途・対象・主成分 | 統合妥当性 |
|---|---|---|
| B0XXXX1（保湿クリーム） | 朝夜兼用・全肌タイプ | OK |
| B0XXXX2（保湿クリーム） | 朝夜兼用・全肌タイプ | OK |
| B0XXXX9（クレンジング） | クレンジング | **NG・親から外す** |

## 7. サポート問い合わせ文案（必要時）

```text
件名：ASIN:B0XXXXXXXX の親子バリエーション関係再構築のお願い

[セラーサポート（カタログ）御中]

下記ASINについて、親子バリエーション関係に誤統合があり、フラットファイル再アップ
では解消できないため、サポート対応のご依頼です。

親ASIN：B0XXXXXXXX
切り離し対象子ASIN：B0XXXX9（クレンジング・別商品）

理由：
- カテゴリ（保湿クリーム vs クレンジング）が異なる
- 用途・主成分が完全に異なる
- variation_theme=Volume の対象外

ご対応のほどよろしくお願いいたします。
```

## 8. 監査後の再発防止

- [ ] 新カラー追加時の variation_theme・属性値の事前チェック
- [ ] JAN採番ルールの社内文書化
- [ ] 別商品統合の判定基準（用途・対象・主成分）を社内マニュアル化
- [ ] 月次の親子バリエーション全件チェック
````

## 品質ゲート

- variation_theme がカテゴリ別ENUM値（自由入力されていない）
- 親と全子で variation_theme が完全一致（大文字小文字・スペルまで）
- 親の `standard_price`／`quantity`／`external_product_id` が空欄
- 子の `parent_sku` が親の `item_sku` と一字一句一致
- 子の `relationship_type` = `variation`
- 各子のJAN（external_product_id）がユニーク、チェックデジット正常
- 同じ色×同じサイズの子が複数ない（組合せ重複なし）
- 色名・サイズ表記が統一（「Black」「黒」「ブラック」の混在なし）
- 別商品（用途・対象・主成分が違うもの）を統合していない
- 在庫切れ子は削除せず quantity=0 で残している（レビュー保護）
- レビュー統合が妥当（別商品のレビューを混ぜていない）

## エッジケース

- **カテゴリ別ENUMに該当値がない**：類似商品（同カテゴリ上位ASIN）の variation_theme を参考、`amazon-catalog-conflict-ticket-builder` でサポート相談
- **variation_theme の変更**：親子関係が一度切れる、レビュー集約がリセットされる可能性。新親子を別作成→段階的移行が安全
- **新カラー追加**：既存variation_theme を維持したまま子追加。属性値の表記揺れに注意
- **廃番処理**：削除でなく販売停止（quantity=0）。レビューが残るため再販時に有利
- **3属性以上の組合せ（色×サイズ×素材）**：対応ENUMがない場合は2属性に簡略化。素材は商品仕様で表現
- **複数親で同じ子（不可）**：1子につき1親が原則。複数親への帰属はカタログ違反
- **米国Amazonとカテゴリ別ENUMが違う**：国別に確認。米国出品は別スキル `amazon-us-localization-jp-brand`
- **誤統合の解消**：フラットファイル再アップでは解消できないことが多い。カタログサポート問い合わせが必要

## 注意事項

- variation_theme の値はカテゴリ別ENUMで厳密管理。最新はセラーセントラル「商品登録テンプレート」で確認
- 別商品の統合はレビュー操作とみなされ、サスペンドの原因に
- 親ASIN の `item_name` は全バリエーションを包括する名称（特定の色・サイズに偏らない）
- 既存ASINの親子関係を大幅変更すると検索評価がリセットされる可能性。段階的移行を推奨
- 子のJAN は GTIN-13（JAN-13）が標準。チェックデジットは `jan-code-checker` スキルで検証可
- レビュー統合の妥当性は Amazon ポリシーで明確化されている：用途・対象・主成分が同じ商品のバリエーションのみ統合可

## references/ 一覧

- `references/audit-checklist.md`：30項目監査チェックリスト（親5／子10／組合せ5／共通5／データ5）
- `references/variation-themes.md`：カテゴリ別 variation_theme ENUM 完全リスト
- `references/design-patterns.md`：親子設計パターン（色／サイズ／色×サイズ／フレーバー／容量）
- `references/migration-guide.md`：既存ASIN移行・統合解消・新カラー追加の手順
- `references/examples.md`：カテゴリ別事例（家電・コスメ・食品・アパレル・日用品・ベビー・ペット）

## 参考公式情報源

- Amazon セラーセントラル「商品登録テンプレート」（カテゴリ別Excel）
- Amazon セラーセントラル「親子関係（バリエーション）」ヘルプ
- Amazon セラーセントラル「商品情報のスタイルガイド」
- GS1 Japan（JAN コード採番ルール）
