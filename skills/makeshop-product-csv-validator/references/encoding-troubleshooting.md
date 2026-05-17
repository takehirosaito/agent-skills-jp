# 文字コード・改行コード・BOM の判定と修正

MakeShop の商品CSVで「アップロード成功なのに表示が文字化け」「列がずれる」「特定の文字だけ消える」というトラブルの多くは、**文字コード・改行コード・BOM** に起因する。

仕様は変更されるため、最終的には MakeShop 管理画面のCSV インポート画面で指定値の最新を確認すること。

## 文字コードの種類

EC運用で出会う代表的な文字コード：

| 文字コード | 別名 | 特徴 |
|---|---|---|
| Shift_JIS | CP932, SJIS-WIN | Windows標準。① 「①」「㈱」など機種依存文字を含む |
| UTF-8 BOMなし | UTF-8 | 国際標準。ほとんどの環境で扱える |
| UTF-8 BOMあり | UTF-8 SIG | BOM（先頭3バイト）あり。Excel での扱いやすさのため使われる |
| EUC-JP | | レガシー。現代のECではほぼ使わない |
| UTF-16 | | Windows 内部表現。CSV運用では使わない |

MakeShop は時期・プランにより Shift_JIS（CP932）／UTF-8（BOMあり／なし）のいずれかを指定。最新は管理画面のCSVガイドで確認。

## 改行コードの種類

| 改行コード | 別名 | OS |
|---|---|---|
| CR+LF | `\r\n` | Windows |
| LF | `\n` | Unix/Linux/macOS |
| CR | `\r` | 旧Mac（現代では使わない） |

MakeShop は **CR+LF** を要求することが多いが、最終的には公式ガイドを確認。

## BOM（バイトオーダーマーク）

UTF-8 の先頭3バイト `EF BB BF`。Excel が UTF-8 CSVを開く際に文字化けしないようにする目印。

- 「BOMあり」を要求する場合と「BOMなし」を要求する場合があり、混在不可
- BOMが「不要なのに付いている」と、ヘッダ行の最初の列名が認識されないケースあり
- BOMが「必要なのに付いていない」と、Excelで開いた時点で文字化け

## 判定の方法

### ターミナルでの判定（macOS/Linux）

```sh
file -I products.csv
# 例：products.csv: text/csv; charset=utf-8
```

```sh
hexdump -C products.csv | head -1
# 先頭が「ef bb bf」なら UTF-8 BOM あり
```

### Windows メモ帳での判定

- メモ帳で開き「名前を付けて保存」→ ダイアログ右下の「文字コード」表示で確認

### VS Code での判定

- ウィンドウ下部のステータスバーに文字コード・改行コードが表示される
- クリックで変換可能

## よくある事故パターン

### パターン1：Excel で開いて保存したら Shift_JIS に変わった

Excel（Windows版）は CSV を開く際に文字コードを推測する。UTF-8 BOMなしのCSVを開くと、Shift_JIS と誤判定して保存時にShift_JIS化することがある。

**対策**：

- CSV は Excel ではなく **VS Code / 秀丸 / メモ帳++** で編集
- どうしてもExcelで開く場合は「データ → テキスト/CSV のインポート」で文字コード明示

### パターン2：BOM が原因でヘッダ最初の列名が認識されない

UTF-8 BOMなしを要求しているのに、Excel で保存したCSVが UTF-8 BOM付きになり、先頭の `goods_id` の前に `EF BB BF` が付く。MakeShop のパーサが列名を `goods_id` ではなく `?goods_id`（BOM付き）と認識し、列マッピング失敗。

**対策**：

- VS Code で開き、右下の「UTF-8 with BOM」を「UTF-8」に変換
- コマンドラインで BOM 除去：
  ```sh
  sed -i '1s/^\xEF\xBB\xBF//' products.csv
  ```

### パターン3：改行コード混在

複数の人が異なるOSで編集すると、ファイル内に `CR+LF` と `LF` が混在することがある。MakeShop のパーサが想定外の改行で行を切ってしまう。

**対策**：

- VS Code 右下の「LF」「CRLF」表示をクリックして統一
- コマンドラインで統一：
  ```sh
  # CRLF に統一
  awk 'sub("$", "\r")' input.csv > output.csv
  ```

### パターン4：機種依存文字が Shift_JIS でしか表現できない

「①」「㈱」「㊤」などの機種依存文字は Shift_JIS では表現できても、UTF-8 とのやりとりで化けることがある。

**対策**：

- Shift_JIS と UTF-8 の変換は機種依存文字を別の文字に置換するか、削除する
- 商品名に「①」「㈱」を使うのは避け、「(1)」「株式会社」に置換する運用が無難

### パターン5：JANコードの先頭0が落ちる

Excel が「0490123456789」を数値と判定して「490123456789」に変換し、12桁になる。CSVとしては正しいが、登録後にJAN照合で失敗。

**対策**：

- Excel で開く際に列の書式を「文字列」に
- VS Code / テキストエディタで編集
- CSV 内では `="0490123456789"` のような書式で文字列強制も可（ただし MakeShop 側で `="..."` を受けるかは要確認）

## 修正フロー

### Step 1：現状判定

```sh
file -I products.csv
hexdump -C products.csv | head -1
```

### Step 2：MakeShop の要求仕様を確認

管理画面のCSVインポート画面の説明を読む。

### Step 3：必要な変換

| 現状 → 要求 | 変換コマンド例 |
|---|---|
| UTF-8 BOM → UTF-8 | `sed -i '1s/^\xEF\xBB\xBF//' file.csv` |
| UTF-8 → UTF-8 BOM | `printf '\xEF\xBB\xBF' > out.csv && cat in.csv >> out.csv` |
| UTF-8 → Shift_JIS | `iconv -f UTF-8 -t CP932 in.csv -o out.csv` |
| Shift_JIS → UTF-8 | `iconv -f CP932 -t UTF-8 in.csv -o out.csv` |
| LF → CR+LF | `awk 'sub("$", "\r")' in.csv > out.csv` |
| CR+LF → LF | `tr -d '\r' < in.csv > out.csv` |

### Step 4：変換後の確認

```sh
file -I out.csv
hexdump -C out.csv | head -1
```

### Step 5：テストアップロード

少数行（10件程度）でテストアップロードし、表示と差込を確認してから全件アップロード。

## 推奨運用

- **CSV を扱う標準エディタは VS Code に統一**
- 文字コード・改行コードを常時表示で確認
- Excel は最終確認用のみ（編集には使わない）
- 文字コード変換が必要な場合は **iconv** などのコマンドラインツールを使う（GUIアプリは挙動が不透明）
- バックアップを世代管理（Git or 日付付与）
