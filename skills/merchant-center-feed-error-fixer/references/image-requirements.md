# GMC 画像要件

Google Merchant Center は画像にも厳しい要件を持つ。画像問題は不承認の主因の1つ。

## 基本要件

### サイズ

| カテゴリ | 最小サイズ | 推奨サイズ |
|---|---|---|
| 衣料品 | 250×250 | 800×800以上 |
| その他 | 100×100 | 800×800以上 |
| 上限 | — | 64MP（メガピクセル）以下 |

### フォーマット

- JPEG（推奨）
- PNG
- GIF（非アニメーション）
- WebP
- BMP
- TIFF

### プロトコル
- **HTTPS必須**（HTTPは不可）

### URL要件
- 直接アクセス可能（404, 403, 5xxエラーなし）
- robots.txt で Googlebot を許可
- リダイレクト最小化
- パラメータ最小化（CDN URLは可）

## 画像内容の要件

### 推奨

- 商品本体のみが写っている
- 背景は白または無地推奨（純白 RGB(255,255,255) が最も安全）
- 商品が画像の主要部分を占める（85%以上推奨）
- 高解像度・鮮明
- 自然光または均一な照明

### 禁止または非推奨

- **テキストオーバーレイ**（商品名・価格・キャッチコピー等のテキスト混入）
- **ロゴオーバーレイ**（透かしロゴは非推奨）
- **プロモーション情報**（「セール中」「送料無料」「期間限定」等のテキスト）
- **枠・装飾**（商品の周りに装飾枠）
- **複数商品の合成**（メイン画像は1商品のみ）
- **小道具・周辺アイテム**（バナナと一緒に映ったスマホ等、誤解の元）
- **モデル着用以外の身体部位**（手だけが写っている等は控えめに）
- **品質の悪い画像**（ピンボケ、暗すぎ、ノイズ多い）

### 衣料品の画像

- モデル着用 または マネキン着用 OK
- 平置き写真 OK
- 商品全体が写っている
- 後ろ姿・横向き等は additional_image_link で

## 画像数の制限

| 属性 | 最大数 |
|---|---|
| image_link | 1（メイン） |
| additional_image_link | 10 |

## 画像エラーの種類

### Crawl error（クロールエラー）

#### 原因と対応

| 原因 | 対応 |
|---|---|
| 画像URLが404 | URLを修正 |
| robots.txt でブロック | 該当パスを許可 |
| HTTPSでない | HTTPSに変換 |
| サーバー応答遅延 | サーバー性能確認、CDN利用 |
| 認証必要 | 認証不要のURLに |
| リダイレクトループ | 直接URLに |

#### robots.txt の例

NG（画像ブロック）：
```
User-agent: *
Disallow: /images/
```

OK（画像許可）：
```
User-agent: *
Disallow: /admin/

User-agent: Googlebot
Allow: /images/
```

または、Googlebot-Image を明示許可：
```
User-agent: Googlebot-Image
Allow: /
```

### Image too small

100×100未満（衣料品250×250未満）の画像。**800×800以上にリサイズ**。

### Image too large

64MP超の画像（例：10000×7000）。**2048×2048～4096×4096程度に縮小**。

### Invalid image format

サポート外フォーマット（HEIC, AVIF, SVG等）。JPEG/PNGに変換。

### Promotional overlay

画像にテキスト・ロゴ・透かし・枠が混入。**画像を作り直す**。

### Generic image

商品が特定できない汎用画像（カテゴリのイメージ写真等）。**実商品の画像に**。

### Brand logo only

ブランドロゴだけが写っている。**実商品が写っているメイン画像に**。

## CDN・画像ホスティング

### 推奨CDN

- 自社CDN（CloudFront / Akamai / Fastly等）
- Shopify CDN（Shopify利用時）
- 楽天キャビネット（楽天利用時、ただしGoogleがクロールできるか確認）
- AWS S3（パブリックアクセス）

### 非推奨

- 直アクセスでなくダウンロード用URL
- セッション必要なURL
- 短期限定の署名付きURL

## 画像の最適化

### サイズ

```
オリジナル：5000×5000、5MB
↓ リサイズ
GMC用：2000×2000、500KB（JPEG quality 85）
```

### 軽量化

- JPEG quality 85-90
- WebP対応CDN（WebP対応ブラウザのみ）
- メタデータ除去（EXIF等）

### 重要：純白背景

メイン画像の背景は **純白 RGB(255,255,255)** が最も安全。Amazon・楽天等の他モール画像と共用できる。

## 画像URLの命名規則

### 推奨

- 商品IDを含む：`https://cdn.example.com/products/TSH-001-main.jpg`
- 拡張子明記：`.jpg` `.png` `.webp`
- URLパラメータ最小：`?w=2000` 等のリサイズパラメータはOK

### 非推奨

- ハッシュ値のみ：`https://cdn.example.com/abc123def456.jpg`（変更検知できない）
- セッションID付：`https://example.com/img?sid=xxx`
- 認証パラメータ付：`https://example.com/img?token=xxx`

## 複数バリエーションの画像

### item_group_id でグルーピング

```
id: TSH-001-BLK-S
item_group_id: TSH-001
image_link: https://cdn/.../tsh-001-black.jpg

id: TSH-001-WHT-S
item_group_id: TSH-001
image_link: https://cdn/.../tsh-001-white.jpg
```

→ バリエーション毎に画像を変える（色違いの実画像）

## 画像のクロール頻度

- GMCは定期的に画像URLをクロール
- 画像URLを変更したらフィード再送信 → 再クロール
- 画像内容のみ変更（URLそのまま）の場合、クロール頻度は数日～1週間

### 画像更新時のベストプラクティス

1. 新しい画像を別ファイル名でアップロード
2. フィードのimage_linkを新URL に更新
3. フィード再送信
4. 旧画像は数週間残しておく（古いキャッシュ対策）

## 検査スクリプト例

```python
import requests
from PIL import Image
from io import BytesIO

def validate_image_url(url: str) -> dict:
    result = {"url": url, "issues": []}
    # HTTPS check
    if not url.startswith("https://"):
        result["issues"].append("Not HTTPS")
        return result
    # Fetch
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            result["issues"].append(f"HTTP {resp.status_code}")
            return result
    except requests.RequestException as e:
        result["issues"].append(f"Fetch error: {e}")
        return result
    # Format / Size
    try:
        img = Image.open(BytesIO(resp.content))
        result["format"] = img.format
        result["size"] = img.size
        if min(img.size) < 100:
            result["issues"].append("Too small")
        if max(img.size) > 10000:
            result["issues"].append("Too large")
        if img.format not in ["JPEG", "PNG", "GIF", "WEBP"]:
            result["issues"].append(f"Unsupported format: {img.format}")
    except Exception as e:
        result["issues"].append(f"Image parse error: {e}")
    return result
```

## まとめ

- 画像は**HTTPS必須・800×800以上推奨**
- 背景は**純白**が最も安全
- **テキスト・ロゴ・枠を画像内に入れない**
- robots.txt で **Googlebot/Googlebot-Image を許可**
- バリエーション毎に**色違いの実画像**を用意
- 画像URL変更時はフィード再送信
- 月次で画像URLの**404／クロール失敗をチェック**
