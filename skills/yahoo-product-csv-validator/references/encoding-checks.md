# 文字コード・改行コード・文字数カウントの実務ノート

## 1. なぜ Shift_JIS（CP932）必須か

Yahoo!ショッピングのストアクリエイターProは、商品データCSVの取り込みに **Shift_JIS（CP932）** を前提としている。UTF-8で保存したCSVをアップロードすると：

- ヘッダー行が認識されず「列名エラー」
- 日本語が文字化け
- BOM付きUTF-8の場合、最初の列名が破損（`?code` のように）

## 2. 文字コードの確認方法

### macOS
```bash
file -I product.csv
# Shift_JISの場合: text/plain; charset=unknown-8bit
# UTF-8 BOMの場合: text/plain; charset=utf-8 (先頭バイトに EF BB BF)
nkf -g product.csv
# 表示例: Shift_JIS / UTF-8 / UTF-8 (BOM) / ASCII
```

### Windows
- 「メモ帳」で開き、右下のステータスバーに表示
- 「PowerShell」で `Get-Content -Encoding Byte -TotalCount 3 product.csv` → `239 187 191` なら UTF-8 BOM

### VSCode
- 右下のステータスバーに「UTF-8」「Shift_JIS」等が表示
- クリックして「Save with Encoding」→「Shift JIS」

## 3. 改行コードの確認方法

### コマンド
```bash
file product.csv
# CRLF line terminators / LF line terminators
od -c product.csv | head -1
# \r\n  ならCR+LF、\n のみならLF
```

### VSCode
- 右下に「CRLF」または「LF」表示

## 4. Shift_JIS で再保存する手順

### Excel（Win/Mac共通）
1. ファイル → 「名前を付けて保存」
2. ファイルの種類：「CSV（カンマ区切り）」または「CSV UTF-8」**ではない方**を選ぶ
3. Mac の場合：「Windows形式の改行」を選ぶ

### VSCode
1. 右下「UTF-8」をクリック → 「Save with Encoding」
2. 「Japanese (Shift JIS)」を選択
3. 右下「LF」をクリック → 「CRLF」に変更
4. 上書き保存

### PowerShell（Windows）
```powershell
(Get-Content product.csv) | Set-Content -Encoding Default product_sjis.csv
```

### iconv（macOS/Linux）
```bash
iconv -f UTF-8 -t CP932 product.csv > product_sjis.csv
# 改行変換
sed -i '' 's/$/\r/' product_sjis.csv  # LF→CRLF
```

## 5. 文字数カウントの落とし穴

### 全角／半角の判定
- 半角英数記号：1文字＝1byte（カウント1）
- 全角ひらがな・カタカナ・漢字・全角記号：1文字＝2byte（カウント1文字＝2byte）
- 半角カタカナ：Shift_JISでは1byte扱いだが、視認性が悪く避ける

### 上限の表現
| 項目 | 文字数 | byte換算 |
|---|---|---|
| name | 全角75文字 | 150byte |
| headline | 全角60文字 | 120byte |
| abstract | 全角160文字 | 320byte |
| caption | 全角5,000文字 | 10,000byte |
| explanation | 全角3,000文字 | 6,000byte |

### 改行・空白
- name 等の単行項目に改行を含めない
- 全角スペースは1文字（2byte）としてカウント

## 6. CSVを安全に開く・編集する

### Excelの落とし穴
- JAN列が「4.9012E+12」表示 → 列型を「文字列」に変更してから再読み込み
- 先頭0が消える（例：`0123456` → `123456`）→ 同上
- 「保護されたビュー」で改行コードが書き換わる場合あり

### 推奨ツール
- **VSCode**：文字コード／改行を明示的に扱える
- **CotEditor**（Mac）：Shift_JIS で保存可能、改行コード切替可
- **サクラエディタ**（Windows）：Shift_JIS／CR+LF 編集向き
- **Excel**：最終確認用としては可だが、保存時は形式注意

## 7. 機種依存・絵文字

Shift_JIS で表現できない／変換時に化けるもの：

- 絵文字（U+1F600 等）
- ① ② ③（丸数字）：Shift_JISでは表現可だが、機種依存扱い
- ㈱（一文字の括弧株）：機種依存
- ⅠⅡⅢ（ローマ数字）：機種依存
- ✓ ✔（チェックマーク）：化けるリスク

→ `(1)`、`(株)`、`I` 等の半角代替に置換するのが安全。
