# Dawn theme 標準 section 一覧

Shopify公式デフォルトテーマ「Dawn」が提供する標準 section。**自前でカスタム section を作る前に、Dawn 標準で済むか必ず確認**。

参考実装：https://github.com/Shopify/dawn

## トップページ向け section

| Dawn section | 用途 | 流用推奨度 |
|---|---|---|
| `image-banner` | ヒーロー（背景画像+見出し+CTA） | ✅ ほぼそのまま |
| `image-with-text` | テキスト+画像（左右） | ✅ |
| `multicolumn` | 2-4カラム特徴 | ✅ |
| `featured-collection` | コレクション内の商品リスト | ✅ |
| `featured-product` | 1商品の詳細表示 | ✅ |
| `featured-blog` | ブログ記事リスト | ✅ |
| `collection-list` | 複数コレクションのリンク | ✅ |
| `collage` | 複数要素のアレンジ | ✅ |
| `slideshow` | スライダー（カルーセル） | ✅ |
| `video` | 動画埋め込み（mp4 / YouTube / Vimeo） | ✅ |
| `rich-text` | リッチテキスト（自由編集） | ✅ |
| `newsletter` | メルマガ登録フォーム | ✅ |
| `email-signup-banner` | バナー型メルマガ登録 | ✅ |
| `apps` | アプリブロック専用 | ✅（App Block 受け入れ） |
| `announcement-bar` | お知らせバー（ヘッダー） | ✅ |
| `custom-liquid` | 自由Liquid | ✅（柔軟） |

## 商品ページ向け section

| Dawn section | 用途 |
|---|---|
| `main-product` | 商品ページ メイン（画像 / 価格 / バリアント / 購入ボタン / 説明） |
| `product-recommendations` | 関連商品 |
| `recently-viewed-products` | 最近見た商品 |

`main-product` には block として：
- title, price, vendor, sku, inventory
- variant_picker, quantity_selector, buy_buttons
- description, share, pickup_availability
- icon-with-text, text, popup
- @app（アプリブロック）

## コレクションページ向け section

| Dawn section | 用途 |
|---|---|
| `main-collection-banner` | コレクションヘッダー（画像+タイトル+説明） |
| `main-collection-product-grid` | 商品グリッド（フィルタ・並び替え対応） |

## ブログ・記事ページ向け section

| Dawn section | 用途 |
|---|---|
| `main-blog` | ブログ一覧 |
| `main-article` | 記事ページ |

## 固定ページ向け

| Dawn section | 用途 |
|---|---|
| `main-page` | 固定ページの基本 |
| `page` | ページコンテンツ |

## カート・チェックアウト向け

| Dawn section | 用途 |
|---|---|
| `main-cart-items` | カートアイテム |
| `main-cart-footer` | カート合計とチェックアウトCTA |

## ヘッダー・フッター section group

| Dawn section | 用途 |
|---|---|
| `header` | サイトヘッダー（ロゴ+ナビ+カート） |
| `footer` | サイトフッター |

section group：
- `header-group.json`：announcement-bar + header
- `footer-group.json`：newsletter + footer

## 重複チェックリスト

自前 Section を作ろうとしている案について、以下を確認：

- [ ] Dawn の `image-banner` で代替できないか
- [ ] Dawn の `multicolumn` で代替できないか
- [ ] Dawn の `image-with-text` で代替できないか
- [ ] Dawn の `featured-collection` / `featured-product` で代替できないか
- [ ] Dawn の `slideshow` で代替できないか
- [ ] Dawn の `collapsible-content` で代替できないか
- [ ] Dawn の `rich-text` で代替できないか
- [ ] Dawn の `custom-liquid` で代替できないか

8つ全て NO の場合のみ、自前実装を検討。

## Dawn 標準のカスタマイズ範囲

### settings を増やす

Dawn の section ファイルを直接編集して `settings` を追加可能：

```liquid
{% schema %}
{
  "name": "Image banner",
  "settings": [
    /* Dawn 標準 */
    /* 追加 */
    { "type": "checkbox", "id": "show_overlay", "label": "オーバーレイ表示" }
  ]
}
{% endschema %}
```

### block を増やす

Dawn のセクションには既に複数 block が定義されている。追加可能：

```liquid
"blocks": [
  /* Dawn 標準 */
  { "type": "custom_badge", "name": "バッジ", "settings": [...] }
]
```

### CSS のオーバーライド

Dawn の `assets/section-image-banner.css` を直接編集 or `assets/custom.css` でオーバーライド。

## Dawn を継承するカスタムテーマ

Dawn を fork してカスタマイズする推奨パターン：

1. Dawn の最新版を base にする
2. カスタム section は別ファイルで追加（`sections/custom-xxx.liquid`）
3. Dawn 標準ファイルは可能な限り編集しない（アップデート時の衝突回避）
4. やむを得ない編集は `// CUSTOM:` コメントで明示

## バージョン管理

Dawn は定期的に更新される。重要な変更：
- 2.0：Online Store 2.0 / Sections Everywhere
- 8.0+：Theme Blocks 対応
- 14.0+：Markets 強化

→ 採用時の Dawn バージョンを記録。更新時は影響範囲を確認。

## Dawn 以外のテーマ

- Sense（無料）
- Refresh（無料）
- Studio（無料）
- Trade（有料）

各テーマで section ラインナップが異なる。**契約しているテーマ** の standard section を必ず確認。

## チェックリスト

- [ ] 採用テーマと バージョンを記録
- [ ] 自前実装する section が Dawn 標準で代替できないか確認
- [ ] Dawn 標準のカスタマイズで足りない場合のみ自前実装
- [ ] Dawn 標準ファイルを直接編集する場合は CUSTOM コメントで明示
- [ ] Dawn 更新時の互換性を確認
