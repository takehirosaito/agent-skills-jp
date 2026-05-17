# Shopify Marketing Automation / Flow の設定

## Shopify Marketing Automations（標準）

Shopify は管理画面 `Marketing → Automations` でカート放棄／チェックアウト放棄のメールを **無料で標準提供** している。

### 標準テンプレ

| Automation | トリガー |
|---|---|
| Abandoned cart | カート追加後、購入せず離脱 |
| Abandoned checkout | チェックアウト開始後、購入せず離脱 |
| Browse abandonment | 商品ページ閲覧のみ（カート未追加） |
| Welcome new subscribers | 会員登録／メルマガ購読 |
| Customer winback | 一定期間購入のない顧客 |

カート放棄／チェックアウト放棄を中心に設定する。

### 設定手順

1. `Marketing → Automations → Create automation`
2. テンプレートから「Abandoned cart」or「Abandoned checkout」を選択
3. 待機時間（Wait）を設定：標準は10時間後（1メールのみ）
4. メールテンプレートを編集
5. 「Turn on」で有効化

### 3通構成にカスタマイズ

標準は1通のみ。3通にするには：

1. 「Create automation」で1回目用（1時間後）を作成
2. もう1つ作成して24時間後用（Waitを 24h に）
3. 3つ目を72時間後用に作成

または、Shopify Flow（無料アプリ）で複数通を1ワークフローに組む方法もある。

### 配信ON/OFF制御

「購入完了」をトリガーとして残りメールを停止：

```
Trigger: Order created
Condition: 同じ顧客のカート放棄 automation が動作中
Action: その顧客への残りメール送信をスキップ
```

Shopify 標準では「カートが復元されると自動的に残りメールがキャンセル」される。

## Shopify Flow（高度な自動化）

Shopify Flow は **条件分岐・分岐実行・カスタムロジック** を組めるワークフロー：

```
Trigger: Cart abandoned
└── Condition: Cart total > 5000
    ├── True: Send「VIP用テンプレ」（送料無料訴求）
    └── False: Send「通常テンプレ」
```

### よくある分岐

- **新規 vs リピーター**：訴求を変える
- **金額帯**：高額カゴ落ちには送料無料／低額カゴ落ちには軽い割引
- **商品カテゴリ**：化粧品なら成分訴求／アパレルならサイズガイド訴求
- **デバイス**：モバイルなら短文・SMS、PCならメール

## サードパーティアプリ

| アプリ | 強み | 月額（概算） |
|---|---|---|
| Klaviyo | 高度なセグメンテーション・テンプレ豊富 | $20- |
| Omnisend | SMS/LINE統合・テンプレ豊富 | $16- |
| Mailchimp | 汎用メール・Shopify連携 | $13- |
| Shopify Email | 標準・無料（一定通数まで） | $10/月（5,000通超） |

機能差：
- A/Bテスト：Klaviyo / Omnisend / Mailchimp
- 動的セグメント：Klaviyo / Omnisend
- LINE / SMS 統合：Omnisend
- AI コピー生成：Klaviyo / Omnisend

## メール HTML テンプレート

### 基本構造

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>件名</title>
</head>
<body style="margin:0; padding:0; font-family: 'Hiragino Kaku Gothic ProN', sans-serif;">
  <table width="600" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <!-- ヘッダー -->
    <tr><td><img src="LOGO_URL" width="200" alt="ブランド名"></td></tr>
    
    <!-- 本文 -->
    <tr><td>
      <h1>カートに残っている商品があります</h1>
      <p>こんにちは、{{ customer.first_name | default: 'お客様' }}。</p>
      <p>先ほどご覧いただいた商品が、カートに残っています。</p>
      
      <!-- 商品ループ -->
      {{ checkout.line_items.map { |item| ... } }}
      
      <!-- CTA -->
      <a href="{{ url }}?recover=true" style="display:inline-block; padding: 14px 28px; background:#000; color:#fff; text-decoration:none;">お買い物を再開する</a>
      
      <!-- 追伸 -->
      <p>📦 送料無料（5,000円以上）／30日返品OK</p>
    </td></tr>
    
    <!-- フッター -->
    <tr><td>
      <p>このメールは{{ shop.email }}より配信されています。</p>
      <p>{{ shop.address.summary }}</p>
      <p><a href="{{ unsubscribe_url }}">配信停止</a></p>
    </td></tr>
  </table>
</body>
</html>
```

### モバイル最適化

- 横幅 600px 固定（メーラーで標準）
- フォントサイズ最低 14px
- CTA は大きく（最低 44×44pt）
- 画像 alt 必須（Outlook で画像 OFF 時）
- インライン CSS（メーラー間互換性）

## Shopify Email vs Klaviyo の使い分け

| 要件 | Shopify Email | Klaviyo |
|---|---|---|
| 標準カゴ落ちで十分 | ✅ | - |
| 細かいセグメント | △ | ✅ |
| A/Bテスト | △ | ✅ |
| SMS統合 | - | ✅ |
| 予算重視 | ✅ | - |
| 中〜大規模 | - | ✅ |

## 設計時の注意

### 1. 配信頻度の制御

- 同じ顧客に1日複数通送らない
- 別 automation のメールと重複させない（welcome + abandoned cart が同日に複数通など）

### 2. 配信時刻

- 朝7-9時：開封率高い
- 12-13時：昼休み
- 19-22時：夜のスマホ閲覧
- 深夜・早朝は避ける

### 3. ドメイン認証

- SPF / DKIM / DMARC 設定
- Shopify は自動で対応する送信ドメインを使うが、独自ドメインからの送信は別途認証必要

### 4. リスト衛生

- バウンス（配信不能）が続くアドレスを削除
- 配信停止者への配信は **法律違反**（特定電子メール法）

## チェックリスト

- [ ] Marketing Automations が ON
- [ ] 3通構成（1h / 24h / 72h）の Automation 作成
- [ ] 購入完了時の自動停止
- [ ] リカバリーURL 動作確認
- [ ] モバイル表示確認
- [ ] 配信停止リンク動作
- [ ] ドメイン認証（SPF / DKIM / DMARC）
- [ ] 効果計測（開封率・クリック率・回復率）
