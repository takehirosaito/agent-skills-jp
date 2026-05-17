# item_type のカテゴリ別代表値

`item_type` はカテゴリ固有のENUM。自由入力するとエラー。最新の値は Amazon セラーセントラル「ブラウズツリーガイド」のカテゴリ別シートから取得。

ここでは代表的なカテゴリの `item_type` 値の例を示す。**実際の登録時はテンプレートから正確な値を確認**。

## 家電・生活家電

| 想定商品 | item_type の例 |
|---|---|
| コードレス掃除機 | `vacuum-cleaner` |
| 空気清浄機 | `air-purifier` |
| ドライヤー | `hair-dryer` |
| 電気ケトル | `electric-kettle` |
| 電子レンジ | `microwave-oven` |
| 冷蔵庫 | `refrigerator` |
| 洗濯機 | `washing-machine` |

## キッチン家電

| 想定商品 | item_type の例 |
|---|---|
| コーヒーメーカー | `coffee-maker` |
| 炊飯器 | `rice-cooker` |
| トースター | `toaster-oven` |
| ブレンダー | `blender` |
| フードプロセッサー | `food-processor` |

## PC・周辺機器

| 想定商品 | item_type の例 |
|---|---|
| ノートPC | `laptop-computer` |
| モニター | `monitor` |
| キーボード | `keyboard` |
| マウス | `mouse` |
| 外付けHDD | `external-hard-drive` |
| USB Cable | `cable` |

## カメラ

| 想定商品 | item_type の例 |
|---|---|
| ミラーレス一眼 | `digital-camera` |
| レンズ | `camera-lens` |
| 三脚 | `tripod` |
| バッテリー | `camera-battery` |

## コスメ・ビューティ

| 想定商品 | item_type の例 |
|---|---|
| 化粧水 | `face-toner` または `lotion` |
| 美容液 | `face-serum` |
| クリーム | `face-cream` または `body-cream` |
| シャンプー | `shampoo` |
| 香水 | `perfume` |
| 口紅 | `lipstick` |
| ファンデーション | `foundation` |

## 食品・飲料

| 想定商品 | item_type の例 |
|---|---|
| インスタント麺 | `instant-noodles` |
| お米 | `rice` |
| 醤油 | `soy-sauce` |
| お茶 | `tea` |
| コーヒー（豆・粉） | `coffee-beans` または `coffee-grounds` |
| 菓子 | `cookies-and-biscuits` 等カテゴリ別 |
| 日本酒 | `sake` |
| ビール | `beer` |

## アパレル

| 想定商品 | item_type の例 |
|---|---|
| Tシャツ | `shirt` |
| ジーンズ | `jeans` |
| ワンピース | `dress` |
| アウター | `outerwear-jacket` |
| 靴 | `shoes`（さらに細分化） |
| バッグ | `handbag` |
| 帽子 | `hat` |

## ベビー・キッズ

| 想定商品 | item_type の例 |
|---|---|
| ベビーカー | `stroller` |
| 抱っこ紐 | `baby-carrier` |
| ベビー服 | `baby-clothing` |
| おむつ | `diapers` |
| 哺乳瓶 | `baby-bottle` |
| 知育玩具 | `toys` 系 |

## ペット

| 想定商品 | item_type の例 |
|---|---|
| ドッグフード | `dog-food` |
| キャットフード | `cat-food` |
| ペットおもちゃ | `pet-toy` |
| ペット用品 | `pet-supplies` |
| 犬服 | `pet-clothing` |

## スポーツ・アウトドア

| 想定商品 | item_type の例 |
|---|---|
| ヨガマット | `yoga-mat` |
| ダンベル | `dumbbell` |
| テント | `tent` |
| 寝袋 | `sleeping-bag` |
| 自転車 | `bicycle` |

## ホーム・キッチン

| 想定商品 | item_type の例 |
|---|---|
| 食器 | `dinnerware` |
| 鍋・フライパン | `cookware` |
| 包丁 | `knife` |
| 収納家具 | `storage-furniture` |
| ベッド | `bed` |
| カーテン | `curtains` |

## 文具・オフィス

| 想定商品 | item_type の例 |
|---|---|
| ノート | `notebook` |
| ボールペン | `ballpoint-pen` |
| ファイル | `file-folder` |
| プリンター用紙 | `printer-paper` |

## ENUM違反のよくあるパターン

| 入力された値 | エラー理由 | 正しい候補 |
|---|---|---|
| `vacuum cleaner` | スペース | `vacuum-cleaner` |
| `vacuum_cleaner` | アンダースコア | `vacuum-cleaner` |
| `掃除機` | 日本語 | `vacuum-cleaner` |
| `VacuumCleaner` | キャメルケース | `vacuum-cleaner` |
| `vacuum-cleaners` | 複数形 | `vacuum-cleaner` |

ハイフンつなぎ・小文字・単数形が原則だが、カテゴリにより異なる。

## ENUM値の取得手順

1. セラーセントラル「在庫＞商品登録＞カテゴリ／テンプレートのダウンロード」
2. 該当カテゴリのテンプレート（Excel）をダウンロード
3. 「Valid Values」シートで列名 `item_type` の有効値を確認
4. 該当する値をコピーしてCSVに貼り付け

## カテゴリが見つからない場合

- 一部の特殊商品は既存ENUMに合致しないことがある
- 最も近いカテゴリを選択し、`product_description` で詳細補足
- カタログサポートに「適切な`item_type`がない」と相談（`amazon-catalog-conflict-ticket-builder` 参照）

## 関連列との整合

`item_type` を変更すると、カテゴリ別の必須列・属性が変わる。
- 例：`vacuum-cleaner` → `wattage`, `voltage`, `power_source` が推奨
- 例：`shampoo` → `volume_capacity_name`, `ingredients` が推奨

`item_type` を決めてから他の列を埋める順番が安全。
