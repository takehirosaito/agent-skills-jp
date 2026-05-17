# 親子バリエーション 監査チェックリスト（30項目）

親子バリエーション関係を監査するための詳細チェックリスト。

## A. 親（Parent）の確認（5項目）

### 1. parent_child=parent
- [ ] 親行の `parent_child` 列が `parent`

### 2. 価格・在庫・JAN が空欄
- [ ] `standard_price` が空欄
- [ ] `quantity` が空欄
- [ ] `external_product_id` が空欄

### 3. variation_theme 設定
- [ ] `variation_theme` がカテゴリ別ENUM 値
- [ ] 自由入力でなく公式値

### 4. ブランド・商品名
- [ ] `brand_name` が設定済み
- [ ] `item_name` が全バリエーションを包括する名称

### 5. メイン画像・bullet
- [ ] 親ASIN にメイン画像が登録
- [ ] 親ASIN にbullet 5箇条が登録

## B. 子（Child）の確認（10項目）

### 6. parent_child=child
- [ ] 全子行で `parent_child=child`

### 7. parent_sku の正確性
- [ ] 全子の `parent_sku` が親の `item_sku` と一字一句一致

### 8. relationship_type
- [ ] 全子で `relationship_type=variation`

### 9. variation_theme の一致
- [ ] 全子の `variation_theme` が親と完全一致

### 10. バリエーション属性の存在
- [ ] variation_theme=Size → 全子で `size_name` 埋まる
- [ ] variation_theme=Color → 全子で `color_name` 埋まる
- [ ] variation_theme=SizeColor → 全子で両方埋まる

### 11. external_product_id（JAN）のユニーク性
- [ ] 各子で別のJAN
- [ ] 重複JAN なし

### 12. JAN チェックデジット
- [ ] 各JAN のCD が正しい（`jan-code-checker` で検証）

### 13. 価格設定
- [ ] 各子に `standard_price` が設定
- [ ] 価格戦略の整合性（同価格 or 異価格の根拠）

### 14. 在庫設定
- [ ] 各子に `quantity` が設定
- [ ] 在庫切れ子は quantity=0

### 15. 子別の商品名
- [ ] 各子の `item_name` にバリエーション属性（色・サイズ）が反映

## C. 組合せの妥当性（5項目）

### 16. 組合せの完全性
- [ ] variation_theme=SizeColor の場合、色×サイズの全組合せが揃う
- [ ] 例：2色×3サイズ=6子 が存在

### 17. 組合せの重複なし
- [ ] 同じ色×同じサイズの子が複数ない

### 18. バリエーション値の統一
- [ ] 色名表記が統一（「Black」「黒」が混在しない）
- [ ] サイズ表記が統一（「S」「Small」が混在しない）

### 19. 在庫切れの管理
- [ ] 在庫切れ子はquantity=0 で販売停止
- [ ] 親の選択肢で在庫切れ子が分かる表示

### 20. 廃番バリエーションの扱い
- [ ] 廃番子は販売停止（削除しない）
- [ ] 新色追加時の子作成方法が明確

## D. 共通要素の整理（5項目）

### 21. 親と子の bullet 整合
- [ ] 親に共通bullet 5箇条
- [ ] 子のbullet は親から継承（子独自設定の必要なし）

### 22. メイン画像の役割分担
- [ ] 親：代表色／代表サイズの画像
- [ ] 子：各バリエーションの画像

### 23. サブ画像
- [ ] 親：商品共通の使用シーン・素材アップ
- [ ] 子：各バリエーション固有のサブ画像（必要なら）

### 24. 商品仕様欄
- [ ] 親で共通の仕様情報
- [ ] 子で個別の仕様（重量・寸法等が違う場合）

### 25. A+コンテンツ
- [ ] 親ASIN にA+コンテンツが当たる
- [ ] 子ASIN にも親と同じA+ が表示される

## E. 顧客体験・運用（5項目）

### 26. レビュー集約
- [ ] 子のレビューが親に集約されている
- [ ] 親ASIN ページで全バリエーションのレビューが見える

### 27. 検索結果での表示
- [ ] 検索結果で親ASIN が代表表示
- [ ] バリエーション選択UI が機能

### 28. カート挙動
- [ ] バリエーションを選んでカートに投入
- [ ] 在庫切れ子は選択時に通知

### 29. 商品ターゲティング広告
- [ ] スポンサー広告は親ASIN で出すのが基本
- [ ] 商品ターゲティングで親ASIN を選べる

### 30. アクセス解析
- [ ] Brand Analytics で親別の流入KW を確認可能
- [ ] 子別の販売実績も確認可能

## 監査実施のフロー

### Step 1：データ取得
- 既存ASIN のフラットファイルダウンロード
- 商品ページ実機確認
- ヘルスダッシュボード確認

### Step 2：30項目をチェック
- 上記30項目を順に確認
- 該当ASINで「✅／❌」記録
- 問題ありの項目は重大度評価

### Step 3：問題リスト作成
- 重大度別に分類
- 修正案を立案
- 移行コストを試算

### Step 4：修正実行
- 即時修正：フラットファイル更新
- 中期修正：追加発注・新規ASIN
- 長期修正：リファクタリング

### Step 5：再監査
- 修正後の再チェック
- 全項目クリアを確認

## 重大度別の対応

| 重大度 | 例 | 対応 |
|---|---|---|
| 致命的 | 親と子のvariation_theme 不一致 | 即修正、フラットファイル再アップロード |
| 重要 | 組合せ欠落、JAN重複 | 数日以内に修正 |
| 中 | 色名表記の混在 | 2週間以内に統一 |
| 軽微 | 子個別bullet の冗長 | 機会があれば整理 |

## チェックの自動化

簡易的なPython スクリプト例：

```python
def audit_parent_child(skus):
    """親子バリエーション監査"""
    parents = [s for s in skus if s['parent_child'] == 'parent']
    children = [s for s in skus if s['parent_child'] == 'child']
    
    issues = []
    
    # A1: parent_child=parent
    for p in parents:
        if p['standard_price']:
            issues.append(f"親{p['item_sku']}に価格が設定されている")
        if p['quantity']:
            issues.append(f"親{p['item_sku']}に在庫が設定されている")
    
    # B7: parent_sku 参照確認
    parent_skus = {p['item_sku'] for p in parents}
    for c in children:
        if c['parent_sku'] not in parent_skus:
            issues.append(f"子{c['item_sku']}のparent_sku参照不正")
    
    # B9: variation_theme 一致
    for c in children:
        parent = next((p for p in parents if p['item_sku'] == c['parent_sku']), None)
        if parent and c['variation_theme'] != parent['variation_theme']:
            issues.append(f"子{c['item_sku']}のvariation_theme不一致")
    
    # B11: JAN ユニーク性
    gtins = {}
    for c in children:
        gtin = c['external_product_id']
        if gtin in gtins:
            issues.append(f"JAN重複: {gtin} → {gtins[gtin]}, {c['item_sku']}")
        else:
            gtins[gtin] = c['item_sku']
    
    return issues
```

## 監査頻度

| 頻度 | 対象 |
|---|---|
| 新商品登録時 | 必須（登録前） |
| 月次 | 主要商品 |
| 四半期 | 全ASIN |
| 半期 | 大規模リファクタリング検討 |

## 監査時の同時チェック

親子監査と同時に：
- フラットファイル全体の検証：`amazon-flat-file-validator-jp`
- JAN／GTIN 検証：`jan-code-checker`
- メイン画像規定：`amazon-main-image-checker`
- タイトル・bullet 品質：`amazon-title-bullet-rewriter-jp`

5スキルを連動させると、商品マスター全体の品質が確保できる。

## 監査結果の社内共有

- 月次監査レポート：問題件数・修正進捗
- 重大問題の早期エスカレーション
- 担当部門との連携（製造・物流・カタログ）

## 監査ツール

外部ツール（Helium 10、Jungle Scout、SellerApp など）：
- 親子関係の可視化
- 競合の親子構造の分析
- 自社の問題点の発見

## 監査の主要KPI

- 問題ASIN 比率（全ASIN中の問題あり比率）
- 重大問題件数
- 修正完了率
- 監査→修正までの平均日数
