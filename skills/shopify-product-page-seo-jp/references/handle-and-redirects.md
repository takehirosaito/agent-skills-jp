# Handle 命名規則・URL Redirects 運用

## handle とは

Shopify の handle は商品／コレクション／ページ／ブログ記事のURL末尾。例：

- 商品：`/products/vitamin-c-serum-30ml`
- コレクション：`/collections/skincare`
- ページ：`/pages/about`
- ブログ：`/blogs/news/article-handle`

商品名から自動生成されるが、**そのままだと日本語ローマ字化 or 連番** になりやすく SEO 上不利。

## 命名規則（推奨）

| 要素 | ルール |
|---|---|
| 文字種 | 英小文字＋数字＋ハイフン（`-`）のみ |
| 長さ | 20-40字 |
| 構造 | `[コアKW]-[属性]-[容量／サイズ]` |
| 禁則 | 大文字、アンダースコア、日本語、絵文字、連続ハイフン |

### OK例

- `vitamin-c-serum-30ml`
- `silk-pillowcase-50x70`
- `wireless-earbuds-bluetooth-5`
- `organic-green-tea-100g`

### NG例

- `product-12345`（連番）
- `bitamin-c-30ml`（日本語ローマ字、検索されない）
- `Vitamin_C_Serum`（大文字・アンダースコア）
- `vitamin-c-serum-very-long-product-handle-with-many-words-2024-new`（長すぎ）

## 命名手順

1. **コアKW** を1〜2語、英語で確定（Google検索が拾うのは主に英語／ローマ字の handle ではなく title だが、handle は URL のセマンティクスに寄与）
2. **属性** を1-2つ（容量・サイズ・色・素材）
3. ハイフンで連結
4. 既存 handle と重複チェック

## handle 変更時の必須対応

handle を変更すると **古い URL は 404** になる。Shopify は **「Create a URL redirect」を促す内部通知** を出すが、テーマ／管理者によっては気付かず放置される。

### Shopify管理画面：URL Redirects

`Online Store → Navigation → View URL redirects` から：

| 列 | 内容 |
|---|---|
| Redirect from | 旧URL（例 `/products/old-handle`） |
| Redirect to | 新URL（例 `/products/new-handle`） |

### 一括登録（CSV）

`Bulk import redirects` で CSV アップロード可：

```csv
"Redirect from","Redirect to"
"/products/old-handle-1","/products/new-handle-1"
"/products/old-handle-2","/products/new-handle-2"
```

### リダイレクトの種類

Shopify の URL Redirects は **301（恒久的）** で出力される。SEO の観点では正しい挙動。

## handle 変更が必要なケース

| ケース | 対応 |
|---|---|
| 自動生成のローマ字を意味ある英語に変えたい | 変更＋301リダイレクト |
| 商品リニューアル（V1 → V2）で旧商品を非公開化 | 旧 handle → 新 handle に301 |
| 季節商品の handle を統合（2024年版／2025年版） | 旧 → 新 に301、aggregateRatingも引き継げる場合あり |
| バリエーション統合（色違いの別商品を1商品＋バリアントに） | 旧色商品 → 統合商品 に301 |

## ドメイン構成と handle

Shopify Markets でドメインを切り分けている場合、handle はストア共通でも **ドメインごとに別 URL** として扱われる：

```
https://example.com/ja/products/vitamin-c-serum-30ml
https://example.com/en/products/vitamin-c-serum-30ml
```

→ canonical / hreflang で正しく相互参照させる。

## チェックリスト

- [ ] 全商品の handle が英数小文字＋ハイフン
- [ ] コアKWが handle に含まれている
- [ ] 連番や日付になっていない
- [ ] handle 変更時の URL Redirects が登録済み
- [ ] CSV 一括変更を行った場合、サンプル数件で 301 が返ることを確認

## 注意

- handle を変更するとブックマーク・外部リンク・SNS シェアが全て無効化される。可能なら**初回作成時に確定させる**
- 大量の handle 変更は **Search Console のクロール頻度** で反映に時間がかかる
- 301リダイレクトの **チェーン（A→B→C）** は最終的に1段にまとめる。チェーンが増えるとクロールバジェットを消費
