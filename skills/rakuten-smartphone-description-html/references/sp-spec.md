# 楽天SP用商品説明文 仕様・禁止タグ詳細

最新仕様は RMS の店舗運営Navi で確認。

## 基本仕様

| 項目 | 仕様 |
|---|---|
| 容量 | 10,240byte（全角約5,120字） |
| 文字コード | Shift_JIS（CP932） |
| 改行 | CR+LF |
| HTML | 制限あり |
| 画像 | 10枚（一部20枚）まで |

## 禁止タグ・属性（重要）

### 完全禁止

| タグ・属性 | 理由 |
|---|---|
| `<div>` | HTMLの基本要素だが楽天SP版では禁止 |
| `<span>` | 装飾用途で禁止される場合あり |
| `<style>` | スタイル定義タグ・属性とも禁止 |
| `style="..."` | 同上 |
| `<script>` | JavaScript完全禁止 |
| `<iframe>` | 外部コンテンツ埋め込み禁止 |
| `<form>` | フォーム送信禁止 |
| `<input>` | 入力要素禁止 |
| 外部CSS | `<link rel="stylesheet">` 禁止 |
| 外部JS | `<script src="...">` 禁止 |

### 制限あり

| タグ | 制限 |
|---|---|
| `<img>` | OK、ただし楽天R-Cabinet推奨 |
| `<a>` | リンクOK、ただし楽天外URLは審査対象 |
| `<table>` | OK |

## 使えるタグ（基本）

| タグ | 用途 |
|---|---|
| `<p>` | 段落 |
| `<br>` | 改行 |
| `<h2>`, `<h3>`, `<h4>` | 見出し |
| `<strong>`, `<b>` | 強調（太字） |
| `<em>`, `<i>` | 強調（斜体） |
| `<ul>`, `<ol>`, `<li>` | リスト |
| `<table>`, `<tr>`, `<td>`, `<th>` | テーブル |
| `<dl>`, `<dt>`, `<dd>` | 定義リスト |
| `<a>` | リンク |
| `<img>` | 画像 |

## なぜ禁止タグがあるのか

楽天はスマホ版商品ページの統一性とパフォーマンスのため：

- レイアウトを破壊しないため
- 不正なスクリプト実行を防ぐため
- 外部サイトへの誘導を制限するため
- 楽天独自のスマホUIとの整合性

## 禁止タグの代替

### div の代替

```html
<!-- NG -->
<div>商品の特徴</div>

<!-- OK -->
<p>商品の特徴</p>

<!-- 構造を作りたい場合 -->
<table>
  <tr><th>項目</th><td>内容</td></tr>
</table>
```

### style 属性の代替

style属性は使えないので、装飾はシンプル化：

```html
<!-- NG -->
<p style="color: red;">重要</p>

<!-- OK -->
<p><strong>重要</strong></p>
```

色をつけたい場合は画像内に組み込む。

### 中央寄せの代替

```html
<!-- NG -->
<div style="text-align: center;">中央</div>
<p style="text-align: center;">中央</p>

<!-- OK -->
<!-- center タグは古い書き方だがHTML4まで対応していた -->
<!-- 楽天SP版で許容されるかは仕様確認 -->
<center>中央</center>
<!-- 安全策：見出しタグを使う -->
<h2>中央寄せの代わりに見出し</h2>
```

### レイアウト分割の代替

```html
<!-- NG: divでレイアウト -->
<div class="left">左</div>
<div class="right">右</div>

<!-- OK: tableで分割 -->
<table>
  <tr>
    <td>左</td>
    <td>右</td>
  </tr>
</table>
```

## 画像の扱い

### 推奨URL
- 楽天R-Cabinet：`https://image.rakuten.co.jp/[ショップURL]/cabinet/...`

### 画像枚数
- SP説明文内に10枚（一部20枚）
- これは商品ページの画像（最大20枚）とは別カウント

### alt属性
- 画像が読み込めない場合のテキスト
- アクセシビリティのため必ず設定

```html
<img src="https://image.rakuten.co.jp/example/cabinet/main.jpg" alt="電気ケトル メインビジュアル">
```

## リンクの扱い

### 内部リンク（楽天内）
- 自店内：OK
- 他店舗：原則NG（モール内競合）
- 楽天R-Login：OK

### 外部リンク
- 楽天外サイト：原則NG（独自審査でNG）
- 自社外サイトへの誘導：NG

## byte数の数え方

```
半角英数：1byte
全角：2byte
HTMLタグ：タグ文字数分（半角扱い）
```

### 例

```html
<p>これは商品の説明です。</p>
```
- `<p>` = 3byte
- `これは商品の説明です。` = 全角11字 = 22byte
- `</p>` = 4byte
- 合計：29byte

### byte数を抑えるコツ

- 装飾的な空白・改行を最小限に
- 画像のalt属性は短く（ただし無くさない）
- 不要なタグを削除
- 重要情報をPC版に逃がす

## CSV登録時の注意

### normal-item.csv の SP用説明文列
- カラム名は仕様確認（`mobile-description` 等）
- 改行コード：CR+LF
- 文字コード：Shift_JIS

### よくあるエラー
- HTMLタグが正しく閉じていない
- 禁止タグが含まれている
- byte数超過
- 文字コード不一致

## アップロード前の検証

| 確認 | 方法 |
|---|---|
| byte数 | テキストエディタの保存時byte数、または Python `len(s.encode('shift_jis'))` |
| 禁止タグ | 文字列検索で `div`、`style`、`script`等を検出 |
| HTMLの整合 | ブラウザで表示確認 |
| 文字化け | Shift_JISで保存後、楽天プレビューで確認 |

## Python での検証例

```python
forbidden_tags = ['<div', '<style', '<script', '<iframe', '<form', '<input']
forbidden_attrs = ['style=', 'class=']  # class はOKだが装飾目的が多い

with open('sp_description.html', 'r', encoding='shift_jis') as f:
    content = f.read()

# byte数チェック
byte_count = len(content.encode('shift_jis'))
if byte_count > 10240:
    print(f"NG: byte数超過 {byte_count}/10240")

# 禁止タグチェック
for tag in forbidden_tags:
    if tag in content.lower():
        print(f"NG: 禁止タグ {tag} が含まれている")
```

## SP版とPC版の同期

- SP版とPC版は **完全に別のHTML**
- PC版で許可されるdiv等はSP版で書き直し
- 内容（情報）は同じだが、HTMLは別物

## 改定動向

楽天は定期的に仕様改定を行う：

- 過去には禁止タグの追加・解除
- 画像枚数の変更
- 文字数の変更

→ 最新は RMS の店舗運営Navi で確認。

## チェックリスト

SP版作成後：

- [ ] 10,240byte以内
- [ ] 禁止タグなし（div、style、script、iframe、form、input、外部CSS/JS）
- [ ] Shift_JIS でエンコード可能
- [ ] 画像10枚以内
- [ ] 画像URLが楽天R-Cabinet等
- [ ] スマホ実機で表示確認
- [ ] HTML整合（タグの閉じ忘れなし）
- [ ] 文字化けなし
