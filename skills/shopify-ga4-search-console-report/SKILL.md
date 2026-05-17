---
name: shopify-ga4-search-console-report
description: ShopifyストアのGA4・Search Consoleデータから月次／週次のEC改善レポートを作成するスキル。「月次レポート」「GA4レポート」「Search Consoleレポート」「サチコ」「セッション数」「PV」「直帰率」「CVR推移」「流入チャネル」「キーワード順位」「平均掲載順位」「クリック率」「インプレッション」「異常検知」「エグゼクティブサマリ」「経営層向けレポート」など、ShopifyのGA4／Google Search Consoleデータからの月次レポート・週次レポート作成・KPI推移分析・異常検知に関するリクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※施策実行前のCVR診断は別スキル `shopify-cvr-diagnosis`、ブログ記事の企画は `shopify-blog-content-planner`。
verified_at: 2026-05
---

# Shopify GA4 / Search Console レポート作成スキル

## 概要

ShopifyストアのGA4・Search Console データから **月次・週次のEC改善レポート** を作成するスキル。

主要KPI（セッション・CVR・売上・AOV・LTV・流入チャネル別・検索クエリ別）の集計、業界ベンチマークとの比較、異常検知、エグゼクティブサマリ、推奨アクションを統合した経営層向けレポートを出力する。

## ★最重要原則

**「数値の羅列」ではなく「異常 → 仮説 → アクション」の3点セットで書く**。経営層が30秒で意思決定できるサマリを冒頭に置き、詳細は後段。指標定義を統一しないと前月比較で齟齬が出るため、KPI定義を毎回明示する。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| 主要KPI 定義集（計算式・業界平均） | `references/kpi-definitions.md` |
| GA4 レポート活用ガイド（取得方法） | `references/ga4-reports-guide.md` |
| Google Search Console 活用ガイド | `references/search-console-guide.md` |
| 異常検知の閾値・判断基準 | `references/anomaly-detection.md` |
| エグゼクティブサマリの書き方 | `references/executive-summary-style.md` |
| 月次レポート 実例集 | `references/examples.md` |

### Shopify × GA4 × Search Console の要点

- GA4 イベント：`view_item` `add_to_cart` `begin_checkout` `purchase` `view_promotion`
- 標準ディメンション：sessionDefaultChannelGroup / sessionSource / itemCategory
- Shopify 連携：Online Store ナビ「Online Store > Preferences > GA4測定ID」または customer events
- Search Console：「検索パフォーマンス」「インデックス」「Core Web Vitals」「拡張」レポート
- 計測対象URL：Shopify ストアは `/`, `/products/*`, `/collections/*`, `/blogs/*` を分けて見る

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- 対象期間（月次／週次／カスタム）
- GA4 / Search Console データの提供有無（CSV／スクリーンショット／数値貼付）
- 比較対象（前月比／前年同月比）
- 主要KPI 目標値（既知なら）
- 配信先（経営層／マーケ担当／全社）

**Step 2. KPI を5-7個に絞り込み**
- 売上・セッション・CVR・AOV・新規率・直帰率・平均掲載順位
- 各KPI の定義を明示

**Step 3. 期間比較と差分計算**
- 前月比・前年同月比・目標比

**Step 4. 異常検知**
- 各KPIで「正常な変動範囲」を超えた箇所をハイライト
- セッション急減／CVR急落／特定チャネルの異常を抽出

**Step 5. 仮説立案**
- 異常ごとに「考えられる要因」を3つまで列挙
- データで検証可能な仮説のみ採用

**Step 6. 推奨アクション**
- 即実行可能（1週間以内）／中期（1ヶ月以内）／要検討の3分類
- 各アクションに想定効果・担当部署

**Step 7. エグゼクティブサマリ作成**
- 冒頭3-5行で「今月の結論」を経営層向けに書く

## 代表例（1パターン）

化粧品ストア 4月レポート：
- セッション 45,000（前月比 +12%）／売上 5,400,000円（+8%）／CVR 1.2%（-0.3pt）
- 異常：CVR低下／オーガニック流入のCV率が-40%
- 仮説：3月末のサイト変更で商品ページのカート追加ボタンが折りたたみ下に移動
- アクション：①テーマで sticky CTA に戻す（即時）②A/Bテスト案を `shopify-cvr-diagnosis` で具体化

他ジャンル（食品・ファッション）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopify 月次レポート：[ストア名] / [対象期間]

## 0. エグゼクティブサマリ（30秒で読める）
- 今月の結論：（1文）
- 良かった点：
- 悪かった点：
- 来月最優先で取り組むこと：

## 1. 主要KPI
| KPI | 当月 | 前月 | 前年同月 | 目標 | 達成率 |
|---|---|---|---|---|---|
| セッション |  |  |  |  |  |
| 売上 |  |  |  |  |  |
| CVR |  |  |  |  |  |
| AOV |  |  |  |  |  |
| 新規率 |  |  |  |  |  |

## 2. 流入チャネル別
| チャネル | セッション | CVR | 売上 | 前月比 |
|---|---|---|---|---|
| オーガニック |  |  |  |  |
| 広告 |  |  |  |  |
| メール |  |  |  |  |
| 直接 |  |  |  |  |
| SNS |  |  |  |  |

## 3. 異常検知
| 指標 | 異常内容 | 通常範囲 | 当月値 | 仮説 |
|---|---|---|---|---|
|  |  |  |  |  |

## 4. Search Console
- 平均掲載順位：
- インプレッション：
- クリック数：
- CTR：
- 上昇キーワードTop5：
- 下降キーワードTop5：
- インデックス未登録URL数：

## 5. ページ別TOP10
| URL | セッション | CVR | 売上 | 平均滞在 |
|---|---|---|---|---|

## 6. 仮説と検証計画
- 仮説A：
- 検証方法：
- 仮説B：
- 検証方法：

## 7. 推奨アクション
| 優先度 | アクション | 想定効果 | 担当 | 期限 |
|---|---|---|---|---|
| 即時 |  |  |  |  |
| 中期 |  |  |  |  |

## 8. KPI定義（参考）
- CVR = 購入セッション数 ÷ 全セッション数
- AOV = 売上 ÷ 注文数
- 新規率 = 新規顧客数 ÷ 全顧客数
````

## 品質ゲート

- [ ] エグゼクティブサマリが3-5行で完結している
- [ ] KPI定義が明示されている（前月との比較条件が同じ）
- [ ] 異常検知が「正常範囲」を併記している
- [ ] 仮説が3つ以下に絞られている
- [ ] アクションが「即時／中期／要検討」で分類
- [ ] 各アクションに担当・期限がある
- [ ] チャネル別データが Direct / Organic / Paid / Email / Social の5分類以上
- [ ] Search Console と GA4 の両方の数値が入っている
- [ ] 抽象論ではなく具体的な施策で書かれている

## エッジケース

- **データ未提供**：GA4 / Search Console のどのレポートから何を取得すべきかをまず提示し、データ収集後に再依頼する旨を明示
- **GA4 イベント未実装**：購入・カート追加の数値が取れないので、`references/ga4-reports-guide.md` のイベント実装ガイドを返す
- **季節要因（セール・新商品リリース）**：通常範囲ではないので異常検知から除外し、別セクションで扱う
- **複数Shopifyストア（Markets）**：通貨を統一（円換算）し、国別の内訳を別表で出す
- **メール／LINE経由の売上が GA4 に乗らない**：Shopify 注文画面の「marketing source」と突合する手順を提示

詳細は `references/examples.md` を参照。

## 注意事項

- GA4 と Shopify 売上は計測タイミング差で 5-15% ずれる。両方の数値を併記し、ずれの理由（タグ未発火・キャンセル後返金など）を補足
- Search Console データは48時間遅れ。直近データは確定値でないと明記
- 個人情報（顧客名・メール）はレポートに含めない
- GA4 のレポート定義は変動する。同じレポート名でも GA4 のバージョン更新で取得方法が変わる
- KPI の計算式を変更した月は前月比較が不正確になるため、変更履歴を残す

## references/ 一覧

- `references/kpi-definitions.md`：主要KPI 定義集
- `references/ga4-reports-guide.md`：GA4 レポート取得ガイド
- `references/search-console-guide.md`：Search Console 活用ガイド
- `references/anomaly-detection.md`：異常検知の閾値
- `references/executive-summary-style.md`：エグゼクティブサマリの書き方
- `references/examples.md`：月次レポート実例集

## 参考公式情報源

- Google アナリティクスヘルプ「GA4 のレポート」「eコマース測定」
- Google Search Console ヘルプ「検索パフォーマンスレポート」
- Shopify 公式ヘルプ「Google Analytics」

最新仕様は Google アナリティクスヘルプ・Search Console ヘルプ・Shopify Help Center で確認すること。
