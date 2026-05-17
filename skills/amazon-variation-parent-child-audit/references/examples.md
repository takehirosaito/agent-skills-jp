# 親子バリエーション ジャンル別実例

5ジャンルの代表的な親子バリエーション設計例。

---

## 1. アパレル：シャツ（色×サイズ）

### 構造
```text
親：SHIRT-PARENT
variation_theme: SizeColor
├── SHIRT-BLK-S（Black, S）
├── SHIRT-BLK-M（Black, M）
├── SHIRT-BLK-L（Black, L）
├── SHIRT-BLK-XL（Black, XL）
├── SHIRT-WHT-S（White, S）
├── SHIRT-WHT-M（White, M）
├── SHIRT-WHT-L（White, L）
├── SHIRT-WHT-XL（White, XL）
├── SHIRT-NVY-S（Navy, S）
├── SHIRT-NVY-M（Navy, M）
├── SHIRT-NVY-L（Navy, L）
└── SHIRT-NVY-XL（Navy, XL）
```

### フラットファイル例
```text
item_sku	parent_child	parent_sku	relationship_type	variation_theme	color_name	size_name	external_product_id	standard_price	quantity
SHIRT-PARENT	parent			SizeColor			
SHIRT-BLK-S	child	SHIRT-PARENT	variation	SizeColor	Black	S	4901234567894	5800	10
SHIRT-BLK-M	child	SHIRT-PARENT	variation	SizeColor	Black	M	4901234567900	5800	15
SHIRT-BLK-L	child	SHIRT-PARENT	variation	SizeColor	Black	L	4901234567917	5800	12
SHIRT-BLK-XL	child	SHIRT-PARENT	variation	SizeColor	Black	XL	4901234567924	5800	8
SHIRT-WHT-S	child	SHIRT-PARENT	variation	SizeColor	White	S	4901234567931	5800	7
（以下省略）
```

### 監査ポイント
- 全12子（3色×4サイズ）が揃っている
- JAN 12個ともユニーク
- color_name、size_name の表記統一

### よくある問題
- 「Black」と「黒」の混在 → 統一する
- 1サイズ・1色の欠落 → 追加発注 or 販売停止

---

## 2. 食品：醤油（容量）

### 構造
```text
親：SOYSAUCE-PARENT
variation_theme: Size
├── SOYSAUCE-200ML（200ml）
├── SOYSAUCE-500ML（500ml）
├── SOYSAUCE-1L（1L）
└── SOYSAUCE-1.8L（1.8L）
```

### フラットファイル例
```text
item_sku	parent_child	parent_sku	relationship_type	variation_theme	size_name	external_product_id	standard_price	quantity
SOYSAUCE-PARENT	parent			Size		
SOYSAUCE-200ML	child	SOYSAUCE-PARENT	variation	Size	200ml	4901234567894	900	30
SOYSAUCE-500ML	child	SOYSAUCE-PARENT	variation	Size	500ml	4901234567900	1800	50
SOYSAUCE-1L	child	SOYSAUCE-PARENT	variation	Size	1L	4901234567917	3200	25
SOYSAUCE-1.8L	child	SOYSAUCE-PARENT	variation	Size	1.8L	4901234567924	5400	15
```

### 監査ポイント
- variation_theme=Size のみで十分（色違いはない）
- size_name の表記統一（「200ml」「500ml」「1L」）
- 容量別に価格を変える

### よくある問題
- 「200ml」と「200ミリリットル」の混在 → 統一
- 容量と価格の比例関係が崩れる（200mlを500mlより高くしてしまう）

---

## 3. コスメ：口紅（色×容量）

### 構造
```text
親：LIPSTICK-PARENT
variation_theme: ColorVolume （または同等のENUM）
├── LIPSTICK-RED-3G
├── LIPSTICK-RED-5G
├── LIPSTICK-PINK-3G
├── LIPSTICK-PINK-5G
├── LIPSTICK-CORAL-3G
└── LIPSTICK-CORAL-5G
```

### フラットファイル例
```text
item_sku	parent_child	parent_sku	relationship_type	variation_theme	color_name	volume_capacity_name	external_product_id	standard_price	quantity
LIPSTICK-PARENT	parent			ColorVolume			
LIPSTICK-RED-3G	child	LIPSTICK-PARENT	variation	ColorVolume	Red	3g	4901234567894	3200	30
LIPSTICK-RED-5G	child	LIPSTICK-PARENT	variation	ColorVolume	Red	5g	4901234567900	4800	20
（以下省略）
```

### 監査ポイント
- 色×容量の全組合せ：3色×2容量=6子
- 色名表記（Red, Pink, Coral 等）
- 容量表記（3g, 5g）

### よくある問題
- 色名のローマ字／カタカナ混在
- 色見本画像が親と子で違う

---

## 4. 家電：イヤホン（色）

### 構造
```text
親：EARPHONE-PARENT
variation_theme: Color
├── EARPHONE-BLK（Black）
├── EARPHONE-WHT（White）
├── EARPHONE-BLU（Blue）
└── EARPHONE-RED（Red）
```

### フラットファイル例
```text
item_sku	parent_child	parent_sku	relationship_type	variation_theme	color_name	external_product_id	standard_price	quantity
EARPHONE-PARENT	parent			Color		
EARPHONE-BLK	child	EARPHONE-PARENT	variation	Color	Black	4901234567894	8900	100
EARPHONE-WHT	child	EARPHONE-PARENT	variation	Color	White	4901234567900	8900	80
EARPHONE-BLU	child	EARPHONE-PARENT	variation	Color	Blue	4901234567917	8900	50
EARPHONE-RED	child	EARPHONE-PARENT	variation	Color	Red	4901234567924	8900	40
```

### 監査ポイント
- 色のみのバリエーション、機能は全色同じ
- 価格は全色同じ（同価格戦略）
- 在庫数は色別に管理

### よくある問題
- 色によって機能が違う（→ 別ASIN にすべき）
- 限定色は親子化せず別ASINで運用すべきか判断

---

## 5. 靴（サイズ×色×幅）

### 構造（3軸の場合）
```text
親：SHOE-PARENT
variation_theme: SizeColorWidth
├── SHOE-BLK-23-R（Black, 23cm, Regular）
├── SHOE-BLK-23-W（Black, 23cm, Wide）
├── SHOE-BLK-24-R
├── SHOE-BLK-24-W
├── SHOE-BLK-25-R
├── SHOE-BLK-25-W
├── SHOE-BWN-23-R（Brown, 23cm, Regular）
├── SHOE-BWN-23-W
├── SHOE-BWN-24-R
├── SHOE-BWN-24-W
├── SHOE-BWN-25-R
└── SHOE-BWN-25-W
```

12子（2色×3サイズ×2幅）。

### 構造（2軸に簡略化）
```text
親：SHOE-PARENT
variation_theme: SizeColor
├── SHOE-BLK-23（Black, 23cm）
├── SHOE-BLK-24
├── SHOE-BLK-25
├── SHOE-BWN-23
├── SHOE-BWN-24
└── SHOE-BWN-25
```

6子（2色×3サイズ）。幅違いは別ASIN として運用。

### 監査ポイント
- 3軸 vs 2軸の選択：管理コストと顧客体験のトレードオフ
- サイズ表記の統一（「23.0」「23.5」「24.0」）
- 在庫が多い軸の選定

### よくある問題
- 3軸にすると子が多すぎ（10色×8サイズ×3幅=240子）
- 売れ筋を絞った構造に変更
- 「Regular only」「Black 23-25 only」のような限定的な組合せ

---

## 6（おまけ）：ペット：ドッグフード（サイズ×年齢）

### 構造
```text
親：DOGFOOD-PARENT
variation_theme: Size（実際は容量＋年齢を表現）
├── DOGFOOD-PUPPY-1KG
├── DOGFOOD-PUPPY-3KG
├── DOGFOOD-ADULT-1KG
├── DOGFOOD-ADULT-3KG
├── DOGFOOD-ADULT-10KG
├── DOGFOOD-SENIOR-1KG
└── DOGFOOD-SENIOR-3KG
```

### 注意
- 「年齢×容量」は variation_theme として表現が難しい
- 親子化せず、年齢別に別シリーズで運用するのも選択肢
- 例：「子犬用シリーズ」「成犬用シリーズ」「シニア犬用シリーズ」を別親で

---

## 共通の監査結論

### 監査で見つかる典型問題

| # | 問題 | 重大度 | 改善案 |
|---|---|---|---|
| 1 | 色名表記の混在 | 中 | フラットファイルで統一 |
| 2 | 組合せ欠落 | 中 | 追加発注 or 販売停止 |
| 3 | variation_theme 親子不一致 | 致命 | 即修正 |
| 4 | JAN 重複 | 致命 | メーカーに発番依頼 |
| 5 | 親に画像なし | 重要 | 代表画像を登録 |

### 監査の判断軸

- **致命的問題**：即修正（数日以内）
- **重要問題**：1〜2週間以内
- **中程度問題**：1ヶ月以内
- **軽微問題**：定期清掃で対応

### 監査と運用の連動

監査の結果を：
1. カタログ担当：フラットファイル更新
2. 製造／物流：JAN発番・追加発注
3. マーケティング：販売戦略への影響
4. CS：顧客対応への影響

各部門と連携して総合的な改善を進める。

## 監査ツールの活用

### Amazon 公式ツール
- セラーセントラル「親子関係を管理」
- バルクアップロード機能

### 外部ツール
- Helium 10：競合の親子構造分析
- Jungle Scout：ASIN関係の可視化

### 自社管理
- スプレッドシートで全SKUと親子関係を一元管理
- 月次の整合性チェック

## 監査の継続的改善

1. 監査チェックリストの定期更新
2. 新カテゴリ参入時の親子設計指針
3. 過去問題のFAQ化
4. 社内教育

親子バリエーション設計は「最初に正しく決める」が最も重要。事後の修正は避けたい。
