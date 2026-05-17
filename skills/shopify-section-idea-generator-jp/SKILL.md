---
name: shopify-section-idea-generator-jp
description: Shopifyテーマに追加するSectionアイデアを業種別・目的別に企画提案するスキル。「Sectionアイデア」「セクション提案」「Shopifyのセクション案」「テーマカスタマイズ案」「どんなセクションを追加すべき」「商品ページの構成提案」「トップページ構成」「Dawn theme カスタム案」「業種別Section」「目的別Section」「App Block 検討」など、Shopifyのストアにどんなセクションを追加すれば良いかの企画段階リクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆる業種に対応し、Dawn 標準で済むか／カスタム実装が必要か／App Blockで代替可能かまで判定する。※実装段階の詳細仕様書は別スキル `shopify-liquid-section-brief`、画像LPからの実装ブリーフは `shopify-lp-from-image-brief`、Metafield設計は `shopify-metafields-structure`。
verified_at: 2026-05
---

# Shopify Section アイデア企画スキル

## 概要

Shopifyテーマに **どんなSectionを追加すれば良いか** を業種・目的・優先度の3軸で企画提案するスキル。

Dawn テーマ標準で済むセクション／カスタム実装が必要なセクション／App Block で代替できるセクションを判定し、業種別の最優先Section・目的別Section・実装難易度を統合したリストで提案する。

実装段階に進むときは別スキル `shopify-liquid-section-brief` で詳細仕様書化する。

## ★最重要原則

**「Dawn 標準 → App Block → カスタム実装」の順で検討する**。標準で済む Section を最初からカスタム実装するのは過剰投資。最初に「Dawn 標準で代替可能か」「無料／有料 App Block で代替可能か」を判定してから、カスタムが必要な Section だけを残す。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| Dawn theme 標準 section 一覧 | `references/dawn-default-sections.md` |
| Section アイデア 50案カタログ | `references/section-catalog-50.md` |
| 業種別 最優先 Section | `references/by-industry-priorities.md` |
| 目的別 Section（CVR向上／LTV向上 等） | `references/by-purpose-sections.md` |
| 実装難易度の判定基準 | `references/difficulty-criteria.md` |
| App Block 活用の判断 | `references/app-blocks-strategy.md` |
| 業種別 Section 構成 実例集 | `references/examples.md` |

### Shopify Section の要点

- Dawn 標準 section：image with text / featured collection / multicolumn / collage / rich text / image banner / slideshow / video / collection list / collapsible content / product / featured product / contact form / newsletter / email signup / search / blog posts 等
- カスタム section：Online Store 2.0 で `sections/*.liquid` を追加して `{% schema %}` で settings 定義
- App Block：Theme App Extension のアプリが提供（レビュー／Wishlist／クーポン／ライブチャット）
- 配置先：home / product / collection / page / blog / article / cart のいずれか

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- 業種／商品カテゴリ
- ストアフェーズ（立ち上げ／成長期／成熟）
- 主要課題（認知不足／CVR低／LTV低／リピート低）
- 既存テーマ（Dawn / 他）
- 予算（標準のみ／一部カスタム可／フルカスタム可）
- 主要流入（広告／オーガニック／メール）

**Step 2. 配置先テンプレートを決定**
- home / product / collection / page / blog / cart のどこか
- 複数テンプレへの汎用 Section か、特定 Section 専用か

**Step 3. 業種別 最優先 Section を提示**
- 化粧品：成分・使い方・Before/After（薬機法注意）・レビュー
- 食品：原料・産地・栄養成分・賞味期限
- ファッション：サイズ表・コーデ・素材
- 家電：スペック比較・適用条件
- サプリ：成分量・摂取目安・注意事項

**Step 4. 目的別 Section を提示**
- CVR向上：sticky CTA・FAQ・在庫表示・配送日・社会的証明
- AOV向上：セット販売・Add-on・購入数による割引
- LTV向上：定期購入・関連商品・レビュー後フォロー
- 信頼向上：ブランドストーリー・メディア掲載・受賞歴

**Step 5. Dawn標準／App Block／カスタムの判定**
- 各 Section に対して「Dawn標準で済む / App Blockで済む / カスタム必要」を判定

**Step 6. 実装難易度・優先度を付与**
- 難易度ランク S（Dawn即時）／A（schema追加のみ）／B（Liquid＋CSS）／C（JS必要）／D（外部API）
- 優先度 高／中／低

**Step 7. 配置順序とテンプレート別マップ**
- home / product / collection ページの推奨上下構成

## 代表例（1パターン）

化粧品ブランド（敏感肌向け 30商品 / 立ち上げ期）：
- home：①ヒーロー（標準） ②選ばれる理由3カラム（カスタム要） ③ベストセラー（標準） ④肌悩み別ナビ（カスタム要） ⑤ブランドストーリー（標準）⑥レビュー（App Block）
- product：①商品メイン（標準） ②成分一覧（カスタム要） ③使い方ステップ（カスタム要） ④FAQ（標準 collapsible） ⑤関連商品（標準）⑥レビュー（App Block）
- 優先度高：成分一覧・使い方ステップ・肌悩み別ナビ

他業種（食品・ファッション・家電・サプリ）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopify Section アイデア提案：[ストア／業種]

## 1. ストア概要・前提
- 業種：
- フェーズ：
- 主要課題：
- 既存テーマ：
- 予算感：

## 2. 業種別 最優先 Section
| # | Section名 | 目的 | 配置先 | 優先度 |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |

## 3. 目的別 Section 提案
### CVR向上
| Section | 効果 | 配置先 |
|---|---|---|

### AOV向上
| Section | 効果 | 配置先 |
|---|---|---|

### LTV向上
| Section | 効果 | 配置先 |
|---|---|---|

## 4. Section 詳細リスト
| # | Section名 | 配置先 | 種別 | 難易度 | 優先度 | 備考 |
|---|---|---|---|---|---|---|
| 1 | ヒーロー | home | Dawn標準 | S | 高 |  |
| 2 | 成分一覧 | product | カスタム | B | 高 | metafield連携必要 |
| 3 | レビュー | product | App Block | A | 高 | Judge.me 等 |

## 5. テンプレート別 推奨配置順
### home
1.
2.
3.

### product
1.
2.
3.

### collection
1.
2.
3.

## 6. 実装ロードマップ
| Phase | 期間 | 実装Section | 想定工数 |
|---|---|---|---|
| Phase 1 | 1-2週 |  |  |
| Phase 2 | 3-4週 |  |  |
| Phase 3 | 1-2ヶ月 |  |  |

## 7. App Block 推奨アプリ
| 機能 | アプリ候補 | 月額 | 備考 |
|---|---|---|---|
| レビュー |  |  |  |
| Wishlist |  |  |  |
| 定期購入 |  |  |  |

## 8. 次ステップ
- カスタム Section の詳細仕様化は `shopify-liquid-section-brief` で実施
- LP 画像からの実装は `shopify-lp-from-image-brief` で実施
- データ構造化が必要な Section は先に `shopify-metafields-structure` で metafield 設計
````

## 品質ゲート

- [ ] 業種別の最優先 Section が3-7個ある
- [ ] 目的別 Section が3つ以上の目的軸（CVR/AOV/LTV/信頼）で提示されている
- [ ] 各 Section に「Dawn標準／App Block／カスタム」の判定がある
- [ ] 実装難易度（S/A/B/C/D）が全 Section にある
- [ ] テンプレート別の配置順序が提示されている
- [ ] 実装ロードマップが Phase 分割されている
- [ ] App Block 推奨アプリに月額・代替案がある
- [ ] 過剰提案（10案以上の優先度高）になっていない

## エッジケース

- **既存テーマが Dawn 以外**：そのテーマで標準提供される Section と比較する旨を注記し、Dawn標準前提の判定は仮として扱う
- **Shopify Plus**：Checkout Extension で追加 Section が可能なため、checkout 向けセクションを別途提示
- **B2B / Markets Pro**：価格非表示・見積依頼・卸価格表示 Section など B2B 特有を優先
- **薬機法対象（化粧品・健康食品）**：Before/After・効能訴求 Section は法務クロスチェック必須と注記、`yakki-keihyo-expression-check` を案内
- **既に大量のカスタム Section がある**：新規追加ではなく整理・統合の提案を優先
- **App Block の競合**：似た機能の App が複数ある場合は、ロード負荷・サポート品質・日本語対応で選定

詳細は `references/examples.md` を参照。

## 注意事項

- Section を増やすほどテーマのカスタマイズ画面が複雑化し、運用負荷が上がる。10個以上の同時提案は避ける
- App Block を多用するとパフォーマンスが落ちる（外部スクリプト多数）。LCP / CLS を計測して判断
- Dawn 標準 section の機能はテーマアップデートで変わることがある。最新の Dawn リポジトリで要確認
- カスタム Section はテーマアップデート時に手動マージが必要。コア改変は避け、Section ファイルで完結
- 業種別最優先 Section は業界平均的な提案。自社の差別化要素を加味して絞る
- 公式仕様は変動するため、最終は Shopify.dev / Theme Store で確認

## references/ 一覧

- `references/dawn-default-sections.md`：Dawn theme 標準 section 一覧
- `references/section-catalog-50.md`：Section アイデア 50案カタログ
- `references/by-industry-priorities.md`：業種別 最優先 Section
- `references/by-purpose-sections.md`：目的別 Section
- `references/difficulty-criteria.md`：実装難易度の判定基準
- `references/app-blocks-strategy.md`：App Block 活用の判断
- `references/examples.md`：業種別 Section 構成実例集

## 参考公式情報源

- Shopify.dev「Theme architecture」「Sections」「Theme App Extensions」
- Shopify Dawn theme リポジトリ（GitHub: Shopify/dawn）
- Shopify Theme Store

最新仕様は Shopify.dev および Dawn の最新リリースで確認すること。
