# レスポンシブ設計（PC / SP 差分）

## ブレークポイント

### Dawn theme 標準

```css
/* モバイル（デフォルト） */
.element { ... }

/* タブレット以上 */
@media (min-width: 750px) { ... }

/* デスクトップ以上 */
@media (min-width: 990px) { ... }

/* 大画面 */
@media (min-width: 1200px) { ... }
```

→ **モバイルファースト**で書く（モバイル基準→PC追加）。

### カスタム

業種・ターゲット端末に応じて：
- モバイル：< 768px
- タブレット：768-1024px
- デスクトップ：≥ 1024px

## レスポンシブの3つのレベル

### Level 1：折り返しのみ

カラム数を減らす：
- PC：3カラム
- タブレット：2カラム
- モバイル：1カラム

### Level 2：要素の入れ替え

- PC：画像左、テキスト右
- SP：画像上、テキスト下

```css
.feature {
  display: flex;
  flex-direction: column-reverse;
}
@media (min-width: 990px) {
  .feature {
    flex-direction: row;
  }
}
```

### Level 3：別レイアウト

- PC：複雑なグリッド
- SP：シンプル縦並び

→ デザインが大きく違う場合、HTMLを2セットor `display:none` で切り替え（ただしSEO・アクセシビリティに注意）。

## 要素別のレスポンシブ方針

### ヒーローセクション

| 項目 | PC | SP |
|---|---|---|
| 背景画像比率 | 16:9 or 21:9 | 4:5 or 3:4 |
| テキスト配置 | 左 / 中央 | 中央 |
| H1 サイズ | 48-64px | 28-36px |
| CTA幅 | 自動（min 200px） | フル幅 |

### 特徴カラム

| カラム数 | PC | タブレット | SP |
|---|---|---|---|
| 3カラム → 1カラム | 3 | 2 | 1 |
| 4カラム → 2カラム | 4 | 2 | 2（2×2） |
| 2カラム → 1カラム | 2 | 1 | 1 |

### 画像

```liquid
<img src="{{ image | image_url: width: 800 }}"
     srcset="{{ image | image_url: width: 400 }} 400w,
             {{ image | image_url: width: 800 }} 800w,
             {{ image | image_url: width: 1200 }} 1200w"
     sizes="(max-width: 749px) 100vw, 50vw"
     loading="lazy"
     decoding="async"
     width="800" height="800"
     alt="{{ image.alt }}">
```

### CTA ボタン

PC：固定幅 240px〜、中央 or 左
SP：フル幅 or 大きめ（min 200px）、画面下部 sticky 推奨

### フォント

| 要素 | PC | SP |
|---|---|---|
| H1 | 48px | 28-32px |
| H2 | 32px | 24px |
| H3 | 24px | 20px |
| 本文 | 16px | 14-16px |
| 補助 | 14px | 12px |

→ モバイルでは **本文 14px 以下にしない**（読みにくい）。

### 余白

| 余白 | PC | SP |
|---|---|---|
| セクション上下 | 80-120px | 40-60px |
| セクション左右（外側） | 80px | 16-24px |
| 要素間 | 24-32px | 16-20px |

## モバイル特有の考慮

### タップ領域

- 最低 44×44pt（Apple HIG）/ 48×48dp（Material）
- 隣接ボタンの間隔は 8px 以上

### 固定 CTA バー

スクロール中も購入ボタンが見える：

```liquid
<div class="sticky-cta sticky-cta--mobile">
  <a href="#product-form" class="btn btn--full">
    今すぐ購入 - {{ product.price | money }}
  </a>
</div>

<style>
.sticky-cta--mobile {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 100;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,.1);
}
.sticky-cta__btn {
  display: block; width: 100%;
  text-align: center;
  padding: 14px;
  background: #000; color: #fff;
  border-radius: 8px;
}
@media (min-width: 750px) {
  .sticky-cta--mobile { display: none; }
}
</style>
```

### スクロールパフォーマンス

- 高さ固定（CLS 防止）
- `will-change` は最小限
- `loading="lazy"` を全画像に

### ピンチズーム

- 商品画像はピンチズーム可能に
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">`
- ※マルチタッチ操作を妨げない

## PC 専用 / SP 専用 の出し分け

### CSS で表示制御

```css
.pc-only { display: block; }
.sp-only { display: none; }

@media (max-width: 749px) {
  .pc-only { display: none; }
  .sp-only { display: block; }
}
```

### Liquid で出し分け

ユーザーエージェント判定は不確実なので、CSS で制御するのが安全。サーバーサイドで分けるなら：

```liquid
{%- if request.design_mode -%}
  {%- comment -%}Theme Editor では両方表示{%- endcomment -%}
{%- endif -%}
```

## 画像最適化

### WebP の使用

```html
<picture>
  <source srcset="{{ image | image_url: width: 800, format: 'webp' }}" type="image/webp">
  <img src="{{ image | image_url: width: 800 }}" alt="{{ image.alt }}" loading="lazy">
</picture>
```

### Art direction（PC/SP 別画像）

```liquid
<picture>
  <source media="(min-width: 750px)" srcset="{{ section.settings.bg_pc | image_url: width: 1920 }}">
  <img src="{{ section.settings.bg_sp | image_url: width: 750 }}" alt="">
</picture>
```

PC では横長、SP では縦長など画像比率を変える。

## チェックリスト

- [ ] モバイルファーストでCSS記述
- [ ] ブレークポイント（749 / 989 / 1199）or カスタム明示
- [ ] 全要素にPC/SP の差分を定義
- [ ] フォントサイズ・行間・字間 PC/SP別
- [ ] 余白 PC/SP別
- [ ] 画像 srcset / sizes / lazy-load
- [ ] タップターゲット最低 44×44
- [ ] 固定CTAバー（モバイル）
- [ ] 横スクロール発生せず
- [ ] 実機テスト（iOS Safari, Android Chrome）
