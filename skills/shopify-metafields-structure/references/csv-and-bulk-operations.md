# CSV・Matrixify・Bulk Operations API

Metafield の大量投入・既存データ移行のための実務手順。

## Shopify 標準 CSV（限定的）

Shopify 標準の Product CSV では **Metafield 列を直接含められない**。
（Standard product metafields の一部は CSV エクスポートに含まれるようになったが、カスタム metafield は対象外）

→ 大量投入は **Matrixify**（旧 Excelify）/ **Bulk Operations API** / **Shopify Bulk Editor** のいずれか。

## Matrixify（推奨）

### CSV 列の書き方

```
Handle,Title,Metafield: custom.material [single_line_text_field],Metafield: custom.shelf_life_months [number_integer]
sample-1,商品A,本革,24
sample-2,商品B,綿,
```

ヘッダーの形式：

```
Metafield: <namespace>.<key> [<type>]
```

### list 変種の値

```
Metafield: custom.related_products [list.product_reference]
gid://shopify/Product/12345,gid://shopify/Product/67890
```

複数値はカンマ区切り（同一セル内）。

### json 型の値

```
Metafield: custom.size_chart [json]
"{""S"":""22-23"",""M"":""23-24"",""L"":""24-25""}"
```

CSV ではダブルクオートをエスケープ（`""`）。

### file_reference の値

```
Metafield: custom.size_guide [file_reference]
gid://shopify/MediaImage/12345
```

事前に Files にアップロード → MediaImage ID を取得 → CSV で参照。

### Metaobject reference の値

```
Metafield: custom.brand [metaobject_reference]
gid://shopify/Metaobject/12345
```

### rich_text_field の値

```
Metafield: custom.how_to_use [rich_text_field]
"{""type"":""root"",""children"":[{""type"":""paragraph"",""children"":[{""type"":""text"",""value"":""...""}]}]}"
```

Matrixify は rich_text を **JSON 構造で受け付ける**。プレーンテキストを入れると無効化されるため注意。

## Bulk Operations API（GraphQL）

大規模・自動化向け。

```graphql
mutation {
  bulkOperationRunMutation(
    mutation: """
      mutation call($input: ProductInput!) {
        productUpdate(input: $input) { product { id } userErrors { field message } }
      }
    """
    stagedUploadPath: "tmp/products.jsonl"
  ) {
    bulkOperation { id status }
    userErrors { field message }
  }
}
```

JSONL ファイルの中身（1行1商品）：

```jsonl
{"input":{"id":"gid://shopify/Product/12345","metafields":[{"namespace":"custom","key":"material","type":"single_line_text_field","value":"本革"}]}}
```

## Shopify Bulk Editor（管理画面）

- 商品一覧 → 複数選択 → Bulk Edit
- 列に metafield を追加
- 大量編集可能（ただし数百件まで）

小規模ならこれで十分。

## 既存タグからの移行手順

旧来「タグで素材を管理」していたケース：

1. **タグ一覧を取得**：CSV エクスポート、tags 列をユニーク化
2. **Metafield definition 作成**：`custom.material` を single_line_text_field で
3. **マッピングシート作成**：`material:leather` タグ → `material = "本革"`
4. **CSV で一括上書き**（Matrixify）
5. **テーマで Metafield を表示**
6. **タグ削除**（テーマで使われていないことを確認後）

## エクスポート（バックアップ）

Matrixify で全 metafield をエクスポート：

- Format: Excel / CSV
- 「Include all metafields」をON
- 取得した CSV を変更履歴として保管

## レートリミット

| 経路 | レート |
|---|---|
| REST API | 2 req/sec（標準）／40 req/sec（Plus） |
| GraphQL API | コストベース（複雑なクエリほど高コスト） |
| Bulk Operations API | バックグラウンド処理、レート消費なし |
| Matrixify | 内部でレート制御 |

大量投入は **Bulk Operations API** または **Matrixify** が安全。

## バリデーション違反時の挙動

- definition で `min length 5` を設定した metafield に3字の値を投入：エラーで投入失敗
- type 不一致：投入失敗
- 参照先リソースが存在しない（product_reference で削除済みID）：null として保存される

→ **CSV投入前にバリデーション設定を再確認**。

## トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| CSV投入したのにテーマで表示されない | namespace/key が一致していない | Liquid の `{{ product.metafields.custom.material }}` と CSV列の名前を一致 |
| rich_text_field がプレーン表示 | type が text系で投入された | json 構造で投入し直す |
| list変種が単一値しか入らない | type が list.* でない definition | definition を新規作成 |
| 参照型で「不明なリソース」表示 | 参照先ID が無効 | gid 形式（`gid://shopify/Product/...`）を確認 |

## チェックリスト

- [ ] CSV 列ヘッダが `Metafield: namespace.key [type]` の形式
- [ ] list 変種は同一セル内カンマ区切り
- [ ] rich_text は JSON 構造で投入
- [ ] file / reference 型は gid 形式
- [ ] バックアップ CSV を保管
- [ ] 投入後の検証（数件 Liquid 表示テスト）
