# 文字コード・改行コード・BOMの判別

## モール別の推奨エンコード（2025-2026時点の運用）

公式仕様は変更されるため、登録前に各モール公式ヘルプで最新を確認すること。実務ノウハウは「公式必須」と断定しない。

| モール | エンコード | 改行 | 区切り | BOM |
|---|---|---|---|---|
| 楽天RMS normal-item.csv | Shift_JIS(CP932) | CR+LF | カンマ | なし |
| 楽天RMS item.csv | Shift_JIS(CP932) | CR+LF | カンマ | なし |
| Yahoo!ショッピング 商品CSV | Shift_JIS(CP932) | CR+LF | カンマ | なし |
| Amazon フラットファイル | UTF-8 | CR+LF / LF | タブ（TSV） | BOM有無は版による |
| Amazon ライブラリ在庫ファイル | UTF-8 | LF | タブ | 通常BOM無 |
| Shopify 商品CSV | UTF-8 | LF | カンマ | BOM無 |
| Shopify 顧客CSV | UTF-8 | LF | カンマ | BOM無 |
| ネクストエンジン 商品マスタCSV | Shift_JIS(CP932) | CR+LF | カンマ | なし |
| クロスモール 各種CSV | Shift_JIS(CP932) | CR+LF | カンマ | なし |
| Google Merchant Center | UTF-8 | LF / CR+LF | タブ or カンマ | BOM無推奨 |

## エンコード判定アルゴリズム

### 1. BOM判定（先頭3-4バイト）

| 先頭バイト | 判定 |
|---|---|
| `EF BB BF` | UTF-8 (BOM有) |
| `FF FE` | UTF-16 LE |
| `FE FF` | UTF-16 BE |
| `FF FE 00 00` | UTF-32 LE |
| `00 00 FE FF` | UTF-32 BE |

### 2. BOM無しの場合の判別

ASCII以外のバイトを順に検査：

**UTF-8マルチバイトの妥当性**
- `0xC2-0xDF` → 後続 `0x80-0xBF` 1バイト（2バイト文字）
- `0xE0-0xEF` → 後続 `0x80-0xBF` 2バイト（3バイト文字、漢字など）
- `0xF0-0xF4` → 後続 `0x80-0xBF` 3バイト（絵文字など）

このシーケンスが全て成立すればUTF-8の可能性が高い。

**Shift_JIS(CP932)の特徴**
- 1バイト目：`0x81-0x9F` または `0xE0-0xFC`
- 2バイト目：`0x40-0x7E` または `0x80-0xFC`
- ASCII互換領域（0x20-0x7E）は同じ

**判定の優先順位**
1. BOMがあればBOMで確定
2. UTF-8として全マルチバイト列が妥当ならUTF-8
3. 0x81-0x9F が多く出現すればSJIS
4. UTF-8で不正バイト、SJISで不正シーケンスが両方あれば「判定不能・破損」

## 改行コードの判定

| バイト列 | 改行コード | 由来 |
|---|---|---|
| `0D 0A` | CR+LF | Windows、楽天RMS、Yahoo!推奨 |
| `0A` | LF | Unix/Mac、Shopify標準 |
| `0D` | CR | 旧Mac（OS9以前）、現代では事故 |

同一ファイル内に複数の改行コードが混在する場合、モール側のパース時に「列が1つずれる」「特定行だけ無視される」事故が起きやすい。

## BOMの落とし穴

- **楽天SJIS要件にUTF-8 BOM付きを上げる** → モール側でヘッダー先頭列名の前に `[0xEF][0xBB][0xBF]` が混入し、列名が認識されない（最初の列「商品管理番号」が見つからないエラー）
- **Excelで「CSV UTF-8」を選択すると自動でBOMが付く** → そのままアップロードして事故、というケース多発
- **Shopifyは BOM無 UTF-8 が無難** → BOM付きでも動くが、CSV解析ライブラリによって不安定

## 区切り文字の検出

- カンマが多数出現 → CSV
- タブが多数出現 → TSV（Amazonフラットファイル）
- セミコロンが多数 → 欧州系（日本ECでは稀）

ヘッダー行の区切り回数と本文行の区切り回数が一致しない行は「列ずれ」候補。

## 簡易検査スクリプト例（Python）

```python
def detect_encoding(path: str) -> dict:
    with open(path, "rb") as f:
        head = f.read(4)
        body = f.read(8192)

    bom = None
    if head[:3] == b"\xef\xbb\xbf":
        bom = "UTF-8 BOM"
    elif head[:2] == b"\xff\xfe":
        bom = "UTF-16 LE"
    elif head[:2] == b"\xfe\xff":
        bom = "UTF-16 BE"

    try:
        body.decode("utf-8")
        utf8_ok = True
    except UnicodeDecodeError:
        utf8_ok = False

    try:
        body.decode("cp932")
        sjis_ok = True
    except UnicodeDecodeError:
        sjis_ok = False

    crlf = body.count(b"\r\n")
    lf_only = body.count(b"\n") - crlf
    cr_only = body.count(b"\r") - crlf

    return {
        "bom": bom,
        "utf8_valid": utf8_ok,
        "sjis_valid": sjis_ok,
        "crlf": crlf,
        "lf": lf_only,
        "cr": cr_only,
    }
```

実運用上はファイル全体をデコードしてみて、両方OKだった場合は「ASCII互換領域のみで判定不能 → モール推奨に合わせる」と扱う。
