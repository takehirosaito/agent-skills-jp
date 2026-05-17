# RPP CSVフォーマット（コントロールカラム n/d/u）

最新仕様は RMS の RPP管理画面で確認。本資料は標準的なフォーマット解説。

## 基本フォーマット

### 除外商品CSV

```csv
control,item_id,reason
n,ABCD123,在庫切れ
n,EFGH456,粗利率8%
d,IJKL789,在庫補充済み
u,MNOP012,粗利率改善
```

### 除外キーワードCSV

```csv
control,keyword,reason
n,競合ブランド名,商標問題
n,無関係キーワード,CTR低い
d,過去除外語,検索流入再開
```

## コントロールカラム

| 値 | 意味 | 動作 |
|---|---|---|
| n | new | 新規に除外リストに追加 |
| d | delete | 除外リストから削除（再度配信対象に） |
| u | update | 既存除外項目の情報更新（理由など） |

## 文字コード・改行

- 文字コード：Shift_JIS（CP932）
- 改行：CR+LF
- 拡張子：.csv
- BOMなし

## 必須カラム

| カラム | 必須 | 内容 |
|---|---|---|
| control | 必須 | n/d/u |
| item_id（除外商品） or keyword（除外キーワード） | 必須 | 商品管理番号またはキーワード |
| reason | 推奨 | 除外理由（運用記録用） |

## CSV作成時の注意

### 商品管理番号の形式
- 半角英数（楽天の仕様：32byte以内）
- 半角スペース・全角文字混入NG

### キーワードの形式
- 半角／全角は楽天仕様に従う
- 完全一致／部分一致は楽天独自設定

### コメント・空行
- 本番CSVには含めない
- 開発・調整時にメモを書く場合は別ファイル

## アップロード手順（一般的な流れ）

1. CSV作成（除外商品・除外キーワード別）
2. 文字コード・改行コード確認
3. RMSのRPP管理画面からアップロード
4. プレビュー・差分確認
5. 適用
6. 適用後の動作確認（数時間で反映）

## バックアップ

- 適用前のCSVを必ず保管
- 月次でバージョン管理
- 大量変更時は段階的に適用

## サンプルCSV

### 除外商品（10件）

```csv
control,item_id,reason
n,SKU-001,在庫切れ_2024-05-15
n,SKU-002,粗利率5%_除外
n,SKU-003,季節終了_クリスマス
n,SKU-004,廃番予定_2024-06末
d,SKU-005,在庫補充済み_再配信OK
n,SKU-006,ROAS悪化_過去30日2.1
n,SKU-007,クリック15CV0_要見直し
u,SKU-008,粗利改善15%→20%_継続除外
n,SKU-009,在庫1個_要注意
n,SKU-010,廃番確定_2024-04末
```

### 除外キーワード（5件）

```csv
control,keyword,reason
n,競合ブランドX,商標問題
n,医薬品的キーワード,薬機法
n,無関係広告語,CTR0.1%
d,過去季節キーワード,シーズン到来再開
n,類似品の型番,誤誘導防止
```

## 一括処理の限界

- 1回のCSVアップロードに件数上限がある場合あり（楽天仕様）
- 大量変更時は分割アップロード
- ファイル容量制限：仕様確認

## 差分CSVの作り方

### Pythonでの差分処理例

```python
import csv

# 既存除外リスト
with open('existing_exclusion.csv', 'r', encoding='shift_jis') as f:
    existing = {row['item_id'] for row in csv.DictReader(f)}

# 今回除外したい商品
new_exclusion = {'SKU-001', 'SKU-002', 'SKU-003'}

# 差分計算
to_add = new_exclusion - existing  # 新規追加（n）
to_delete = existing - new_exclusion  # 削除（d）

# CSV出力
with open('rpp_exclusion.csv', 'w', encoding='shift_jis', newline='\r\n') as f:
    writer = csv.writer(f)
    writer.writerow(['control', 'item_id', 'reason'])
    for item in to_add:
        writer.writerow(['n', item, '在庫切れ'])
    for item in to_delete:
        writer.writerow(['d', item, '在庫補充'])
```

## CSVの検証

アップロード前の検証：

- [ ] 文字コード Shift_JIS
- [ ] 改行 CR+LF
- [ ] コントロールカラム n/d/u のみ
- [ ] 商品管理番号が実在する
- [ ] 重複行なし
- [ ] 改行のないセル
- [ ] 全角・半角の混在なし（半角推奨）

## アップロード後の確認

- RPP管理画面で除外リスト件数確認
- 実際の広告配信状況（数時間後）
- 除外したはずの商品に広告流入していないか（24時間後）
