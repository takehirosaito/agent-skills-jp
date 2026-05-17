# セット商品・組商品・親子の構造

## 用語整理

ネクストエンジンには複数の「親子」概念がある。混同しないこと。

| 用語 | 意味 |
|---|---|
| セット商品（組商品） | 複数の単品を組み合わせて1販売単位とした商品 |
| バリエーション親 | 同一商品の色違い・サイズ違いの代表（楽天の項目選択肢の親） |
| 代表商品（daihyou_shouhin_code） | バリエーション親または販売単位の代表 |
| 在庫管理単位（stock_goods_id） | 在庫を実際に減算する商品 |

## 1. 単品商品

単純な構造：

```
goods_id: TSH-001-BLK-S
  set_flg: 0
  daihyou_shouhin_code: TSH-001-BLK-S（自身）
  stock_goods_id: TSH-001-BLK-S（自身）
  zaiko_su: 50
```

販売1個 → 在庫50→49

## 2. バリエーション商品（色×サイズ等）

楽天の「項目選択肢」、Amazonの「子ASIN」、Shopifyの「Variant」に相当。

```
代表商品 goods_id: TSH-001-PARENT（バリエーション親、in showcase）
  daihyou_shouhin_code: TSH-001-PARENT
  zaiko_su: 0（親は在庫を持たない設計が多い）
  set_flg: 0

子: goods_id: TSH-001-BLK-S（黒 S）
  daihyou_shouhin_code: TSH-001-PARENT
  stock_goods_id: TSH-001-BLK-S（自身）
  zaiko_su: 6
  set_flg: 0

子: goods_id: TSH-001-BLK-M（黒 M）
  daihyou_shouhin_code: TSH-001-PARENT
  stock_goods_id: TSH-001-BLK-M
  zaiko_su: 7

子: goods_id: TSH-001-BLK-L（黒 L）
  ...

... 計9SKU（黒/白/グレー × S/M/L）
```

- 親（TSH-001-PARENT）は「グルーピング」役で在庫を持たない
- 子（TSH-001-BLK-S 等）が実在庫を持つ
- 楽天の「項目選択肢別在庫」、Amazonの「子ASIN別quantity」と連動

## 3. セット商品（組商品）

複数の単品を組み合わせて販売。

例：「赤ペン1本＋青ペン1本のセット」

```
子A: goods_id: PEN-RED
  set_flg: 0
  stock_goods_id: PEN-RED
  zaiko_su: 50

子B: goods_id: PEN-BLUE
  set_flg: 0
  stock_goods_id: PEN-BLUE
  zaiko_su: 30

セット親: goods_id: PEN-SET-RB
  set_flg: 1
  daihyou_shouhin_code: PEN-SET-RB
  zaiko_su: 30（販売可能数=子の最小値）
  構成: PEN-RED ×1, PEN-BLUE ×1
```

販売動作：
- セット親 `PEN-SET-RB` が1個売れる
- 子A `PEN-RED` の在庫 50→49
- 子B `PEN-BLUE` の在庫 30→29
- セット親 `PEN-SET-RB` の販売可能数：min(49, 29) = 29

子Aの在庫が0になればセットも販売不可。

## 4. アソートセット（バリエーション組）

例：「Sサイズ・Mサイズ・Lサイズ各1枚の3枚セット」

```
子1: TSH-001-S（在庫20）
子2: TSH-001-M（在庫25）
子3: TSH-001-L（在庫15）

アソート親: TSH-001-ASSORT-SML
  set_flg: 1 または asssort_set_flg: 1
  構成: TSH-001-S ×1, TSH-001-M ×1, TSH-001-L ×1
  販売可能数: min(20, 25, 15) = 15
```

## 5. 同一商品を複数セットで使う

例：「赤ペン2本セット」と「赤ペン3本セット」が両方ある

```
子A: PEN-RED（在庫100）

セットA: PEN-SET-R2
  構成: PEN-RED ×2
  販売可能数: 100 ÷ 2 = 50

セットB: PEN-SET-R3
  構成: PEN-RED ×3
  販売可能数: 100 ÷ 3 = 33（小数点切り捨て）
```

PEN-SET-R2 が1個売れる → PEN-RED 100→98
PEN-SET-R3 が1個売れる → PEN-RED 98→95
PEN-RED の在庫が連動するので、セットAとセットBの販売可能数は相互に影響

## 6. 「stock_goods_id」の意味

`stock_goods_id` は「**この商品の在庫を、どの商品コードから引くか**」を指定する項目。

ケース1：単品商品（標準）
- goods_id = stock_goods_id = 自身

ケース2：表示SKUと在庫SKUが異なる
- 例：goods_id=`TSH-001-RAKUTEN`（楽天用表示SKU）
- stock_goods_id=`TSH-001`（共通在庫管理単位）
- → 楽天で売れたら共通在庫`TSH-001`から減る

ケース3：複数SKU で同一在庫を共有
- 例：複数モールで異なるSKU命名だが、物理在庫は1つ
- goods_id=`TSH-RKT-001`, goods_id=`TSH-AMZ-001`
- 両者の stock_goods_id=`TSH-001`
- → どちらが売れても`TSH-001`の在庫が減る

## 7. 循環参照の検出

NG例：
- A: daihyou_shouhin_code = B
- B: daihyou_shouhin_code = C
- C: daihyou_shouhin_code = A

→ 無限ループ。システムエラー。

検出方法：各商品の daihyou_shouhin_code をたどって、N回（例：10回）以内に自身に戻るかチェック。

## 8. 親子整合性の検査項目

- **daihyou_shouhin_code が存在するgoods_idを指しているか**
- **stock_goods_id が存在するgoods_idを指しているか**
- **set_flg=1 の商品に構成情報があるか**
- **循環参照がないか**
- **親（set_flg=1）のstock_goods_idは通常設定しない**（構成情報から自動算出）
- **バリエーション親自身が在庫を持っていないか**（持っていると二重カウントの可能性）

## 9. モール側の親子構造との対応

| ネクストエンジン | 楽天 | Amazon | Shopify |
|---|---|---|---|
| バリエーション親 goods_id | 商品管理番号（親） | parent_sku | Product Handle |
| バリエーション子 goods_id | 項目選択肢別SKU | child item_sku | Variant SKU |
| セット親 (set_flg=1) | 通常の商品管理番号 | 個別ASIN | 個別Product |
| セット構成（子） | 別商品 | 別ASIN | 別Variant or 別Product |

- 楽天の「項目選択肢」とネクストエンジンの「バリエーション」は概念が近いが、楽天は1商品管理番号配下に項目選択肢を持つ
- Amazonの「親子ASIN」もネクストエンジンの「バリエーション親子」と対応
- Shopifyの「Product と Variant」も同様

セット商品はモール側では「単品」として登録されることが多い。在庫はネクストエンジン側で構成計算する。

## 10. 親子設計のベストプラクティス

1. **バリエーション親は在庫を持たない**（zaiko_su=0、stock_goods_id=自身でなくダミーまたは未設定）
2. **子の在庫を実数で管理**
3. **セット親は構成情報のみ持ち、在庫は子から計算**
4. **stock_goods_id を活用してSKU表記の自由度と在庫管理の一元化を両立**
5. **循環参照を防ぐためにdaihyou_shouhin_codeは1段階で完結させる**（孫まで階層化しない）
6. **モール側のSKU命名と一致させる**（マッピング表を別途持つより、ネクストエンジン側で吸収）
