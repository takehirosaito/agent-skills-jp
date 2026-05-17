# HTMLメール設計（ダークモード・画像オフ対応）

## HTMLメールの基本構造

HTMLメールは Web ページと違い、対応クライアントの違いが大きい。レイアウトは古典的なテーブルレイアウトが安全。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>[件名]</title>
</head>
<body>
  <!-- プリヘッダー（受信トレイに表示されるが本文では非表示） -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    [プリヘッダー70字]
  </div>

  <!-- メインコンテンツ -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600">
          [ヘッダー]
          [1スクロール領域]
          [商品ブロック]
          [フッター]
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## ダークモード対応

iOS・Android・macOS等のダークモード時、メールクライアントは背景・テキストの色を自動反転する場合がある。完全な白／黒を避け、淡色を使うか、ダークモード用のCSSを書く。

### 推奨ベースカラー

| 用途 | ライト | ダーク |
|---|---|---|
| 背景 | #FAFAFA / #FFFFFF | #1A1A1A / #000000 |
| メインテキスト | #1A1A1A / #333333 | #EEEEEE / #FFFFFF |
| サブテキスト | #666666 | #AAAAAA |
| アクセントカラー | ブランドカラー | ブランドカラー（彩度調整） |

### ダークモード対応のCSS

```html
<style>
  @media (prefers-color-scheme: dark) {
    .body { background-color: #1a1a1a !important; }
    .text { color: #eeeeee !important; }
    .border { border-color: #444444 !important; }
  }
</style>
```

ただし、Outlookなど一部のクライアントは@mediaを無視する。インラインスタイルでフォールバックも併用。

### ロゴの透過処理

ライトモード向けのカラーロゴをダークモード背景に置くと潰れる。

対策：
- ロゴをSVG/PNG透過背景に
- ダークモード時の白抜きロゴを別途用意
- 背景色をブランドカラーで固定する

## 画像オフ対応

メールクライアント（特にOutlook）では、画像がデフォルトで読み込まれない場合がある。画像表示OFFでもメッセージが伝わる設計：

### alt属性の徹底

```html
<img src="https://example.com/banner.jpg"
     alt="夏物30%OFFセール 8/1〜8/3"
     width="600"
     height="300"
     style="display:block;width:100%;max-width:600px;" />
```

altテキストは「画像と同等の情報量」を持たせる。

### 画像なしで意味が通る本文

画像にすべて埋め込んだメールは、画像OFFで意味不明になる。

NG：
```html
[セール詳細を画像内に埋め込み]
画像オフ：「夏物セール」しか表示されない
```

OK：
```html
[画像：バナー]＋[テキスト：セール詳細]
画像オフでも：「夏物セール」＋テキスト詳細で意味が通る
```

### bulletproof button（画像なしボタン）

CSS でボタン風の見た目を作る。画像オフでもボタンとして機能：

```html
<table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td bgcolor="#000000" style="border-radius:6px;">
      <a href="https://example.com/sale"
         style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;">
        セールページを見る
      </a>
    </td>
  </tr>
</table>
```

## レスポンシブ対応

スマホ・PCの両方で表示崩れしない設計：

### モバイル幅の調整

```html
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .col { display: block !important; width: 100% !important; }
    .img { width: 100% !important; height: auto !important; }
    .text { font-size: 14px !important; line-height: 1.5 !important; }
  }
</style>
```

### 商品ブロックの折り返し

3列の商品ブロックをモバイルでは1列に：

```html
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td class="col" valign="top" width="33%">
      [商品1]
    </td>
    <td class="col" valign="top" width="33%">
      [商品2]
    </td>
    <td class="col" valign="top" width="33%">
      [商品3]
    </td>
  </tr>
</table>
```

## メールクライアント別の罠

### Outlook（Windows・特に古い版）

- CSS Gridがほぼ無視される
- @media が一部効かない
- 画像表示はデフォルトOFF
- v:roundrect（VMLでボタン作成）が必要な場合あり
- max-width が効かない場合あり

### Apple Mail（iOS / macOS）

- Webメールに近い表現が可能
- ダークモードのテキスト色自動反転が強い
- 文字数自動省略：プリヘッダーの長さに注意

### Gmail（Web・モバイル）

- HTMLのpreflight処理あり（CSS制限）
- 102KB超でメールが省略表示
- 画像表示は基本ON

### Yahoo!メール

- HTML対応良好
- ダークモード対応進む

### スマホ標準メール

- iOS Mail：Apple Mailと同等
- Android Gmail：Gmail Webと同等

## ファイルサイズの目安

- HTML本文：50KB以下（Gmailの省略表示閾値102KBの半分目安）
- 画像合計：300KB以下（モバイル通信考慮）
- 1画像：100KB以下

ファイルサイズが大きいと：
- 読み込みが遅い
- Gmail等で省略表示
- モバイル通信料増加

## 配信前のテスト

### 1. テストツール
- Litmus、Email on Acid 等で主要クライアント・デバイスの表示確認
- 30以上のクライアントでテスト可能

### 2. 自社環境でテスト
- Gmail（Web・モバイル）
- Yahoo!メール
- Outlook（Web・デスクトップ）
- Apple Mail（iOS・macOS）
- スマホ標準メール

### 3. ダークモード・画像オフ確認
- ダークモードでの表示
- 画像オフでの表示

## プレーンテキスト版の同送

HTMLメールの送信時は、必ずプレーンテキスト版も同送する：

- 受信側のメールクライアントがHTMLを表示できない場合のフォールバック
- スパム判定の指標として「HTMLとテキスト両方ある」がポジティブ
- スクリーンリーダー対応

### プレーンテキスト版の作り方

```
件名：【3日間限定】夏物ALL30%OFFスタート

○○様

本日18:30から、夏物すべてが30%OFFになる
セールがスタートしました。

【3日間限定セール】
・期間：8/1（金）18:30〜8/3（日）23:59
・対象：夏物アイテム全品
・割引：自動で30%OFF（クーポンコード不要）

セールページ：
https://example.com/sale

夏の終わりに、新しい一着をぜひ。

○○ オンラインストア
─────────────────
配信解除：https://example.com/unsubscribe
プライバシーポリシー：https://example.com/privacy
─────────────────
```

## アクセシビリティ

- 文字サイズはモバイルで14-16px以上
- 行間1.5以上
- リンク色は背景とコントラスト比4.5:1以上
- 画像にalt属性
- リンクの目的が分かるテキスト（「こちら」ではなく「セールページを見る」）

## チェックリスト

- [ ] DOCTYPE宣言（HTML4/XHTMLいずれか）
- [ ] viewport設定（モバイル対応）
- [ ] ダークモード対応の meta タグ
- [ ] プリヘッダー（display:noneで本文非表示・受信トレイ表示）
- [ ] 600pxメイン幅
- [ ] テーブルレイアウト
- [ ] インラインCSS（Gmailの@media制限対応）
- [ ] 画像にalt属性
- [ ] bulletproof button（画像なしでも見えるCTA）
- [ ] レスポンシブメディアクエリ
- [ ] プレーンテキスト版同送
- [ ] HTMLファイルサイズ50KB以下
- [ ] 画像合計300KB以下
- [ ] 配信解除リンク明示
- [ ] 送信者情報（会社名・所在地・連絡先）明記
- [ ] 主要メールクライアントで表示テスト
- [ ] ダークモード・画像オフでの表示テスト
