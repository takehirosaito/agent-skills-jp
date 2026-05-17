# リカバリーURL の Liquid 実装

カゴ落ちメールの最重要要素は **1クリックでカートを復元できるリンク**。

## Shopify 標準テンプレ

Shopify Marketing Automations のメールテンプレでは：

```liquid
<a href="{{ url }}?recover=true">お買い物を再開する</a>
```

`{{ url }}` は自動で「カート復元URL」が入る。

### `?recover=true` の役割

- カートのトークンを使って **元のカート（同じ商品・数量）を復元**
- 顧客がログインしていなくても、リンク経由で復元される
- 24時間〜数日有効（Shopify の内部仕様）

## チェックアウト放棄 vs カート放棄

| 種類 | トリガー | リカバリーURL |
|---|---|---|
| Cart abandoned | カート追加後、チェックアウト未開始 | `{{ url }}` |
| Checkout abandoned | チェックアウト開始後、購入未完了 | `{{ checkout.recovery_url }}` |

チェックアウト放棄のリカバリーは、**入力済みの配送先・支払い情報まで復元**できる（途中まで進んだ顧客向け）。

## Liquid テンプレでの動的内容

カート内商品をループ表示：

```liquid
<table>
  {%- for line in checkout.line_items -%}
    <tr>
      <td>
        <img src="{{ line.variant.image | img_url: '200x' }}" alt="{{ line.product.title }}">
      </td>
      <td>
        <h3>{{ line.product.title }}</h3>
        <p>{{ line.variant.title }}</p>
        <p>数量：{{ line.quantity }}</p>
        <p>{{ line.line_price | money }}</p>
      </td>
    </tr>
  {%- endfor -%}
</table>

<p>小計：{{ checkout.subtotal_price | money }}</p>

<a href="{{ url }}?recover=true">お買い物を再開する</a>
```

## 顧客名

```liquid
{%- if customer.first_name != blank -%}
  {{ customer.first_name }} さん
{%- else -%}
  お客様
{%- endif -%}
```

ログイン顧客は名前で呼び、ゲストは「お客様」で。

## 配信停止リンク

```liquid
<a href="{{ unsubscribe_url }}">配信停止</a>
```

Shopify 標準で自動生成される。

## ストア情報

```liquid
{{ shop.name }}
{{ shop.address.summary }}
{{ shop.email }}
{{ shop.phone }}
```

## Klaviyo の場合

Klaviyo のリキッドは Shopify 標準と少し異なる：

```html
<a href="{{ event.checkout_url }}">お買い物を再開する</a>

<!-- カート内アイテム -->
{% for item in event.extra.line_items %}
  <p>{{ item.product.title }} - {{ item.quantity }}個 - {{ item.line_price|money }}</p>
{% endfor %}
```

詳細は Klaviyo の Variable Catalog 参照。

## Omnisend の場合

Omnisend のメールビルダーで、変数挿入：

```
{{shopify.abandoned_checkout.checkout_url}}
{{shopify.abandoned_checkout.line_items}}
```

## Mailchimp の場合

Mailchimp の Shopify integration では：

```
*|MC:STORE_PRODUCTS|*
*|MC:STORE_RECOVERY_URL|*
```

## リカバリーURL の有効期限

| 配信ツール | リカバリー有効期限 |
|---|---|
| Shopify標準 | 通常 数日〜1週間 |
| Klaviyo | カスタマイズ可（標準は7日） |
| Omnisend | 7日 |

→ **3通目のメールは72時間以内に**送る（有効期限切れ防止）。

## URL の独自ドメイン

Shopify の **チェックアウト URL** は通常 `checkout.shopify.com` を経由する。Shopify Plus の Custom Domain 設定で `checkout.example.com` のような独自ドメインも可能。

独自ドメインだと：
- 顧客に安心感
- ブランド認知
- メールでクリック率が向上する場合あり

## A/Bテスト：URL末尾のUTMタグ

```liquid
<a href="{{ url }}?recover=true&utm_source=email&utm_medium=automation&utm_campaign=abandoned_cart_1h">
  お買い物を再開する
</a>
```

GA4 でカゴ落ちメール経由の流入・売上を識別可能。

通数別、件名A/B別にUTMを変える：

| 配信 | UTM |
|---|---|
| 1通目 | `utm_campaign=abandoned_cart_1h` |
| 2通目 | `utm_campaign=abandoned_cart_24h` |
| 3通目（割引なし） | `utm_campaign=abandoned_cart_72h_a` |
| 3通目（割引あり） | `utm_campaign=abandoned_cart_72h_b` |

## デプリケート（無効化）

カート放棄から **購入完了** したら、残りメールは自動で配信停止：

```
Trigger: Order created with checkout from abandoned automation
Action: Cancel remaining emails in this automation
```

Shopify 標準ではこれが自動で動く。サードパーティアプリでも同様の機能を確認。

## チェックリスト

- [ ] `{{ url }}?recover=true` でカート復元動作
- [ ] チェックアウト放棄の場合は `{{ checkout.recovery_url }}`
- [ ] 顧客名の動的表示（ログイン時）
- [ ] 商品ループ表示
- [ ] 配信停止リンク
- [ ] ストア情報（特商法対応）
- [ ] UTM タグで効果計測
- [ ] 購入完了時の自動停止確認
- [ ] テスト送信して動作確認
