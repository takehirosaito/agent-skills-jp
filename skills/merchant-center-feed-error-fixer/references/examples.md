# GMC フィードエラー修正 ケース別実例

## ケース1：画像のクロール失敗

### エラー

```
GMC通知：
  imageLink invalid value: クロール時のエラー
  影響商品：120件
  最新エラー発生：2026-04-15 14:00 UTC
```

### 検査

```bash
# サンプル商品の画像URLをcurlで確認
curl -I https://example.com/img/abc.jpg
HTTP/2 200
content-type: image/jpeg
```

ブラウザでは表示できる。robots.txt確認：

```
https://example.com/robots.txt
---
User-agent: *
Disallow: /img/
```

→ Googlebotがアクセス不可

### 対応

1. robots.txt を修正：

```
User-agent: *
Disallow: /admin/
Allow: /img/

User-agent: Googlebot-Image
Allow: /img/
```

2. または画像を別パスへ移動：
   - 旧：`https://example.com/img/abc.jpg`
   - 新：`https://cdn.example.com/products/abc.jpg`（独立CDN、許可済み）

3. フィードのimage_link を全件新URLに更新

4. フィード再アップロード → 24時間後にエラー再確認

## ケース2：価格不一致（税込／税抜混在）

### エラー

```
GMC通知：
  Price mismatch
  Feed: 1,980 JPY
  Landing page: 2,178円
  影響商品：30件
```

### 検査

| 商品ID | フィード価格 | 商品ページ表示 |
|---|---|---|
| TSH001 | 1980 JPY | 「2,178円（税込）」 |
| TSH002 | 2480 JPY | 「2,728円（税込）」 |

→ フィードは税抜、商品ページは税込で表示している。

### 対応

#### 方針：税込統一（推奨）

日本のEC・GMC運用では税込価格をフィード送信する。

1. フィードのprice を税込価格に修正：
   - 1980 → 2178（×1.10）
   - 2480 → 2728（×1.10）
2. 商品ページの価格表示が「2,178円（税込）」で統一されているか確認
3. ストア全体の税設定を「税込価格を商品マスタに保存」に変更（PIM/EC側）

#### Shopifyの場合

Shopifyは「税抜入力＋税自動計算」がデフォルト：
- Admin → Settings → Taxes and duties
- 「All prices include tax」をON にすると税込モード
- Markets設定で日本向けを税込表示に

#### 楽天の場合

楽天は税込価格が標準入力。フィード生成スクリプトで税込価格を出力。

### 検証

修正後、再アップロード → 商品ページと一致確認 → エラー解除（24-72時間）

## ケース3：GTIN無効

### エラー

```
GMC通知：
  Invalid GTIN: 4901234567890
  Reason: Check digit mismatch
  影響商品：5件
```

### 検査

`4901234567890` のチェックデジット検証：

本体：`490123456789`
右から：`9 8 7 6 5 4 3 2 1 0 9 4`
重み（右から3,1,3,1,...）：`3 1 3 1 3 1 3 1 3 1 3 1`
積：`27 8 21 6 15 4 9 2 3 0 27 4`
合計：`27+8+21+6+15+4+9+2+3+0+27+4 = 126`

`126 % 10 = 6`
`(10 - 6) % 10 = 4`

→ 正しいチェックデジット = **4**、入力CD = 0 → **不一致**

### 対応

1. メーカーに正式GTINを確認
2. 正しいGTINに修正：`4901234567894`
3. 他の影響商品も同様に検証・修正
4. JANコードの管理を `jan-code-checker` スキルで定期検査

## ケース4：タイトルにプロモテキスト

### エラー

```
GMC通知：
  Promotional text in title
  Detected: "送料無料", "セール中", "期間限定"
  影響商品：80件
```

### 検査

| 商品ID | 現フィードタイトル |
|---|---|
| TSH001 | 【送料無料】軽量Tシャツ iPhone15 スマホケース |
| TSH002 | セール中★50%OFF★iPhone15ケース |
| TSH003 | 【期間限定】軽量スマホケース 防水 |

### 対応

| 商品ID | 修正後タイトル |
|---|---|
| TSH001 | 軽量Tシャツ iPhone15 スマホケース |
| TSH002 | iPhone15ケース 軽量 |
| TSH003 | 軽量スマホケース 防水 iPhone15対応 |

修正ルール：
- 「送料無料」「セール中」「半額」「期間限定」「特価」を削除
- 装飾記号 `【】` `★` `☆` を控える（一部はOK、多用NG）
- 全角記号 `≪≫` `※` を削除
- 商品の特徴のみで構成
- 同時に商品ページのタイトル `<title>` `<h1>` も同様に修正

### 検証

- フィード再アップロード
- 商品ページのHTMLも修正
- 24-72時間後に不承認解除

## ケース5：衣料品の必須属性欠落

### エラー

```
GMC通知：
  Missing required attribute for Apparel:
    - size
    - color
    - age_group
    - gender
  影響商品：200件（衣料品カテゴリ）
```

### 検査

衣料品カテゴリの商品で、size, color, age_group, gender が空欄。

| 商品ID | size | color | age_group | gender |
|---|---|---|---|---|
| SHRT001 | （空） | （空） | （空） | （空） |
| PANT001 | （空） | （空） | （空） | （空） |

### 対応

各商品の属性を入力：

| 商品ID | size | color | age_group | gender |
|---|---|---|---|---|
| SHRT001 | M | black | adult | unisex |
| SHRT002 | L | white | adult | male |
| SHRT003 | S | red | kids | female |
| PANT001 | 32 | blue | adult | male |

#### 値の規約

- **size**：`S`, `M`, `L`, `XL`, `25cm`, `32` 等
- **color**：英語名（`black`, `white`, `red`）、複数色は `/` 区切り（`red/blue`）
- **age_group**：`newborn`, `infant`, `toddler`, `kids`, `adult`
- **gender**：`male`, `female`, `unisex`

#### バリエーション商品の場合

```
id: SHRT001-BLK-S
item_group_id: SHRT001
title: ベーシックTシャツ 黒 S
size: S
color: black
age_group: adult
gender: unisex

id: SHRT001-BLK-M
item_group_id: SHRT001
title: ベーシックTシャツ 黒 M
size: M
color: black
age_group: adult
gender: unisex

id: SHRT001-WHT-S
item_group_id: SHRT001
title: ベーシックTシャツ 白 S
size: S
color: white
age_group: adult
gender: unisex

...
```

### 検証

- フィード再アップロード
- 24-72時間後に必須属性チェック解除

### 再発防止

新規衣料品商品の登録時：
- [ ] size を入力した
- [ ] color を入力した
- [ ] age_group を入力した
- [ ] gender を入力した
- [ ] item_group_id でバリエーションをグルーピングした
- [ ] 各バリエーション毎に色違いの画像を用意した
