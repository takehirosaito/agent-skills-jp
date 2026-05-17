# GMCフィード必須属性チェックリスト

GMCフィードの主要属性。最新の正式仕様はGoogle Merchant Centerヘルプ「商品データの仕様」を必ず確認。

---

## 1. 必須属性（全商品）

| 属性 | 内容 | 例 |
|---|---|---|
| `id` | 商品ID（一意） | "SKU-12345" |
| `title` | 商品名 | "○○Tシャツ Sサイズ" |
| `description` | 商品説明 | （5000字以内） |
| `link` | 商品ページURL | "https://example.com/products/12345" |
| `image_link` | メイン画像URL | "https://example.com/img/12345.jpg" |
| `availability` | 在庫状況 | "in_stock"/"out_of_stock"/"preorder"/"backorder" |
| `price` | 価格（税込） | "3980 JPY" |
| `condition` | 商品状態 | "new"/"refurbished"/"used" |
| `brand` | ブランド | "ユニクロ" |
| `gtin` | GTIN（JAN等） | "4901234567894"（必須カテゴリ） |
| `mpn` | メーカー型番 | "425678-00" |
| `identifier_exists` | 識別子の有無 | "yes"/"no" |

---

## 2. 条件付き必須属性

| 属性 | 条件 |
|---|---|
| `sale_price` | セール価格があれば（要date範囲） |
| `sale_price_effective_date` | セール期間 |
| `item_group_id` | バリエーション商品の親ID |
| `color` | 衣料・服飾雑貨 |
| `size` | 衣料・履物 |
| `gender` | 衣料 |
| `age_group` | 衣料 |
| `material` | 衣料・家具 |
| `pattern` | 衣料・テキスタイル |
| `multipack` | セット商品 |
| `is_bundle` | バンドル商品 |
| `energy_efficiency_class` | 家電（EU/EEAは必須） |

---

## 3. 配送・税金

| 属性 | 内容 |
|---|---|
| `shipping` | 配送料（国・地域・サービス・価格） |
| `shipping_weight` | 重量ベース送料の場合 |
| `shipping_label` | 配送料グループ |
| `tax` | 税金（米国等） |
| `tax_category` | 税区分 |

---

## 4. カスタム属性

| 属性 | 内容 |
|---|---|
| `custom_label_0` 〜 `custom_label_4` | キャンペーン分類用 |
| `google_product_category` | Googleの商品分類 |
| `product_type` | 自社の商品分類 |

---

## 5. フィード形式

### サポートされる形式
- XML（Atom 1.0 / RSS 2.0）
- CSV / TSV
- Google スプレッドシート連携
- Content API for Shopping
- Shopify アプリ連携
- 各種ECプラットフォームの専用アプリ

### 文字コード
- UTF-8 推奨
- Shift_JIS は文字化けリスクあり

### 更新頻度
- 30日に1回以上の更新が必須
- 価格・在庫の変動が大きい商品は **毎日更新**
- リアルタイム性が必要なら Content API

---

## 6. よくあるエラーと修正

### 6-1. price形式

- 必ず通貨記号付き：`3980 JPY`
- 半角空白で区切る
- 全角数字・カンマ区切りはNG（`3,980` ではなく `3980`）

### 6-2. image_link

- 1000×1000px以上推奨
- HTTPSのURL
- 認証不要・直接アクセス可能
- JPG/PNG/GIF/BMP/TIFF/WebP
- ファイルサイズ16MB以下

### 6-3. availability

- 厳密にこの4値のみ：`in_stock` / `out_of_stock` / `preorder` / `backorder`
- 「あり」「在庫あり」「○」等の日本語表記は不可

### 6-4. description

- HTMLタグ可（一部）
- 改行は \n または <br>
- 5000字以内
- 過度な装飾（絵文字・アスタリスク連発）は避ける

### 6-5. title

- 150字以内推奨
- 商品の主要特徴を先頭
- ブランド名・色・サイズなどを含める
- プロモーション語（「セール」「最安」）は不可

---

## 7. フィードの品質スコア向上

### 高品質フィードの特徴

| 項目 | 高品質 | 低品質 |
|---|---|---|
| 必須属性網羅率 | 100% | 一部欠落 |
| GTIN網羅率 | メーカー製商品で100% | 欠落多数 |
| 画像品質 | 1000px・純白背景 | 低解像度・複雑背景 |
| 説明文 | 商品の特徴を具体的に記述 | コピペ・テンプレ |
| 価格・在庫の更新頻度 | 毎日〜リアルタイム | 月1回 |
| カテゴリ分類 | 正確 | 大雑把 |
| バリエーション設定 | item_group_id・color/sizeで構造化 | 個別商品で分離 |

### スコア低下要因
- GTIN欠落（必須カテゴリ）
- 同一画像の使い回し
- 説明文の使い回し
- 価格の不一致
- バリエーションの構造化不足

---

## 8. 検証ツール

### Merchant Center 内部ツール
- 商品診断
- フィード品質レポート
- データ品質レポート

### 外部ツール
- Google スプレッドシート用 Merchant Center アドオン
- Shopify Google & YouTube アプリ
- 各種フィード管理ツール（Channable、DataFeedWatch等）

---

## 9. 業種別の推奨属性

### アパレル
- 必須：color, size, gender, age_group
- 推奨：material, pattern, item_group_id（バリエーション）

### 家電
- 必須：brand, gtin, mpn
- 推奨：energy_efficiency_class（地域による）

### 食品
- 推奨：内容量、賞味期限、原材料の説明文記載
- アレルゲン情報

### 化粧品
- 推奨：内容量、効能効果（薬機法56項目内）
- 詳細は別スキル `yakki-keihyo-expression-check`

### サプリメント
- 推奨：機能性表示食品なら届出番号、内容量、栄養成分
- 薬機法表現に注意

---

## 10. フィード自動同期の設計

長期的にはフィードと商品ページの **自動同期** を設計するのが最も安定する：

1. **商品マスター → フィード生成 → GMC** の一貫ワークフロー
2. **価格・在庫の変動はAPI連携** で即時反映
3. **画像はCDN経由** で安定配信
4. **GTIN・brand・MPNはマスターで一元管理**
5. **モール（楽天・Amazon）・自社EC・GMCで同じ情報源**

これにより、ページ間の不整合を構造的に排除できる。
