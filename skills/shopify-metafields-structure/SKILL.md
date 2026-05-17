---
name: shopify-metafields-structure
description: ShopifyのMetafield／Metaobjectのデータ構造を設計するスキル。「Metafield設計」「メタフィールド」「Metaobject」「成分情報の構造化」「サイズ表メタフィールド」「FAQメタフィールド」「商品スペック構造化」「名前空間設計」「namespace」「カスタム属性」「商品カスタムフィールド」「Matrixify」「Bulk Operations」「メタフィールド一括登録」など、Shopify商品／コレクション／顧客／注文／ページ等にカスタム属性を追加するデータ構造設計のリクエストで必ずこのスキルを使う。化粧品・食品・ファッション・家電・サプリ等あらゆるジャンルに対応。※Liquid表示実装のセクション仕様書は別スキル `shopify-liquid-section-brief`、コレクションSEOは `shopify-collection-seo-builder`、商品ページSEOは `shopify-product-page-seo-jp`。
verified_at: 2026-05
---

# Shopify Metafields / Metaobjects 構造設計スキル

## 概要

Shopifyの **Metafield（リソース紐付けカスタム属性）** および **Metaobject（独立カスタムエンティティ）** のデータ構造を設計するスキル。

商品スペック・成分・サイズ表・FAQ・産地・原料リスト等を、適切な名前空間（namespace.key）・型・参照関係で設計し、Liquid 表示パターン・CSV一括投入・Markets/翻訳対応・既存データ移行までを統合した仕様書を出力する。

## ★最重要原則

**「リソース固有属性は Metafield、複数リソースから参照する再利用エンティティは Metaobject」を最初に判定する**。商品ごとに違う成分は metafield。複数商品から参照する「成分マスタ」は metaobject。判定を誤ると後で大規模な移行が必要になる。

## 知識ベース

要点のみ本ファイル。詳細は `references/` を参照。

| トピック | 参照ファイル |
|---|---|
| Metafield 型 完全リスト（23+種類） | `references/metafield-types.md` |
| namespace / key 命名規則 | `references/namespace-key-rules.md` |
| Metaobject 設計（独立エンティティ） | `references/metaobjects-design.md` |
| Liquid 呼び出し・空欄処理パターン | `references/liquid-access-patterns.md` |
| CSV / Matrixify / Bulk Operations API | `references/csv-and-bulk-operations.md` |
| Markets と Translate & Adapt（多言語対応） | `references/markets-translation.md` |
| ジャンル別 Metafields 設計 実例集 | `references/examples.md` |

### Metafield 固有の要点

- 構造：`<namespace>.<key>`（例 `custom.material`）
- 主要型：single_line_text_field / multi_line_text_field / number_integer / number_decimal / date / date_time / url / boolean / color / weight / volume / dimension / rating / money / json / rich_text_field / file_reference / product_reference / variant_reference / collection_reference / metaobject_reference
- list 変種：上記の多くに list 版がある（list.single_line_text_field など）
- リソース：product / variant / collection / customer / order / blog / article / page / shop
- 検証ルール：min/max、選択肢、ファイルタイプ等を definition で指定
- Standard definitions：Shopify が事前定義する標準メタフィールド（color / size / material 等）を優先採用

## 処理フロー

**Step 1. 入力情報の確認（不足は仮定で進める）**
- 対象リソース（商品／コレクション／顧客 etc）
- 表現したいデータ項目（成分・サイズ表・FAQ・産地など）
- データ件数の規模（数千SKU、数万SKU）
- 表示先（商品ページ／コレクション／ブログ）
- 既存データの有無（CSV／別ECからの移行）
- 多言語ストア（Markets）の有無

**Step 2. Metafield vs Metaobject を判定**
- リソース固有 → Metafield
- 複数リソースから参照する再利用エンティティ → Metaobject
- 例：「商品ごとに違う成分」=metafield、「成分マスタを商品から参照」=metaobject

**Step 3. namespace / key 命名規則の決定**
- namespace：`custom.*` がデフォルト。アプリ別は `<app>.*`
- key：snake_case、英語、リソース横断で意味が通じる名前

**Step 4. 型と検証ルールを決定**
- データ性質から最適型を選択
- list 化の判断（成分・タグ・サイズ展開は list が便利）
- Standard definitions を優先採用

**Step 5. Metaobject の場合はフィールド構成を設計**
- 各 metaobject に持たせるフィールド一覧
- 商品からの `metaobject_reference` 参照関係

**Step 6. Liquid 表示パターン設計**
- `{{ product.metafields.custom.<key> }}` の呼び出し
- 空欄時のフォールバック
- list 型の `for` ループ
- metaobject の `for entry in product.metafields.custom.entries.value` パターン

**Step 7. CSV / Matrixify 投入計画**
- 列名規則（`Metafield: custom.material [single_line_text_field]`）
- 既存データのマッピング
- 検証ルールの事前確認

**Step 8. Markets / 翻訳対応**
- 翻訳対象（text系は翻訳対象、reference系は値も翻訳要否）

## 代表例（1パターン）

化粧品ブランドの成分・サイズ・FAQ 設計：
- 商品 metafield：`custom.ingredients`（list.single_line_text_field）／`custom.usage_steps`（rich_text_field）／`custom.product_size_ml`（number_integer）
- Metaobject「ingredient」：name（text）／description（text）／allergen（boolean）
- 商品から `custom.ingredients_detailed`（list.metaobject_reference → ingredient）で参照
- Liquid：`{% for ing in product.metafields.custom.ingredients_detailed.value %}`

他ジャンル（食品・ファッション・家電・サプリ）の実例は `references/examples.md` を参照。

## 出力フォーマット（必須）

````markdown
# Shopify Metafields 設計：[ブランド／商品カテゴリ]

## 1. 概要
- 対象リソース：
- 主用途：
- データ規模：
- 表示先：

## 2. Metafield vs Metaobject 判定
| 項目 | 種別 | 理由 |
|---|---|---|
| 成分 | metafield (list.text) | 商品固有 |
| 成分マスタ | metaobject | 再利用 |

## 3. Metafield 定義一覧
| リソース | namespace.key | name | type | list | description | validation |
|---|---|---|---|---|---|---|
| product | custom.material | 素材 | single_line_text_field | - |  | 1-100字 |
| product | custom.ingredients | 成分 | single_line_text_field | list |  | min1 |
| product | custom.weight_g | 重量(g) | number_integer | - |  | 0-100000 |

## 4. Metaobject 定義
### Metaobject: ingredient
| field | type | required | description |
|---|---|---|---|
| name | single_line_text_field | ◯ |  |
| description | multi_line_text_field |  |  |
| allergen | boolean |  |  |

## 5. 参照関係
- `product.metafields.custom.ingredients_detailed` → list.metaobject_reference (ingredient)

## 6. Liquid 表示パターン
```liquid
{% if product.metafields.custom.ingredients_detailed != blank %}
  <ul>
    {% for ing in product.metafields.custom.ingredients_detailed.value %}
      <li>{{ ing.name }}{% if ing.allergen %}（アレルゲン）{% endif %}</li>
    {% endfor %}
  </ul>
{% endif %}
```

## 7. CSV / Matrixify 投入
- 列名規則：
- サンプル行：
- 投入前検証：

## 8. Markets / 翻訳対応
| metafield | 翻訳対象 | 備考 |
|---|---|---|

## 9. 既存データ移行手順
- ステップ1：
- ステップ2：

## 10. アクセス権限・公開設定
- ストアフロント API 公開（Storefront access）：on / off
- Admin API のみ：
````

## 品質ゲート

- [ ] Metafield と Metaobject の使い分けが明示されている
- [ ] 全 metafield に namespace.key・type・list有無・validation がある
- [ ] Liquid 表示コードに空欄処理（`!= blank`）が含まれている
- [ ] Metaobject の参照関係が明確
- [ ] CSV 投入の列名規則が Shopify 標準形式
- [ ] Markets 利用時の翻訳対象が判定されている
- [ ] Standard definitions の活用可否を判定済み
- [ ] namespace に `custom.*` 以外を使う場合は理由がある

## エッジケース

- **大量SKU（5万件超）の一括投入**：Matrixify ではなく Bulk Operations API で投入。料金・時間試算を提示
- **既存データが多言語**：Markets + Translate & Adapt の翻訳対象になる型と、ならない型を仕分け
- **画像／PDF を metafield に保存**：`file_reference` 型を使う。Shopify CDN URL になるためテーマで `{{ file | image_url }}` の処理
- **list 型の並び順を維持したい**：Shopify は list の順序を保持するが、CSV 投入時に区切り記号を間違えない（Matrixify は `;` 区切り）
- **metafield definition を後から変更**：型変更は既存データを破壊する。新 metafield を追加→データ移行→旧 metafield を削除の手順
- **Storefront API 公開設定**：ヘッドレス／PWA で必要なら必ず ON、それ以外は OFF（情報漏洩防止）

詳細は `references/examples.md` を参照。

## 注意事項

- 一度作成した metafield definition の `type` 変更は破壊的。新 metafield で代替する
- namespace `custom.*` 以外は将来の Shopify 標準アップデートで衝突するリスクあり
- Metaobject はストア当たり最大エントリ数の制約あり（プラン依存）。最新仕様を確認
- list 型は GraphQL 取得時の上限がある。大量の list はパフォーマンスに注意
- Markets 配下で翻訳対象にする場合は、`Translate & Adapt` で metafield を翻訳許可する必要
- 公式仕様は変動するため、最終的に Shopify.dev / 管理画面の Metafield definition で要確認

## references/ 一覧

- `references/metafield-types.md`：Metafield 型 完全リスト
- `references/namespace-key-rules.md`：namespace / key 命名規則
- `references/metaobjects-design.md`：Metaobject 設計
- `references/liquid-access-patterns.md`：Liquid 呼び出しパターン
- `references/csv-and-bulk-operations.md`：CSV / Matrixify / Bulk Operations
- `references/markets-translation.md`：Markets と Translate & Adapt
- `references/examples.md`：ジャンル別実例集

## 参考公式情報源

- Shopify.dev「Metafields」「Metaobjects」「Standard metafield definitions」
- Shopify Help Center「Metafields」「Translate & Adapt」
- Matrixify 公式ドキュメント

最新仕様は Shopify.dev のメタフィールドリファレンスで確認すること。
