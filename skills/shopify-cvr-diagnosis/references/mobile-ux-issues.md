# モバイル UX 特有の問題

日本のECは **モバイル比率 60-80%** が一般的。モバイルCVR が PCの半分以下なら深刻な問題。

## モバイル特有の問題

### A. レイアウト・操作性

- **タップ領域が小さい**：最低 44×44pt（Apple HIG）／ 48×48dp（Material）
- **隣接ボタンが近い**：誤タップ
- **横スクロールが発生**：意図しない横スクロール
- **モーダルが閉じられない**：×ボタンが見つからない、ESCキー無い
- **固定ヘッダーで画面が狭い**：CTAが見えなくなる

### B. フォーム入力

- **入力欄が画面の半分以上隠れる**：iOS Safari でキーボードが出ると深刻
- **オートフィルが効かない**：住所自動入力（郵便番号→住所）が無い
- **入力モードが間違っている**：`type="tel"` / `type="email"` / `inputmode="numeric"` の指定が無い
- **入力規則が厳しすぎる**：電話番号ハイフンの有無で弾く

### C. 速度・パフォーマンス

- **モバイルのLCP（Largest Contentful Paint）が遅い**：3秒以上で離脱率激増
- **画像が WebP/AVIF でない**：データ量過剰
- **JS が多すぎる**：jQuery + 複数アプリで重い
- **Web Font の読み込みが遅い**：FOIT（文字非表示）

### D. ナビゲーション

- **ハンバーガーメニューしかない**：カテゴリへの導線が見えない
- **戻るボタンが効かない**：SPA で history が壊れる
- **パンくずが無い**：階層構造が分からない

### E. 画像

- **画像が小さい／拡大できない**：ピンチズーム disabled
- **横並びカルーセルが多すぎる**：「下にスクロールしない」
- **画像下にキャプションが詰まる**

### F. CTA

- **「カートに追加」ボタンがファーストビューに無い**
- **固定 CTA バー（画面下部 sticky）が無い**：スクロール中も見えるべき
- **CTAが目立たない色**：ブランドカラーすぎて見落とす

### G. レビュー

- **レビューが横スクロールで読みにくい**
- **画像レビューが見えない**
- **「もっと見る」が動かない**

### H. チェックアウト

- **住所入力で郵便番号→自動入力が無い**
- **配送日カレンダーがモバイルで操作しにくい**
- **決済画面で3Dセキュアが別タブ／戻れない**

## チェック方法

### 1. Chrome DevTools

- F12 → Device toolbar → iPhone / Pixel をエミュレート
- 各画面で実際の動作を確認
- Lighthouse Mobile スコア測定

### 2. Lighthouse / PageSpeed Insights

主要指標：
- **LCP**（Largest Contentful Paint）：2.5秒以内
- **INP**（Interaction to Next Paint）：200ms以内
- **CLS**（Cumulative Layout Shift）：0.1以内
- **FCP**（First Contentful Paint）：1.8秒以内

### 3. 実機テスト

- iOS Safari、Android Chrome 両方
- 通信速度を 4G にスロットル
- 古い端末（3年前のミドルレンジ）でテスト

### 4. GA4

- `device_category = "mobile"` でセグメント
- ファネル通過率
- ページ滞在時間
- スクロール深度

## 改善施策

### 即効性が高い施策

1. **画像最適化**：WebP化、`srcset` 設定、`loading="lazy"`
2. **フォントの subset 化**：日本語フォントの軽量化
3. **`inputmode` / `autocomplete` の正しい設定**：オートフィル有効化
4. **固定CTA バーの実装**：スクロール時もカート追加可能
5. **タップ領域の拡大**：余白を増やしてターゲット 44×44pt 確保

### Liquid 実装例

#### 固定CTAバー

```liquid
<div class="sticky-cta sticky-cta--mobile">
  <a href="#product-form" class="btn btn--primary">
    カートに追加 - {{ product.price | money }}
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
  @media (min-width: 750px) {
    .sticky-cta--mobile { display: none; }
  }
</style>
```

#### inputmode と autocomplete

```html
<input type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="電話番号">
<input type="text" name="postal_code" inputmode="numeric" pattern="[0-9]{3}-?[0-9]{4}" autocomplete="postal-code">
<input type="email" name="email" inputmode="email" autocomplete="email">
```

#### 画像の lazy load

```liquid
<img src="{{ image | image_url: width: 800 }}"
     srcset="{{ image | image_url: width: 400 }} 400w, {{ image | image_url: width: 800 }} 800w"
     sizes="(max-width: 749px) 100vw, 50vw"
     loading="lazy" decoding="async"
     width="800" height="800" alt="{{ image.alt }}">
```

## チェックリスト

- [ ] Lighthouse Mobile スコア 70+
- [ ] LCP 2.5秒以内、INP 200ms以内、CLS 0.1以内
- [ ] タップターゲット最低 44×44pt
- [ ] 横スクロール発生せず
- [ ] 全フォームで `inputmode` / `autocomplete` 正しい
- [ ] 郵便番号→住所オートフィル動作
- [ ] 固定CTAバー（モバイル）あり
- [ ] 画像 WebP / lazy load
- [ ] 実機テスト（iOS Safari + Android Chrome）
