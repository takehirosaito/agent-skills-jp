---
name: shopify-liquid-section-brief
description: ShopifyテーマのLiquidカスタムSectionを実装するためのブリーフ（仕様書）を作成するスキル。「Section仕様書」「Liquidセクション」「カスタムセクション」「schema設計」「block設計」「セクションのブロック」「Online Store 2.0」「Sections Everywhere」「Dawn theme カスタム」「JSON template」「セクションのスキーマ」「settings型」「preset設計」「受け入れ基準」「UAT」「実装ブリーフ」など、Shopifyテーマに追加するカスタムSection／Blockの仕様書・実装指示書の作成リクエストで必ずこのスキルを使う。Codex／Claude Code／外注エンジニアが実装可能なレベルまで詳細化する。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※どんなセクションを作るべきかの企画段階は別スキル `shopify-section-idea-generator-jp`、LP画像からの実装ブリーフは `shopify-lp-from-image-brief`、Metafieldデータ構造の設計は `shopify-metafields-structure`。
verified_at: 2026-05
---

# Shopify Liquid Section ブリーフ作成スキル

## 概要

Shopifyテーマの **カスタムSection／Block** を実装するための仕様書（ブリーフ）を作成するスキル。

非エンジニアの曖昧な要望から、`{% schema %}` の設定型・block構成・preset・受け入れ基準（UAT）まで具体化し、Codex／Claude Code／外注エンジニアがそのまま実装できるレベルの仕様書を出力する。

## ★最重要原則

**「マーチャントが管理画面のどの操作でこのSectionを編集／差し替えできるか」を仕様の起点にする**。schema の settings 型を決めるとき、コードではなく「ストア管理者が触る画面UI」から逆算する。これを外すと、実装後にマーチャントが触れない／間違える Section ができる。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| Sections Everywhere と Online Store 2.0 | `references/sections-everywhere.md` |
| schema settings 型 完全リスト | `references/schema-settings-types.md` |
| Block 設計（繰り返し配置単位） | `references/block-design.md` |
| Presets と Default の使い分け | `references/presets-and-default.md` |
| 受け入れ条件（UAT）テンプレ | `references/acceptance-criteria.md` |
| Section ブリーフ実例集 | `references/examples.md` |

### Liquid Section 固有の要点

- 対象テンプレート：`templates/*.json`（Online Store 2.0）／`sections/*.liquid` ／ `blocks/*.liquid`（Theme Blocks 含む）
- schema settings 主要型：text / textarea / richtext / image_picker / video / url / number / range / select / radio / checkbox / color / color_scheme / color_background / font_picker / collection / collection_list / product / product_list / blog / page / article / link_list / inline_richtext / liquid / html / header / paragraph
- block：section 内で繰り返し配置できる単位。`type` `name` `settings` `limit` を持つ
- preset：管理画面「セクションを追加」に登録するためのエントリ。default 設定値・blocks 初期配置を含む
- App Blocks：Theme App Extensions 経由でアプリが提供する block

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- セクションの目的（CVR向上／ブランド訴求／ナビゲーション など）
- 配置するテンプレート（home / product / collection / page / blog / article / cart）
- マーチャントが管理画面で触る項目（テキスト・画像・色・リンク先など）
- レスポンシブ要件（PC/SP の差分）
- 既存テーマ（Dawn / 別テーマ）

**Step 2. Section 全体構造の確定**
- Section名（管理画面表示名）
- 配置可能なテンプレート（`enabled_on.templates`）
- block の有無と種類

**Step 3. settings 設計（Section レベル）**
- マーチャントが触る項目を全て洗い出し
- 各項目に schema 型を割当（text / image_picker / select / range など）
- 初期値（default）と検証ルール

**Step 4. block 設計**
- block の種類（image_card / text_card / cta_card など）
- 各 block の settings
- 最大数（`max_blocks`）

**Step 5. preset 設計**
- 「セクションを追加」メニューでの初期配置
- 推奨初期 block 構成（3カードなど）

**Step 6. レスポンシブ仕様**
- PC（≥768px）／タブレット／モバイル（<768px）の差分
- カラム数・余白・フォントサイズ

**Step 7. 受け入れ条件（UAT）**
- マーチャント／QA／エンジニアが共通で使える判定基準

## 代表例（1パターン）

3カラム特徴セクション（home／product 両用）：
- Section名「特徴セクション 3カラム」
- Section settings：見出し（text）／背景色（color_scheme）／カラム配置（range 2-4）
- block種：「特徴カード」block settings：アイコン（image_picker）／タイトル（text）／本文（textarea）／リンク（url）
- max_blocks：6
- preset：3カード初期配置
- UAT：管理画面で見出し変更が即反映／モバイルで1カラム化／空block時は非表示

他例（バナー／グリッド／タブ）は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopify Section ブリーフ：[セクション名]

## 1. 概要
- 目的：
- 配置可能テンプレート：
- 対象テーマ：
- 想定マーチャント操作：

## 2. Section 仕様
- ファイル名：`sections/<name>.liquid`
- Section名（管理画面表示）：
- enabled_on.templates：

## 3. Section settings（管理画面項目）
| ラベル | type | id | default | 必須 | 備考 |
|---|---|---|---|---|---|
| 見出し | text | heading |  | ◯ |  |
| 背景色 | color_scheme | bg |  |  |  |

## 4. Block 仕様
- block type：`feature_card`
- 最大数（max_blocks）：

| ラベル | type | id | default | 必須 |
|---|---|---|---|---|
| アイコン画像 | image_picker | icon |  |  |
| タイトル | text | title |  | ◯ |
| 本文 | textarea | body |  |  |
| リンクURL | url | link |  |  |

## 5. Preset（初期配置）
```json
{
  "name": "特徴セクション 3カラム",
  "settings": { "heading": "選ばれる理由" },
  "blocks": [
    { "type": "feature_card", "settings": { "title": "理由1" } },
    { "type": "feature_card", "settings": { "title": "理由2" } },
    { "type": "feature_card", "settings": { "title": "理由3" } }
  ]
}
```

## 6. レスポンシブ仕様
| 画面幅 | カラム数 | 余白 | フォント |
|---|---|---|---|
| ≥1024 |  |  |  |
| 768-1023 |  |  |  |
| <768 |  |  |  |

## 7. アクセシビリティ
- 見出し階層：H2 / H3
- 画像 alt：必須／任意
- コントラスト：WCAG AA

## 8. パフォーマンス
- 画像 loading: lazy / eager
- 上限サイズ：

## 9. 受け入れ条件（UAT）
- [ ] 管理画面で見出しを変更すると即反映
- [ ] block を0個にすると非表示／プレースホルダー
- [ ] モバイルで1カラム化
- [ ] 空 block 時は非表示
- [ ] preset から追加した直後に正しい初期表示

## 10. 既知の制約・前提
- テーマバージョン：
- 競合 section との重複：
````

## 品質ゲート

- [ ] Section settings に id・type・default・必須フラグが揃っている
- [ ] block の max_blocks が明示されている
- [ ] preset が JSON 完全例で示されている
- [ ] レスポンシブ表が3画面幅以上ある
- [ ] UAT チェックリストが5項目以上
- [ ] 画像系 settings に alt 仕様が含まれる
- [ ] enabled_on.templates が明示されている
- [ ] schema の id が snake_case で重複していない

## エッジケース

- **既存テーマがレガシー（Online Store 1.0）**：Sections Everywhere が使えないため、配置可能範囲を限定する旨を仕様に明記
- **App Block を含む構成**：Theme App Extension 経由のため、特定アプリのインストールが前提として明記
- **block 順序の意味（タイムライン等）**：マーチャントが並び替えると意図が崩れるため、index 依存ロジックは避けるか明示
- **Section 単独で使えるが他 Section と組み合わせ前提**：依存関係を明文化（例：ヒーロー直下に置く前提）
- **Metafield 参照**：商品／コレクションの metafield を表示する場合は、対象 metafield 定義の有無を確認する手順を入れる（`shopify-metafields-structure` と連携）

詳細は `references/examples.md` を参照。

## 注意事項

- schema の id を後から変更すると既存ストアの設定が消える。リネームは avoid
- preset を変更しても既存配置済み Section には影響しない（新規追加時のみ）
- block の `type` 名はテーマ全体で一意である必要がある
- App Block は Theme App Extension 由来のため、テーマファイル側で type 指定不可
- Liquid のレンダリング順序とJSの読み込みタイミングを考慮（Section Group / dynamic sources）
- 最終的なschemaは Shopify CLI または Shopify Online Store 2.0 ドキュメントで検証

## references/ 一覧

- `references/sections-everywhere.md`：Sections Everywhere と Online Store 2.0
- `references/schema-settings-types.md`：schema settings 型 完全リスト
- `references/block-design.md`：block 設計
- `references/presets-and-default.md`：preset と default の使い分け
- `references/acceptance-criteria.md`：UAT テンプレ
- `references/examples.md`：Section ブリーフ実例集

## 参考公式情報源

- Shopify.dev「Section schema」「Theme architecture」「Theme blocks」
- Shopify Help Center「Online Store 2.0」「Sections」
- Shopify CLI ドキュメント

最新仕様は Shopify.dev のテーマアーキテクチャドキュメントで確認すること。
