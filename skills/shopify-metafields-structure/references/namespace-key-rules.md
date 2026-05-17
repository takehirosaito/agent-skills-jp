# 名前空間・キー命名規則

## namespace（名前空間）の役割

namespace は metafield の所有者を識別する領域。同じ key でも namespace が違えば別物として扱われる。

例：
- `custom.material` ← ストア独自で設定した素材
- `app--12345--material` ← アプリが自動投入した素材
- `shopify.material` ← Shopify標準カテゴリの素材

## 予約 namespace

| namespace | 用途 | ユーザー操作 |
|---|---|---|
| `shopify` | Shopify Standard product metafields（標準カテゴリ属性） | 触らない（管理画面の「Category」で自動付与） |
| `app--<app-id>--<...>` | インストール済みアプリ専用 | 触らない（アプリが管理） |
| `app:<app-id>:...` | 旧アプリ namespace | 触らない |

→ **ユーザーが手動で値を入れる namespace は `custom` を推奨**。それ以外（独自 namespace）も可能だが、アプリと衝突しないよう注意。

## namespace と key の命名規則

| 項目 | ルール |
|---|---|
| 文字種 | 英小文字、数字、アンダースコア（`_`）、ハイフン（`-`） |
| 大文字 | 不可 |
| 長さ | namespace 3-255字、key 3-64字 |
| 区切り | namespace と key は `.` で連結（例 `custom.material`） |

### OK例

- `custom.material`
- `custom.size_chart`
- `custom.related_products`
- `mybrand.private_label_info`

### NG例

- `Custom.Material`（大文字）
- `custom.size chart`（スペース）
- `custom.素材`（日本語）
- `custom.m`（短すぎ、3字未満）

## key の命名規約（実務推奨）

### 単数形 vs 複数形

| 型 | 推奨 |
|---|---|
| 単一値（`single_line_text_field` 等） | 単数形：`material`、`color` |
| list変種 | 複数形：`related_products`、`faq_items` |
| boolean | 形容詞 or 動詞：`is_gift_wrappable`、`requires_signature` |

### 接頭辞

複数の集合を扱う場合は接頭辞でグルーピング：

- `spec_weight_g`
- `spec_volume_ml`
- `spec_country_origin`
- `faq_q1`
- `faq_a1`

ただし、構造化したいなら **Metaobject 化** の方が運用しやすい（FAQ はその典型）。

## 標準 Metafields（Shopify Standard product metafields）

`shopify` namespace にある標準カテゴリ属性。商品の Category を設定すると自動で利用可能になる。

例：
- `shopify.color-pattern`
- `shopify.material`
- `shopify.size`
- `shopify.target-gender`

これらを利用すると **Shopping channel（Google Merchant Center連携）** と Search & Discovery のフィルタが自動連動する。手動 `custom.material` と二重持ちにしないように注意。

## 名前空間設計のパターン

### パターンA：`custom` 単一（小規模）

```
custom.material
custom.size_chart
custom.faq
```

シンプル、迷わない。小〜中規模ストアに推奨。

### パターンB：`custom` ＋ 独自 namespace（中〜大規模）

```
custom.material         ← 商品共通の基本属性
brand_x.lookbook_url    ← ブランド固有
b2b.wholesale_price     ← B2B専用
```

ブランド／B2B／海外向けで明確に分離したい場合。

### パターンC：機能別 namespace

```
seo.canonical_url
seo.title_override
shipping.requires_signature
shipping.cold_chain
```

機能で分けると、テーマ実装側が「seo.* を全て取得」のループで処理できる。

## キーの一貫性チェックリスト

- [ ] 単数形／複数形のルールが統一されている
- [ ] 略語と正式名称が混在していない（`mat` と `material`）
- [ ] 大文字／アンダースコア／ハイフンのルールが統一
- [ ] 似た意味の key が複数存在しない（`size` と `dimensions` の併用に注意）
- [ ] 一覧として運用ドキュメントに記録されている

## API・GraphQL での扱い

GraphQL Admin API での metafield 識別：

```graphql
metafield(namespace: "custom", key: "material") {
  value
  type
}
```

API 経由で値を入れるとき、namespace + key + type の3つ全てを指定する。definition が未作成でも値は入るが、**管理画面に表示されず保守不能** になるため事前定義必須。

## 変更可否

| 変更項目 | 可否 |
|---|---|
| namespace | 不可（新規作成して移行） |
| key | 不可（同上） |
| type | 不可（最重要） |
| バリデーション | 可（既存値が違反する場合は警告） |
| 表示名（admin label） | 可 |
| 説明（description） | 可 |

→ **namespace / key / type の3つは初期設計が全て**。
