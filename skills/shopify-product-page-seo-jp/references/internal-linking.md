# 内部リンク設計パターン

商品ページからの内部リンクは **CVR向け（カート転換）** と **SEO向け（クロール促進・関連性強化）** の2軸で設計する。

## CVR向け内部リンク

| 種類 | リンク先 | 目的 |
|---|---|---|
| サイズガイド | `/pages/size-guide` | 不安解消 |
| 配送・返品ポリシー | `/pages/shipping` `/pages/returns` | 信頼形成 |
| よくあるご質問 | `/pages/faq` または商品ページ内 anchor | 離脱防止 |
| 関連バリエーション（色違いを別商品にしている場合） | 各商品ページ | 選択肢提示 |
| まとめ買い／ギフト | 該当コレクション | 客単価向上 |

## SEO向け内部リンク

| 種類 | リンク先 | 目的 |
|---|---|---|
| 親コレクション | `/collections/skincare` | カテゴリ階層強化 |
| 関連ブログ | `/blogs/news/...` | トピックオーソリティ |
| 比較記事 | `/blogs/news/vitamin-c-comparison` | 比較検討層の獲得 |
| 使い方ガイド | `/blogs/news/how-to-use-...` | 情報収集層の取り込み |
| 関連商品 | 同カテゴリ・補完商品 | 内部リンク密度 |

## アンカーテキストの書き方

- **悪い例**：「こちら」「詳しくはこちら」「Read more」
- **良い例**：「ビタミンC美容液の選び方」「敏感肌向け化粧品まとめ」「サイズの測り方ガイド」

→ アンカーテキストにはリンク先の主要KWを含める。

## 設置箇所（テーマ内）

| 位置 | 内容 | 実装方法 |
|---|---|---|
| 商品説明本文 | 関連ブログ、使い方ガイド | `{{ product.description }}` 内に手動HTML |
| ファーストビュー直下 | サイズガイド、配送ポリシー | Section追加 or Metafields |
| 関連商品セクション | アルゴリズム or 手動 | `/recommendations/products.json` API or product metafield |
| パンくず | カテゴリ階層 | Section追加 or Liquid テンプレ |

## パンくずリスト（BreadcrumbList schema）

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ホーム",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "スキンケア",
      "item": "https://example.com/collections/skincare"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Bloom Petal セラム 30mL",
      "item": "https://example.com/products/vitamin-c-serum-30ml"
    }
  ]
}
```

Liquid 実装：

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "{{ shop.url }}/" },
    {%- if collection -%}
    { "@type": "ListItem", "position": 2, "name": {{ collection.title | json }}, "item": "{{ shop.url }}{{ collection.url }}" },
    {%- endif -%}
    { "@type": "ListItem", "position": {%- if collection -%}3{%- else -%}2{%- endif -%}, "name": {{ product.title | json }}, "item": "{{ shop.url }}{{ product.url }}" }
  ]
}
</script>
```

## 関連商品の出し方

### A. アルゴリズム（Shopify Product Recommendations API）

```liquid
<div id="recommendations" data-product-id="{{ product.id }}"></div>
<script>
  fetch('/recommendations/products.json?product_id={{ product.id }}&limit=4&intent=related')
    .then(r => r.json())
    .then(data => { /* レンダリング */ });
</script>
```

### B. 手動指定（metafield）

`product.metafields.custom.related_products`（型 `list.product_reference`）に手動でリンク先商品を指定。`shopify-metafields-structure` 参照。

## 重複・カニバリ回避

- 同一KWで複数の商品ページから内部リンクを集中させない（1KW＝1代表ページ）
- バリエーション統合できない場合は canonical で代表を指定
- パンくずを動的に変える（同一商品が複数コレクション所属時、メインコレクションを明示）

## チェックリスト

- [ ] 商品ページからサイズガイド／配送／返品にリンク
- [ ] 親コレクションへのパンくず存在
- [ ] BreadcrumbList schema 出力
- [ ] アンカーテキストにKWが含まれている（「こちら」を使っていない）
- [ ] 関連商品セクション（アルゴリズム or 手動）が機能している
- [ ] 内部リンクのリンク切れがない（404）
