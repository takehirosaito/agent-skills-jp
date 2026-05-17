# エンコーディング・文字コード対応

## 主要エンコーディング

| エンコーディング | 用途 | 注意点 |
|---|---|---|
| UTF-8（BOM無し） | 国際標準、Shopify／一般CSV | 最も推奨 |
| UTF-8（BOM付き） | Excel互換が必要な場合 | 楽天RMSの一部でエラー |
| Shift_JIS（CP932） | 楽天RMS（一部）、makeshop、旧システム | 一部の文字が非対応 |
| EUC-JP | Linuxの旧システム | 現代ではほぼ使われない |

## Shift_JISで非対応・化ける文字

| 文字 | 説明 | 推奨代替 |
|---|---|---|
| 〜 | 全角チルダ U+301C | ～ (U+FF5E 全角全角チルダ) |
| − | 全角マイナス U+2212 | － (U+FF0D 全角ハイフン)、または半角- |
| ‖ | 縦並びダブルバー | 削除または \| |
| ¢ £ ¬ | 各種記号 | 削除または全角記号 |
| ‐ | ハイフン U+2010 | - (半角ハイフン) |
| ① ② ③ | 丸数字 | (1)(2)(3) |
| ㈱ | 株式会社略字 | 株式会社 |
| ㊤ ㊥ ㊦ | 丸付き上中下 | (上)(中)(下) |

## BOM（Byte Order Mark）

### UTF-8 BOM
- バイト列：`EF BB BF`
- ファイル先頭に付与される
- Excel でUTF-8 CSVを正しく開くために必要なケースもあるが、システムによってはエラー

### 対応方針
- **楽天RMS**：BOM無しUTF-8またはShift_JIS指定（実装による）→ 公式ヘルプ確認
- **Amazon**：UTF-8 BOM無しが安全
- **Shopify**：UTF-8（BOMどちらでも問題ないことが多い）
- **Yahoo!ショッピング**：仕様による → 公式ヘルプ確認

## 改行コード

| OS | 改行コード | 表記 |
|---|---|---|
| Windows | CRLF | \r\n |
| macOS / Linux | LF | \n |
| 旧Mac（OS9以前） | CR | \r |

### CSV内の改行
商品説明文に改行を含む場合、CSVのフィールド内改行として扱うため、フィールドをダブルクォートで囲む必要がある：

```csv
商品コード,商品名,説明文
ITEM001,商品A,"行1
行2
行3"
```

### 改行コードの混在
1つのCSVファイル内でCRLFとLFが混在すると、読み込み時にずれが発生。エクスポート側で必ず統一する。

## 変換手順

### コマンドライン（macOS / Linux）

```bash
# Shift_JIS → UTF-8（BOM無し）
iconv -f SHIFT_JIS -t UTF-8 input.csv > output.csv

# UTF-8 → Shift_JIS
iconv -f UTF-8 -t SHIFT_JIS//IGNORE input.csv > output_sjis.csv
# //IGNORE で変換できない文字をスキップ、//TRANSLIT で類似文字に置換

# BOM付きUTF-8 → BOM無しUTF-8
LC_ALL=C sed '1s/^\xEF\xBB\xBF//' input.csv > output.csv

# 改行コード CRLF → LF
tr -d '\r' < input.csv > output.csv
# または
sed 's/\r$//' input.csv > output.csv
```

### Python例
```python
import csv

# Shift_JIS で読み込み、UTF-8 で書き出し
with open('input_sjis.csv', 'r', encoding='cp932') as f_in:
    reader = csv.reader(f_in)
    rows = list(reader)

with open('output_utf8.csv', 'w', encoding='utf-8', newline='') as f_out:
    writer = csv.writer(f_out)
    writer.writerows(rows)
```

### Excelの設定
- 「ファイル→名前を付けて保存」で「CSV UTF-8 (コンマ区切り)」を選択 → BOM付きUTF-8
- 「CSV (コンマ区切り)」 → Shift_JIS
- 「テキストファイル (タブ区切り)」 → タブ区切りShift_JIS

Excelの「データ→テキストまたはCSVから」インポート機能で、エンコーディングを明示的に指定できる。

## 文字化けの検出

### 典型的な化け方
- UTF-8をShift_JISで開く：「Ã£â‚¬Â」のようなラテン文字記号化け
- Shift_JISをUTF-8で開く：「��譖��」のような��記号化け
- 化け方のパターンで元のエンコーディングを推測できる

### 検出ツール
- macOS：`file -I filename.csv`（エンコーディング推定）
- Python：`chardet` ライブラリ
- VSCode：右下にエンコーディング表示、変換機能あり

## モール別の推奨エンコーディング（2024〜2025時点・公式情報を要再確認）

| モール | 推奨エンコーディング | 改行コード |
|---|---|---|
| 楽天RMS（商品一括登録） | Shift_JIS（実装によりUTF-8も） | CRLF |
| 楽天SKU CSV | UTF-8（BOM無し）が多い | CRLF |
| Amazonフラットファイル | UTF-8 BOM無し | CRLF |
| Yahoo!ショッピング | UTF-8 | CRLF |
| Shopify | UTF-8 BOM無し | LF |
| ネクストエンジン | UTF-8 BOM無し | CRLF |

**重要**：モール仕様は更新されるため、登録前に各モール公式ヘルプで最新情報を確認すること。

## エンコーディング不一致でよくあるトラブル

1. **Excelで開いた瞬間に化ける**：UTF-8ファイルをExcelがShift_JISだと誤認。「データ→テキストまたはCSVから」でインポート
2. **アップロード後に半角がおかしい**：BOMが残っているか、改行コードが不一致
3. **特定の文字（〜・−等）だけ化ける**：Shift_JIS非対応文字。事前に変換テーブルで置換
4. **Excelで先頭0が落ちる**：Excelがセルを数値型と判断。CSVをテキストで開くか、Excelで列を文字列形式に
5. **API経由でアップロードしたら文字が壊れる**：API側のHTTPヘッダー（Content-Type charset）と実ファイルのエンコーディング不一致
