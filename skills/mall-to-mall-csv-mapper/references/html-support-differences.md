# モール別 HTML対応と禁止タグ

各モールの説明文HTMLの対応差。HTML可とされていても、**禁止タグ／非推奨タグは別途規定**されており、違反すると表示崩れ・モール側の自動除去・最悪はアカウント停止になる。

## 楽天市場

### PC用商品説明文（10,240byte）
- HTML対応 ✅
- 使用可：`<p>` `<br>` `<table>` `<tr>` `<td>` `<img>` `<a>` `<font>` `<b>` `<strong>` `<i>` `<em>` `<u>` `<ul>` `<ol>` `<li>` `<h1>`-`<h6>` 等
- 注意：楽天ガイドラインで「過度な装飾」「他店誘導」「外部リンク」は規約違反

### スマートフォン用商品説明文
- HTML対応だが**PCより禁止タグが多い**
- 禁止：`<div>` `<script>` `<iframe>` `<form>` `<input>` `<style>` `<link>` `<meta>` `<object>` `<embed>`
- 外部CSS／外部JSの参照禁止
- インラインstyle属性も制限される場合あり

### 共通の禁止行為（楽天）
- 他モール（Amazon等）へのリンク
- 自社ECサイトへの誘導
- 外部のメール送信フォーム
- 楽天規約違反のクーポン誘導

## Amazon.co.jp

### product_description（2,000字）
- HTML **不可** ❌
- プレーンテキスト＋改行のみ
- 一部の単純な改行・段落のみ反映される（仕様変動あり）
- `<br>` `<p>` が動作する版もあるが**前提にしない**

### bullet_point1-5（各255byte）
- HTML **不可**
- プレーンテキスト
- 装飾なし、改行は基本なし

### A+コンテンツ（旧EBC）
- HTMLではなく**専用モジュール17種を組み合わせる**
- A+モジュールは別スキル `amazon-a-plus-content-brief` を参照
- フラットファイル経由では設定できず、ブランド登録＋A+管理画面で個別設定

### 禁止表現（Amazon）
- 絵文字・装飾記号の過剰使用
- 「最安」「No.1」等の誇大表現
- 価格・送料の言及（説明文内）
- 連絡先・URL（説明文内）

## Yahoo!ショッピング

### caption（全角5,000字）
- HTML対応 ✅
- 使用可：`<p>` `<br>` `<table>` `<img>` `<a>` `<font>` `<b>` `<u>` `<ul>` `<li>` `<h1>`-`<h6>` 等
- 禁止：`<script>` `<iframe>` `<form>` `<input>` `<style>` `<link>` `<object>` `<embed>`
- 外部CSS／外部JSの参照禁止

### explanation（全角3,000字）
- 同上

### abstract（全角160字）
- プレーンテキスト推奨
- 検索結果一覧に表示される短文

### 禁止行為（Yahoo!）
- 他モールへのリンク
- ストア外決済の誘導

## Shopify

### Body (HTML)
- HTML **自由** ✅
- ほぼ全HTMLタグ使用可（テーマ側のサニタイズに依存）
- `<script>` は管理画面側で除去されることが多い
- 外部CSS／外部JSは可（テーマ次第）

### SEO description / Page title
- プレーンテキスト
- メタタグとして出力される

### 注意（Shopify）
- HTMLが自由なぶん、コピペ時に余計なインラインスタイルが入り込み崩れる
- レスポンシブ対応をテーマに任せるなら、レイアウト固定タグ（`<table>` `width=` 等）を避ける

## 変換ルールまとめ

### 楽天 → Amazon

```
楽天 PC説明文（HTML 10,240byte）
↓ HTMLタグ全除去
↓ 2,000字に短縮
↓ 重要ポイント5本を bullet_point1-5 へ分配
Amazon product_description（プレーンテキスト 2,000字）
Amazon bullet_point1-5
```

### 楽天 → Yahoo!

```
楽天 PC説明文（HTML 10,240byte）
↓ Yahoo!禁止タグを除去（div/script/iframe/form/input/style）
↓ 全角5,000字に収まるよう短縮
Yahoo! caption（HTML 5,000字）
```

### 楽天 → Shopify

```
楽天 PC説明文（SJIS, HTML）
↓ UTF-8変換
↓ HTMLそのまま（または整形）
Shopify Body (HTML)（UTF-8, HTML）
```

### Shopify → Amazon

```
Shopify Body (HTML)
↓ HTML除去
↓ `<ul><li>` 部分を bullet_point1-5 へ分配
↓ 残りを product_description（2,000字以内）へ
Amazon product_description + bullet_point1-5
```

### Shopify → 楽天

```
Shopify Body (HTML, UTF-8)
↓ SJIS変換（機種依存文字置換が必要）
↓ 楽天SP用の禁止タグ（div/script/iframe/form/input/style）除去
↓ 10,240byteに収まる範囲で整形
楽天 PC説明文／SP説明文
```

## 禁止タグ早見表

| タグ | 楽天PC | 楽天SP | Amazon | Yahoo! | Shopify |
|---|---|---|---|---|---|
| `<script>` | ❌ | ❌ | ❌ | ❌ | ❌（サニタイズ） |
| `<iframe>` | ❌ | ❌ | ❌ | ❌ | △（テーマ次第） |
| `<form>` | ❌ | ❌ | ❌ | ❌ | △ |
| `<input>` | ❌ | ❌ | ❌ | ❌ | △ |
| `<style>` | △ | ❌ | ❌ | ❌ | △ |
| `<div>` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `<table>` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `<img>` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `<a>` | ✅（自店内） | ✅（自店内） | ❌ | ✅（自店内） | ✅ |
| `<font>` | ✅ | ✅ | ❌ | ✅ | ✅ |
| 絵文字 | △（SJIS外は不可） | △ | △（誇大NG） | △ | ✅ |

## 共通の安全策

- **モール展開を前提とする商品はShopifyで自由にHTMLを書かない**。最も制約の厳しいモール（Amazon）に合わせて構成し、他モールで装飾を追加する設計が運用上は楽
- **画像は説明文に貼り付けるのではなくモールの画像列に登録**（外部画像参照はモール毎に異なる）
- **外部リンクは原則使わない**。モール側でNG判定される場合あり
