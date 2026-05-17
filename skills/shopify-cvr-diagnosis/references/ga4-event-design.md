# GA4 イベント設計（eコマース計測）

Shopify を GA4 と連携してファネル分析を行うための実装ガイド。

## 必須イベント（GA4 標準 eコマース）

| イベント | 発火タイミング |
|---|---|
| `view_item_list` | コレクションページ・検索結果の表示 |
| `select_item` | 商品リストの商品クリック |
| `view_item` | 商品ページの表示 |
| `add_to_cart` | カート追加 |
| `view_cart` | カート画面表示 |
| `remove_from_cart` | カートから削除 |
| `begin_checkout` | チェックアウト開始 |
| `add_shipping_info` | 配送情報入力完了 |
| `add_payment_info` | 決済情報入力完了 |
| `purchase` | 購入完了 |

## Shopify と GA4 の連携

### 方法A：Google & YouTube アプリ（Shopify 公式）

- インストールして測定ID（`G-XXXXXXX`）を入力
- 基本的なイベント（view_item / add_to_cart / purchase）は自動送信
- カスタムイベント追加は限定的

### 方法B：theme.liquid に gtag.js を直接埋込

- 完全な制御
- 全イベントを Liquid から発火
- 重複送信に注意（公式アプリと併用時）

### 方法C：GTM（Google Tag Manager）経由

- 高度なトリガー設定
- データレイヤーで複数ツール連携
- 設定は複雑

## イベント実装例（Liquid）

### view_item（商品ページ）

```liquid
<script>
  gtag('event', 'view_item', {
    currency: 'JPY',
    value: {{ product.price | divided_by: 100.0 }},
    items: [{
      item_id: {{ product.id | json }},
      item_name: {{ product.title | json }},
      item_brand: {{ product.vendor | json }},
      item_category: {{ product.type | json }},
      price: {{ product.price | divided_by: 100.0 }},
      quantity: 1
    }]
  });
</script>
```

### add_to_cart（カート追加時）

カート追加は AJAX が一般的。`fetch('/cart/add.js', ...)` の成功時に gtag を発火：

```js
fetch('/cart/add.js', { method: 'POST', body: formData })
  .then(r => r.json())
  .then(item => {
    gtag('event', 'add_to_cart', {
      currency: 'JPY',
      value: item.price / 100 * item.quantity,
      items: [{
        item_id: item.product_id,
        item_name: item.product_title,
        item_variant: item.variant_title,
        price: item.price / 100,
        quantity: item.quantity
      }]
    });
  });
```

### purchase（注文完了）

Shopify の Thank you ページ（`templates/checkout/thank_you.liquid` 相当）または **Additional Scripts**（Settings → Checkout → Order processing → Additional scripts）に：

```html
<script>
  gtag('event', 'purchase', {
    transaction_id: '{{ order.order_number }}',
    value: {{ order.total_price | divided_by: 100.0 }},
    tax: {{ order.tax_price | divided_by: 100.0 }},
    shipping: {{ order.shipping_price | divided_by: 100.0 }},
    currency: '{{ order.currency }}',
    items: [
      {% for line_item in order.line_items %}
      {
        item_id: '{{ line_item.product_id }}',
        item_name: '{{ line_item.title | escape }}',
        item_brand: '{{ line_item.vendor | escape }}',
        price: {{ line_item.price | divided_by: 100.0 }},
        quantity: {{ line_item.quantity }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ]
  });
</script>
```

**注意**：Shopify Standard プランは Order Status Page で gtag を埋め込むのが標準的。Checkout Page には Plus でないと埋め込めない。

## ファネル分析（GA4 探索）

### 設定

1. GA4 → Explore → Funnel exploration
2. ステップを定義：
   - Step 1：view_item
   - Step 2：add_to_cart
   - Step 3：begin_checkout
   - Step 4：purchase
3. セグメント：デバイス（mobile / desktop）、チャネル

### 取得できる指標

- 各ステップ到達率
- 段階間のドロップ率
- セグメント別の差分

## カスタムイベント（推奨）

| イベント名 | 発火条件 | 目的 |
|---|---|---|
| `scroll_90` | スクロール深度90% | 商品ページ読了率 |
| `video_play` | 動画再生 | エンゲージメント |
| `review_view` | レビュー閲覧 | 信頼形成の効果 |
| `size_guide_open` | サイズガイド閲覧 | 摩擦点の把握 |
| `coupon_apply` | クーポン適用 | クーポン効果 |
| `wishlist_add` | ウィッシュリスト追加 | 検討度合い |

## GA4 設定で見直すべき項目

### コンバージョン設定

- `purchase` を主要コンバージョンに
- 必要なら `begin_checkout` `add_to_cart` も副次コンバージョン

### データ保持期間

- 標準：2ヶ月（イベントデータ）
- 推奨：14ヶ月に変更（年次比較のため）

### Google Signals

- ON にするとユーザー属性（年齢／性別／興味）が取れる
- 一定のサンプル数が必要

### IPアドレス匿名化

- GA4 はデフォルト匿名化（GDPR対応）

## 検証方法

### 1. リアルタイム

GA4 → Reports → Realtime で、イベントが発火しているか確認。

### 2. DebugView

- Chrome 拡張「Google Analytics Debugger」を有効化
- GA4 → DebugView でリアルタイムのイベント詳細を確認

### 3. Tag Assistant

GTM 経由の場合、Google Tag Assistant でタグの発火を確認。

## チェックリスト

- [ ] 全 eコマースイベント（view_item / add_to_cart / purchase 等）が発火
- [ ] `currency: 'JPY'` を全イベントで指定
- [ ] `value` が小数点形式（円は整数、cents → 円の変換確認）
- [ ] purchase イベントが Order Status Page で発火（重複なし）
- [ ] GA4 Realtime で動作確認
- [ ] Funnel exploration でファネル可視化
- [ ] デバイス別／チャネル別セグメントで分析

## トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| purchase が重複 | 公式アプリ + 手動実装の二重 | どちらかに統一 |
| 売上が GA4 と Shopify Analytics で違う | 通貨単位／税込・税別の差／タイムゾーン | `value` に税抜きを送る等、定義を統一 |
| カート追加が記録されない | AJAX 後の gtag 呼び出しが無い | fetch の then で発火 |
| デバイス情報が取れない | User-Agent Client Hints の設定 | gtag config で適切に |
