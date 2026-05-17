# Shopify Search & Discovery アプリ

Shopify 公式の無料アプリ「Search & Discovery」で、コレクションページのフィルタ／サジェスト／関連商品を強化できる。

## できること

1. **コレクションのフィルタ**：価格／ベンダー／タグ／Metafield／オプションをフィルタとして表示
2. **検索のシノニム**：「美容液」=「セラム」のような同義語登録
3. **検索結果のリディレクト**：「ブランド名」検索でブランドページへ
4. **おすすめ商品**：商品ページの related products を上書き
5. **オートサジェスト**：検索バーの予測候補

## フィルタの設定

### 標準フィルタ

| 対象 | 説明 |
|---|---|
| Availability | 在庫あり／なし |
| Price | 価格範囲 |
| Product type | 商品タイプ |
| Vendor | ベンダー |
| Variant: option | バリアントオプション（色／サイズ） |
| Product tag | タグ |

### Metafield フィルタ

`custom.material` を「素材」フィルタとして登録可能。フィルタ可能な型：
- `single_line_text_field` / `list.single_line_text_field`
- `boolean`
- `number_integer` / `number_decimal`（範囲指定）
- `metaobject_reference`

設定手順：
1. Search & Discovery アプリを開く
2. Filters → Add filter
3. Metafield を選択
4. ラベル（マーチャント表示）を日本語で設定（例 `素材`）

### コレクション別フィルタ

コレクション単位で**異なるフィルタセット**を設定可能：
- スキンケアコレクション：成分・肌タイプ・容量
- アパレルコレクション：素材・サイズ・色

## シノニム（Synonyms）

検索クエリに対する同義語を登録：

| 検索語 | 同義語 |
|---|---|
| セラム | 美容液 |
| ノートPC | ノートパソコン, ラップトップ |
| メンズ | 男性, MEN |

→ 「セラム」で検索された時に「美容液」を含む商品もヒット。

## リダイレクト

検索クエリに対する強制リダイレクト：

| 検索語 | リダイレクト先 |
|---|---|
| 「お問合せ」 | `/pages/contact` |
| 「送料」 | `/pages/shipping` |
| 「ギフト」 | `/collections/gift` |

## おすすめ商品（商品ページ）

商品ページの related products をマーチャントが手動指定可能：
- 商品 A の関連商品 → 商品 B, C, D を手動で指定
- アルゴリズム任せから脱却して、編集者の意図を反映できる

## ブースト（特定商品を上位表示）

検索結果やコレクションで特定商品をブースト：
- 在庫切れ商品を最下位へ
- 新着商品を上位へ
- 価格帯で並べ替え

## 制約

- 一部の高度なフィルタ／パーソナライズは Plus プラン or 有料アプリ
- フィルタ反映には数分のキャッシュ時間
- 大量タグ／Metafield は管理画面の応答が重くなる

## テーマ側の Liquid 連動

Dawn theme は Search & Discovery のフィルタを自動的に出力。カスタムテーマの場合は `collection.filters` を Liquid で展開：

```liquid
{%- for filter in collection.filters -%}
  <fieldset class="filter-group">
    <legend>{{ filter.label }}</legend>
    {%- case filter.type -%}
      {%- when 'list' -%}
        {%- for value in filter.values -%}
          <label>
            <input type="checkbox" name="{{ value.param_name }}" value="{{ value.value }}" {%- if value.active -%}checked{%- endif -%}>
            {{ value.label }} ({{ value.count }})
          </label>
        {%- endfor -%}
      {%- when 'price_range' -%}
        <input type="number" name="{{ filter.min_value.param_name }}" value="{{ filter.min_value.value }}" placeholder="最小">
        <input type="number" name="{{ filter.max_value.param_name }}" value="{{ filter.max_value.value }}" placeholder="最大">
    {%- endcase -%}
  </fieldset>
{%- endfor -%}
```

## チェックリスト

- [ ] Search & Discovery アプリをインストール（無料）
- [ ] 主要 Metafield をフィルタとして登録
- [ ] フィルタ名を日本語で設定
- [ ] コレクション別の最適フィルタを設計
- [ ] シノニム登録（業界用語・略語）
- [ ] テーマで `collection.filters` を Liquid 出力
- [ ] 在庫切れ商品の表示順序（最下位 or 非表示）
