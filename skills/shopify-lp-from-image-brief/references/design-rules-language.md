# デザインルールの言語化

LP画像から **再現可能なデザインルール** を取り出し、言語化する。「いい感じで」「デザイン通りに」では実装できない。

## カラーパレット

### 抽出すべき色

| 用途 | 例 |
|---|---|
| 主色（ブランドカラー） | #F4A8B8（コーラルピンク） |
| 副色 | #FFF5F2（クリーム） |
| アクセント（CTA） | #2D2D2D（黒） |
| 本文テキスト | #333333 |
| 補助テキスト | #888888 |
| 背景 | #FFFFFF |
| 罫線 | #E5E5E5 |
| エラー | #D32F2F |
| 成功 | #2E7D32 |

### 抽出方法

- Figma / Sketch から直接コピー
- 画像から：ColorPick / Adobe Color のスポイト
- HEX 値で記載（rgba は alpha 必要時のみ）

### Shopify color_scheme との対応

Shopify の `color_scheme` 設定：
- `Background-1` / `Background-2`
- `Text-1` / `Text-2`
- `Button` / `Button text`
- `Card`
- `Border`

→ LPで使う色を、これらの色スキーマにマッピング。

## フォント

### フォント名・ウェイト

| 用途 | フォント | ウェイト |
|---|---|---|
| 見出し（H1） | Noto Sans JP | Bold 700 |
| 見出し（H2-H3） | Noto Sans JP | Medium 500 |
| 本文 | Noto Sans JP | Regular 400 |
| 強調 | Noto Sans JP | Bold 700 |
| 装飾（英字） | Playfair Display | Regular 400 |

### サイズ階層

PC / モバイル の差分を明示：

| 要素 | PC | SP |
|---|---|---|
| H1 | 48px / 56行間 | 32px / 40行間 |
| H2 | 32px / 40行間 | 24px / 32行間 |
| H3 | 24px / 32行間 | 20px / 28行間 |
| 本文 | 16px / 28行間 | 14px / 24行間 |
| 補助 | 14px / 22行間 | 12px / 20行間 |

### 行間（line-height）

- 見出し：1.2-1.3
- 本文：1.5-1.8（日本語は1.7推奨）

### 字間（letter-spacing）

- 見出し：0.02em-0.05em（少し広げる）
- 本文：0em（標準）
- 英字：0.02em-0.1em

## 余白（spacing）

### グリッドベース

8px or 4px ベースで統一：

| 用途 | px |
|---|---|
| 最小単位 | 4px / 8px |
| 要素間 | 16px / 24px |
| グループ間 | 32px / 48px |
| セクション内 | 64px / 80px |
| セクション間 | 80px / 120px |

PC / SP で差分：

| 余白 | PC | SP |
|---|---|---|
| セクション上下 | 120px | 60px |
| セクション左右 | 80px | 24px |
| 要素間 | 24px | 16px |
| 行間 | 1.7 | 1.6 |

## 角丸（border-radius）

| 要素 | px |
|---|---|
| ボタン | 8px / 24px（丸ボタン） |
| 画像 | 12px |
| カード | 16px |
| 入力フォーム | 4px / 8px |
| バッジ | 12px / 24px |

## 影（box-shadow）

| 用途 | 値 |
|---|---|
| カード（標準） | `0 4px 12px rgba(0,0,0,0.08)` |
| カード（ホバー） | `0 8px 24px rgba(0,0,0,0.12)` |
| ボタン（ホバー） | `0 6px 16px rgba(0,0,0,0.15)` |
| モーダル | `0 20px 60px rgba(0,0,0,0.25)` |

## グリッド

### コンテナ最大幅

- PC：1200px / 1440px
- SP：100%（左右余白24px）

### カラム

12カラム or CSS Grid：
- ガター（カラム間）：24px / 16px

### Flexbox / CSS Grid

LPでよく使うパターン：

```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
@media (max-width: 749px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
```

## アニメーション

### ホバー

```css
.btn {
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.btn:hover {
  background-color: #1a1a1a;
  transform: translateY(-2px);
}
```

### スクロールイン

```css
.section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

JS で IntersectionObserver でクラス付与。

### 注意

- アニメーションは控えめに（`prefers-reduced-motion` 対応）
- パフォーマンス劣化を避ける（transform / opacity のみ animate）

## CTA ボタン

| 状態 | スタイル |
|---|---|
| 通常 | 背景 #2D2D2D、文字 #FFF、padding 16px 32px、border-radius 8px |
| ホバー | 背景 #1A1A1A、shadow 強 |
| アクティブ | 背景 #0A0A0A |
| 無効 | 背景 #CCCCCC、cursor not-allowed |

## アイコン

### サイズ統一

- 24×24（標準）
- 16×16（小）
- 48×48（大）

### 色

- 通常：#333333
- ホバー：#000000
- 無効：#CCCCCC

### 実装

SVG inline で実装すると、CSS で色変更可能：

```html
<svg width="24" height="24" fill="currentColor">
  <path d="..."/>
</svg>
```

## ブレークポイント

Dawn theme 基準：
- モバイル：< 749px
- タブレット：749px - 989px
- デスクトップ：≥ 990px

または独自に：
- モバイル：< 768px
- タブレット：768px - 1024px
- デスクトップ：≥ 1024px

## デザインルール表のテンプレ

```markdown
## カラーパレット
| 用途 | HEX | RGB |
|---|---|---|
| 主色 | #F4A8B8 | rgb(244, 168, 184) |
| 副色 | #FFF5F2 | rgb(255, 245, 242) |
| アクセント | #2D2D2D | rgb(45, 45, 45) |
| 本文 | #333333 | rgb(51, 51, 51) |
| 補助 | #888888 | rgb(136, 136, 136) |
| 背景 | #FFFFFF | rgb(255, 255, 255) |
| 罫線 | #E5E5E5 | rgb(229, 229, 229) |

## フォント
- 見出し：Noto Sans JP / Bold / 48-32px (PC/SP)
- 本文：Noto Sans JP / Regular / 16-14px (PC/SP)
- 装飾：Playfair Display / Regular / 32-24px

## 余白
- セクション間：120px / 60px (PC/SP)
- セクション内：80px / 40px
- 要素間：24px / 16px

## 角丸
- ボタン：8px
- 画像：12px
- カード：16px

## 影
- カード：0 4px 12px rgba(0,0,0,0.08)
- ホバー：0 8px 24px rgba(0,0,0,0.12)

## アニメーション
- ホバー時：transform translateY(-2px), shadow 強化（0.2s ease）
- スクロールイン：opacity 0→1, translateY(20px→0)（0.6s ease）
```

## チェックリスト

- [ ] カラーパレットが HEX で全色定義
- [ ] フォント名・ウェイト・サイズが明示
- [ ] 行間・字間が定義
- [ ] PC/SP の差分が明示
- [ ] 余白がグリッド単位（4px / 8px）で統一
- [ ] 角丸・影が要素別に定義
- [ ] アニメーションの仕様が明示
- [ ] color_scheme との対応が取れている
