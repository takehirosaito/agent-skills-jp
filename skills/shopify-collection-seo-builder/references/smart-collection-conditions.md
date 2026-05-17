# Smart Collection 条件設定

Smart Collection は **条件を満たす商品を自動的に組み入れる** コレクション。手動で1商品ずつ追加する手間が不要だが、条件設計を誤ると意図しない商品が混入する。

## 条件項目

| 条件 | 比較演算子 | 値の型 | 例 |
|---|---|---|---|
| `Product title` | contains / not contains / starts with / ends with / equals / not equal | string | "美容液" を含む |
| `Product type` | equals / not equal | string | "Skincare" |
| `Product vendor` | equals / not equal | string | "Bloom Petal" |
| `Product price` | =, <, >, <=, >=, between | number | <= 5000 |
| `Product tag` | equals / not equal | string | "新着" |
| `Product weight` | =, <, >, between | number | < 1kg |
| `Compare at price` | =, <, > | number | > Product price（セール中） |
| `Inventory stock` | =, <, > | number | > 0（在庫あり） |
| `Variant title` | equals / contains | string | "M" |

## マッチ条件

- **All conditions**（AND）：全ての条件を満たす商品
- **Any condition**（OR）：いずれかを満たす商品

## 設計のベストプラクティス

### 1. タグの命名規則を統一

`新着` `New` `新作` が混在していると、Smart Collection が漏れる。
- タグは英数小文字を基本（`new` `bestseller` `sale`）
- 日本語タグを使う場合は表記揺れ防止のため定型リスト管理
- タグの命名ルールを CSV / Google Sheets で記録

### 2. 階層を意識した設計

| 階層 | 条件 |
|---|---|
| 大カテゴリ（スキンケア） | `Product type = "Skincare"` |
| 中カテゴリ（美容液） | `Product type = "Serum"` |
| 小カテゴリ（敏感肌向け美容液） | `Product type = "Serum"` AND `tag contains "sensitive-skin"` |
| キャンペーン（夏セール対象） | `tag = "summer-sale-2025"` |

### 3. price 条件は注意

```
Product price <= 5000
```

→ 為替や Markets で多通貨配信していると、通貨単位で挙動が変わる。**ストア基準通貨（JPY）で評価される**ことに注意。

### 4. compare_at_price でセールコレクション

```
Compare at price > Product price
```

→ セール中（参考価格 > 販売価格）の商品を自動抽出。

### 5. 在庫切れを除外

```
Inventory stock > 0
```

→ ただし、**Out of stock variants only** など特殊条件は Search & Discovery 側で。

## 制約

- **1コレクションあたり条件は最大10個**
- 条件評価は **商品保存／更新時に反映**（リアルタイムではないケースあり）
- 数千件を超える商品は Search & Discovery の絞り込みと併用推奨

## 手動 Collection との使い分け

| 用途 | Smart | 手動 |
|---|---|---|
| 大カテゴリ（数百-数千件） | ✅ | △ |
| 中カテゴリ（数十-数百件） | ✅ | ✅ |
| キャンペーン（数件-数十件、厳選） | △ | ✅ |
| 表示順を強く制御したい | △ | ✅（manual sort） |
| 編集者の意図を反映 | △ | ✅ |

## 混在パターン

- 大カテゴリは Smart で広く取得
- 「編集者おすすめ」は別 Smart Collection（特定タグで絞り込み）
- ヒーローバナーの推し商品だけ手動 Collection

## CSV / API 設定

GraphQL Admin API で Smart Collection 条件を作成可能。CSV 取り込みでは Smart Collection 自体は管理画面操作が必要（条件設定は API or 管理画面）。

## トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| 商品が表示されない | タグ表記揺れ / 条件が厳しすぎる | タグ正規化、条件を緩める |
| 意図しない商品が混入 | 条件が緩い / All と Any の選択ミス | 条件追加、AND/OR 見直し |
| 反映が遅い | 大量更新後のキュー処理待ち | 数分〜数十分待つ |
| 在庫切れも表示される | Inventory stock 条件未設定 | `> 0` を追加 |

## チェックリスト

- [ ] 条件のタグ／ベンダー／タイプが**実際の商品データと一致**
- [ ] All vs Any が意図通り
- [ ] 在庫切れ除外（必要時）
- [ ] price は基準通貨（JPY）で評価
- [ ] 条件数が10以内
- [ ] 反映後にサンプル商品が含まれているか確認
