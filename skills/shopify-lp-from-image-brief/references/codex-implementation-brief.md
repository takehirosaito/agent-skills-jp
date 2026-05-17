# Codex / Claude Code 向け実装指示の書き方

AI（Codex / Claude Code）や外注エンジニアに実装を依頼するときの **ブリーフの形式**。曖昧な指示は曖昧な実装を生む。

## ブリーフの基本構造

```markdown
# 実装タスク：[LP名 / セクション名]

## 1. 共通要件
- テーマ：Dawn 派生 / Online Store 2.0
- Liquid: Shopify標準
- JavaScript: Vanilla JS（jQuery 不使用）
- CSS: 既存テーマと衝突しないスコープ
- Lighthouse: Performance 70+, Accessibility 90+

## 2. ファイル構成
- `sections/section-xxx.liquid` — 本セクション
- `assets/section-xxx.css` — 専用CSS（必要時）
- `assets/section-xxx.js` — 専用JS（必要時）

## 3. schema 設計
[JSON]

## 4. Liquid 実装方針
[ポイント箇条書き]

## 5. CSS 方針
[クラス命名規則・スコープ]

## 6. JS 方針
[必要なインタラクション]

## 7. アクセシビリティ要件
[見出し階層・alt・キーボード]

## 8. 性能要件
[画像最適化・遅延読込]

## 9. 受け入れ条件
[チェックリスト]
```

## 良いブリーフの例

```markdown
# 実装タスク：化粧品LP ヒーローセクション

## 共通要件
- テーマ：Dawn 派生
- Online Store 2.0 対応
- jQuery 不使用、Vanilla JS
- WebP 推奨、loading="lazy"
- カラースキーム：theme settings の color_scheme と統合

## ファイル構成
- `sections/section-hero-lp.liquid`
- 既存 `assets/section-hero.css` を流用（必要なら追記）

## schema 設計

```json
{
  "name": "ヒーロー（LP）",
  "tag": "section",
  "class": "section-hero-lp",
  "settings": [
    { "type": "image_picker", "id": "bg_pc", "label": "PC背景画像" },
    { "type": "image_picker", "id": "bg_sp", "label": "SP背景画像" },
    { "type": "text", "id": "heading", "label": "見出し", "default": "肌に寄り添う、優しい美容液" },
    { "type": "textarea", "id": "subheading", "label": "サブ見出し" },
    { "type": "text", "id": "cta_label", "label": "CTAテキスト", "default": "今すぐ購入" },
    { "type": "url", "id": "cta_url", "label": "CTAリンク" },
    {
      "type": "select", "id": "text_align", "label": "テキスト配置",
      "options": [
        {"value": "left", "label": "左"},
        {"value": "center", "label": "中央"}
      ],
      "default": "left"
    },
    {
      "type": "color_scheme", "id": "color_scheme", "label": "カラースキーム",
      "default": "background-2"
    }
  ],
  "presets": [
    { "name": "ヒーロー（LP）" }
  ]
}
```

## Liquid 実装

```liquid
{%- liquid
  assign bg_pc = section.settings.bg_pc
  assign bg_sp = section.settings.bg_sp
  assign heading = section.settings.heading
  assign subheading = section.settings.subheading
  assign cta_label = section.settings.cta_label
  assign cta_url = section.settings.cta_url
  assign text_align = section.settings.text_align
-%}

<section class="hero color-{{ section.settings.color_scheme }}"
         data-section-id="{{ section.id }}">
  <picture class="hero__bg">
    {%- if bg_pc != blank -%}
      <source media="(min-width: 750px)"
              srcset="{{ bg_pc | image_url: width: 1920, format: 'webp' }}"
              type="image/webp">
    {%- endif -%}
    {%- if bg_sp != blank -%}
      <img src="{{ bg_sp | image_url: width: 750 }}"
           alt="{{ bg_sp.alt | escape }}"
           loading="eager" fetchpriority="high"
           width="750" height="900">
    {%- endif -%}
  </picture>

  <div class="hero__content hero__content--{{ text_align }}">
    {%- if heading != blank -%}
      <h1 class="hero__heading">{{ heading }}</h1>
    {%- endif -%}
    {%- if subheading != blank -%}
      <p class="hero__subheading">{{ subheading }}</p>
    {%- endif -%}
    {%- if cta_url != blank -%}
      <a href="{{ cta_url }}" class="hero__cta btn btn--primary">
        {{ cta_label | default: '詳しく見る' }}
      </a>
    {%- endif -%}
  </div>
</section>
```

## CSS 方針

クラス命名：BEM（Block__Element--Modifier）

スコープ：`.hero` 以下のみ、グローバル汚染なし

```css
.hero { position: relative; min-height: 600px; }
.hero__bg img { width: 100%; height: 100%; object-fit: cover; }
.hero__content { position: absolute; top: 50%; transform: translateY(-50%); padding: 0 80px; }
.hero__content--left { left: 0; text-align: left; }
.hero__content--center { left: 50%; transform: translate(-50%, -50%); text-align: center; }
.hero__heading { font-size: 48px; line-height: 1.2; margin-bottom: 16px; }
.hero__subheading { font-size: 18px; line-height: 1.6; margin-bottom: 32px; }
.hero__cta { display: inline-block; padding: 16px 32px; }

@media (max-width: 749px) {
  .hero { min-height: 500px; }
  .hero__content { padding: 0 24px; }
  .hero__heading { font-size: 32px; }
  .hero__subheading { font-size: 16px; }
}
```

## JS 方針

このセクションには JS は不要。

## アクセシビリティ要件

- 見出し階層：`<h1>` 1個（ページ唯一）
- 画像 alt：image_picker の alt を流用
- CTA：`<a>` タグ（`<button>` ではない、リンク先がある）
- カラーコントラスト：WCAG AA（4.5:1 以上）

## 性能要件

- 背景画像：`loading="eager"` `fetchpriority="high"`（LCPの主要素）
- 他の画像：`loading="lazy"`
- フォント：Web Font は subset 化、`font-display: swap`
- 不要な JS を読み込まない（このセクションでは JS なし）

## 受け入れ条件

- [ ] テーマカスタマイザーで「ヒーロー（LP）」が追加可能
- [ ] 全 settings の編集が反映される
- [ ] PC/SP の表示がデザイン通り
- [ ] Lighthouse Performance 70+ / Accessibility 90+
- [ ] 画像 WebP 提供、JPG フォールバック
- [ ] alt 設定済み
- [ ] CTA リンク先正常
- [ ] モバイル実機テスト（iOS Safari, Android Chrome）
```

## 悪いブリーフの例

```
LPのヒーローを実装してください。
デザインはこんな感じで、いい感じにしてください。
レスポンシブ対応してください。
```

→ 曖昧、何をどう実装すればいいか分からない。

## 指示の粒度

### 細かすぎる（過度）

CSS1行1行まで指示 → 実装者の判断余地が消える、改善できなくなる

### 大雑把すぎる（不足）

「いい感じで」「デザイン通りに」→ 出てきたものがズレる

### 適切

- 構造（schema, ファイル構成）は具体的に
- 実装ロジック（Liquid, JS）は方針＋例
- スタイル（CSS）は値の指定＋クラス命名規則
- 受け入れ条件はチェックリスト

## チェックリスト

- [ ] schema が JSON で完全に書かれている
- [ ] ファイル構成が明示
- [ ] Liquid のコード例（最低でも骨格）
- [ ] CSS のクラス命名規則・スコープ
- [ ] JS が必要なら何をするか明示
- [ ] アクセシビリティ要件
- [ ] 性能要件
- [ ] 受け入れ条件がチェックリスト形式
- [ ] 既存テーマとの衝突回避方針
