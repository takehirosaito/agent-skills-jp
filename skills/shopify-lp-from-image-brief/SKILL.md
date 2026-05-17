---
name: shopify-lp-from-image-brief
description: 画像で作られたLPデザインをShopifyテーマでHTML/CSS/Liquid実装するためのブリーフ（実装指示書）を作成するスキル。「画像LPの実装ブリーフ」「LP分解」「LPをShopifyに載せる」「画像からLPコーディング」「画像LP仕様化」「Figma LP実装」「PSDからLP」「ランディングページの実装指示」「テキスト化／画像化判定」「LPのレスポンシブ設計」「LPの検収基準」「Codex向けLPブリーフ」「Claude Code向けLP指示」など、LP画像（Figma／PSD／JPG）からShopifyテーマへの実装指示書作成リクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※テーマ全体のSection仕様書は別スキル `shopify-liquid-section-brief`、企画段階のSection選定は `shopify-section-idea-generator-jp`。
verified_at: 2026-05
---

# Shopify 画像LP実装ブリーフ作成スキル

## 概要

画像で作られたLPデザイン（Figma／PSD／JPG／ワイヤーフレーム）から、Shopifyテーマで実装するための **詳細ブリーフ** を作成するスキル。

縦方向のセクション分解、テキスト化／画像化の判定、デザインルール（カラー・タイポ・余白）の言語化、レスポンシブ差分、受け入れチェックリストまでを統合し、Codex／Claude Code／外注エンジニアがそのまま実装できる仕様書を出力する。

## ★最重要原則

**「いい感じで」「デザイン通りに」を許さない**。LPの実装失敗の99%は曖昧な指示。1px単位の余白・1色のHEX・1文字単位のフォントサイズまで言語化してから実装に渡す。テキスト化／画像化の判定は最初に行う。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| LP 分解の単位（縦方向セクション切り分け） | `references/section-decomposition.md` |
| テキスト化／画像化の判定基準 | `references/text-vs-image-decision.md` |
| デザインルールの言語化（色・タイポ・余白） | `references/design-rules-language.md` |
| レスポンシブ設計（PC / SP 差分） | `references/responsive-design.md` |
| Codex / Claude Code 向け実装指示の書き方 | `references/codex-implementation-brief.md` |
| 検収チェックリスト | `references/acceptance-checklist.md` |
| LP 分解 実例集 | `references/examples.md` |

### Shopify LP 実装の要点

- 配置先：`templates/page.<handle>.json` または既存 `templates/page.json` のカスタム配置
- カスタムセクションは `shopify-liquid-section-brief` と連携してsection化するか、page専用のLPテンプレートとして書く
- 画像：Shopify CDN（`{{ image | image_url }}`）/ srcset / loading="lazy" を必ず使う
- Web Vitals：LCP・CLS・INP の3指標を意識（ヒーロー画像 LCP、CLS は画像width/height必須）
- カラースキーマ：theme.json の color_scheme で統一推奨

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- LP画像（リンク／添付）の有無
- 商品カテゴリ・単価帯・ブランドトーン
- 配置場所（特定 page handle / トップページ / 商品ページ）
- 既存テーマ（Dawn / カスタムテーマ）
- 想定流入チャネル（広告／メール／SNS）
- 想定CV（カート追加／問い合わせ／登録）

**Step 2. 縦方向に LP を分解**
- ヒーロー / 共感 / 機能訴求 / 社会的証明 / オファー / CTA / FAQ / 関連 / フッター
- 各セクションを順番に列挙

**Step 3. テキスト化／画像化の判定**
- テキスト化：見出し・本文・CTA文言・FAQ
- 画像化：複雑な装飾・グラデーション文字・ロゴ・写真
- 判定マトリクス（SEO重要度 × デザイン再現度）で決定

**Step 4. デザインルールを言語化**
- カラーパレット（HEX 5-8色）
- タイポグラフィ（H1-H6 / 本文のフォント名・サイズ・行間）
- 余白ルール（8px / 16px / 24px / 40px / 64px の刻み）
- ボタン仕様（高さ・角丸・影・hover）

**Step 5. レスポンシブ差分を明示**
- ブレークポイント（768 / 1024）
- 各セクションの PC / SP 配置差

**Step 6. Codex / Claude Code 向け実装指示**
- ファイル構成（liquid / css / json template）
- 命名規則
- 使用する Liquid オブジェクト・metafield

**Step 7. 検収チェックリスト**
- ピクセルパーフェクト判定／レスポンシブ／パフォーマンス／アクセシビリティ

## 代表例（1パターン）

化粧品LP（美容液 単品販売）：
- 縦分解：①ヒーロー（製品ビジュアル＋3秒で伝わる価値訴求）②悩み共感 ③成分・効果（テキスト化）④Before/After（画像化、薬機法注記）⑤レビュー（テキスト＋星）⑥オファー（定価＋初回割）⑦CTA（カート追加）⑧FAQ ⑨ブランドストーリー
- テキスト化：①の見出し・⑤レビュー文・⑥オファー金額・⑧FAQ
- 画像化：①の製品ビジュアル・③成分図解・④Before/After
- ブレークポイント：768px

他ジャンル（食品・ファッション・サプリ・家電）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopify LP 実装ブリーフ：[LP名]

## 1. 概要
- 商品／キャンペーン：
- 配置先：`templates/page.<handle>.json`
- 想定流入：
- 想定CV：

## 2. 縦方向セクション一覧
| # | セクション名 | 目的 | 高さ目安(PC) | テキスト or 画像 |
|---|---|---|---|---|
| 1 | ヒーロー |  |  |  |
| 2 | 共感 |  |  |  |
| 3 | 機能訴求 |  |  |  |
| 4 | 社会的証明 |  |  |  |
| 5 | オファー |  |  |  |
| 6 | CTA |  |  |  |
| 7 | FAQ |  |  |  |

## 3. テキスト化／画像化 判定
| セクション | 判定 | 理由 |
|---|---|---|
|  | テキスト |  |
|  | 画像 |  |

## 4. デザインルール
### カラーパレット
| 役割 | HEX |
|---|---|
| Primary |  |
| Accent |  |
| Bg |  |
| Text |  |

### タイポグラフィ
| 階層 | フォント | size(PC) | size(SP) | line-height |
|---|---|---|---|---|
| H1 |  |  |  |  |
| H2 |  |  |  |  |
| Body |  |  |  |  |

### 余白／コンテナ
- 最大幅：
- セクション間：
- 内側余白：

### ボタン
- 高さ：
- 角丸：
- 色：
- hover：

## 5. レスポンシブ仕様
| 画面幅 | レイアウト |
|---|---|
| ≥1024 |  |
| 768-1023 |  |
| <768 |  |

## 6. 各セクション詳細（順番に）

### Section 1: ヒーロー
- 構造：
- 画像指定：横幅 X px / format webp / alt
- テキスト：
- CTAリンク先：
- アニメーション：

（以下、Section 2〜nを同形式で）

## 7. 実装ファイル構成
- `templates/page.<handle>.json`
- `sections/lp-<name>-hero.liquid`
- `sections/lp-<name>-features.liquid`
- `assets/lp-<name>.css`

## 8. Liquid / Metafield 使用箇所
| セクション | オブジェクト | 用途 |
|---|---|---|

## 9. パフォーマンス要件
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- ヒーロー画像：preload / fetchpriority="high"
- 以下画像：loading="lazy"

## 10. 検収チェックリスト
- [ ] PC で1px単位のデザイン再現
- [ ] SP で 360px / 414px の両方を確認
- [ ] alt 文字が全画像に入っている
- [ ] LCP < 2.5s（PageSpeed Insights モバイル）
- [ ] CTA リンク先が正しい
- [ ] H1 が1つだけ
- [ ] フォントウェイトの読み込みが完了している
````

## 品質ゲート

- [ ] 縦方向セクションが6個以上に分解されている
- [ ] テキスト化／画像化の判定が全セクションにある
- [ ] カラーパレットが HEX で5色以上
- [ ] タイポグラフィに行間（line-height）まである
- [ ] レスポンシブ表が3画面幅以上
- [ ] 各セクションに画像幅・alt・CTAリンク先がある
- [ ] LCP / CLS の目標値がある
- [ ] 検収チェックリストが10項目以上

## エッジケース

- **画像が文字主体（バナー的）**：可能な限りテキスト化し、ファントウェブフォントで対応。SEOとアクセシビリティに不利な画像文字を避ける
- **複雑なアニメーション指定**：標準CSS transitionで実装可能か、Lottieが必要かを判定
- **動画埋込み**：iframe (YouTube/Vimeo) または `<video>` の使い分け、autoplay は muted 必須
- **薬機法／景表法リスクがあるBefore/After**：画像化前に `yakki-keihyo-expression-check` でクロスチェック
- **Markets 多言語ストア**：テキスト化部分を Translate & Adapt で翻訳、画像化部分は言語別画像を用意
- **既存テーマがレガシー**：Online Store 1.0 では JSON template 不可。`templates/page.<handle>.liquid` で対応

詳細は `references/examples.md` を参照。

## 注意事項

- 画像にテキストを焼き込むと SEO に不利・翻訳不能・アクセシビリティ低下。可能な限りテキスト化
- Web Vitals は Shopify CDN を使い、画像 width/height 属性を必ず指定
- フォントの読み込みで FOIT/FOUT が発生する。`font-display: swap` を推奨
- 画像の固定リサイズは Retina (2x/3x) を考慮
- 検収は実機（iPhone Safari / Android Chrome）で確認
- 公式仕様は変動するため、最終は Shopify.dev / web.dev で確認

## references/ 一覧

- `references/section-decomposition.md`：LP分解の単位
- `references/text-vs-image-decision.md`：テキスト化／画像化の判定基準
- `references/design-rules-language.md`：デザインルールの言語化
- `references/responsive-design.md`：レスポンシブ設計
- `references/codex-implementation-brief.md`：Codex / Claude Code 向け指示書の書き方
- `references/acceptance-checklist.md`：検収チェックリスト
- `references/examples.md`：LP分解実例集

## 参考公式情報源

- Shopify.dev「Theme architecture」「Image filters」「Section schema」
- web.dev「Core Web Vitals」「LCP / CLS / INP」
- W3C WCAG 2.1（アクセシビリティ）

最新仕様は Shopify.dev および web.dev で確認すること。
