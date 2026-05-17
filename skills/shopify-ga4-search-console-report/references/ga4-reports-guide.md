# GA4 レポート活用ガイド

GA4 で月次レポートに必要な情報を取得する方法。

## 主要レポート

### Reports → Realtime

- 今この瞬間の流入・コンバージョン
- 施策実装後の動作確認用
- レポート作成では使わない

### Reports → Acquisition → Traffic acquisition

| 列 | 内容 |
|---|---|
| Session default channel group | Organic Search / Paid Search / Direct / Social / Email / Referral / Other |
| Users | ユーザー数 |
| Sessions | セッション数 |
| Engagement rate | エンゲージメント率 |
| Average engagement time | 平均エンゲージメント時間 |
| Conversions | コンバージョン数 |
| Total revenue | 売上 |

→ **チャネル別の売上・CVR・トラフィック** が一覧で取れる。

### Reports → Engagement → Pages and screens

| 列 | 内容 |
|---|---|
| Page path | URL パス |
| Views | ページビュー |
| Users | ユーザー数 |
| Views per user | ユーザーあたりPV |
| Average engagement time | 平均滞在時間 |
| Event count | イベント発火数 |
| Conversions | コンバージョン |

→ **ページ別パフォーマンス**。商品ページ／コレクション／ブログを別タブで集計。

### Reports → Monetization → Ecommerce purchases

| 列 | 内容 |
|---|---|
| Item name | 商品名 |
| Items viewed | 商品閲覧数 |
| Items added to cart | カート追加数 |
| Items purchased | 購入数 |
| Item revenue | 商品別売上 |
| Item-view to purchase rate | 閲覧→購入率 |

→ **商品別売上ランキング**。

### Reports → Monetization → Purchase journey

5段階のファネル：
1. Session start
2. View product
3. Add to cart
4. Begin checkout
5. Purchase

各段階の通過率を可視化。

## Explore（探索）

### Funnel exploration

- カスタムファネルを定義
- セグメント（デバイス／チャネル／新規 vs リピーター）別
- 各ステップでドロップ詳細

### Path exploration

- ユーザーがページ→ページをどう移動するか
- 商品ページから次にどこへ行くか

### Cohort exploration

- 取得日別のリピート率
- LTVの時系列

### Segment overlap

- 「モバイル ユーザー」と「メール購読者」の重なり

## カスタムレポート（推奨）

### 1. 売上ファネル詳細

ステップ：view_item → add_to_cart → begin_checkout → purchase

セグメント：デバイス／チャネル／新規 vs リピーター

### 2. 商品別パフォーマンス

ディメンション：item_name, item_brand, item_category
メトリック：items_viewed, items_added_to_cart, items_purchased, item_revenue, view-to-purchase rate

### 3. ランディングページ別

ディメンション：landing_page
メトリック：sessions, engagement_rate, conversions, revenue

→ どの記事／コレクションが入口になっているか

## カスタムイベント（前提）

GA4 標準のイベントだけでは不足。`shopify-cvr-diagnosis` で定義した GA4 イベント設計を実装した前提で、以下も取得可能：

- `scroll_90`：90% スクロール率
- `review_view`：レビュー閲覧率
- `size_guide_open`：サイズガイド開封率

## データ エクスポート

### CSV ダウンロード

各レポートの右上「Share this report」→「Download file」→「CSV」

### BigQuery エクスポート

GA4 → 管理 → BigQuery リンク（無料枠あり）。生データを SQL で集計可能。

### Looker Studio（旧 Data Studio）

GA4 をデータソースとしてダッシュボード化。月次レポートを自動更新。

## よくある落とし穴

### 1. データの遅延

- GA4 の即時データは未確定
- レポート確定は **24-48時間後**
- 月次レポートは月初2-3日後に作成

### 2. ボット・内部アクセス

- IP 除外フィルタを設定
- スタッフの自社アクセスを除外

### 3. データサンプリング

- 大量データはサンプリングされる
- BigQuery 経由なら全データ取得可

### 4. クロスドメイン

- shop.example.com と checkout.shopify.com で別測定 ID なら計測切断
- Shopify Plus の Custom Domain 設定または同一 GA4 プロパティ＋クロスドメイン設定

### 5. eコマースイベントの未実装

- view_item / add_to_cart / purchase が実装されていないと売上分析不可
- まず `shopify-cvr-diagnosis` の GA4 イベント設計を実装

## 異常検知

GA4 の「インサイト」機能：
- AI が異常を自動検出
- 「○○ページのコンバージョンが20%増加」等を通知

月次レポート前に確認することで重要トピックを抽出。

## チェックリスト

- [ ] eコマースイベント（view_item / add_to_cart / purchase）が実装済み
- [ ] IP除外フィルタ設定
- [ ] データ保持期間 14ヶ月
- [ ] BigQuery エクスポート（任意）
- [ ] Looker Studio ダッシュボード（任意）
- [ ] チャネル別／デバイス別／新規 vs リピーターのセグメント
- [ ] Funnel exploration カスタムレポート
- [ ] 商品別売上ランキング
- [ ] ランディングページ別流入
