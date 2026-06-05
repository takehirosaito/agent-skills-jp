# Step 1 テーマ選定 — 独自スキル30本（重複回避・空白領域）

## 選定方針

既存104本は全て `ecommerce-marketing`。サイトのポジショニング（EC×AIのALSEL独自スキル）を保つため
**30本も ecommerce-marketing に統一**。RAG/Claude Code応用等のAI開発系はカテゴリ不整合＆ポジショニング希薄化のため不採用。
既存が手薄＝**越境EC・Qoo10/モール拡張・物流通関・大型セール広告・D2C/CRM高度化・ふるさと納税・B2B EC・ライブコマース**を狙う。
各スキルの description に `※○○は別スキル \`slug\`` を明記して機能境界を立てる。

## 既存でカバー済み → 避けた領域

楽天SS準備(`rakuten-super-sale-prep`)・レビュー返信(`rakuten/yahoo-review-reply-generator`)・
CSV検証(`csv-encoding-sjis-validator`,`*-product-csv-validator`)・メルマガ本文(`*-mailmagazine-builder`)・
GMC審査(`google-merchant-center-policy-diagnosis`)・Metaコピー(`meta-ad-copy-ec-jp`)・
LINE単発配信(`line-official-message-ec`)・発注点(`reorder-point-forecast-lite`)・在庫アラート(`inventory-alert-action-list`)・
送料無料閾値(`free-shipping-threshold-calculator`)・月次レポート(`ec-monthly-management-report`)・
CVR診断(`shopify-cvr-diagnosis`)・返品ポリシー(`return-policy-consistency-check`)。
→ 30本はこれらと機能5割以上重複しないよう、対象モール/対象業務/成果物を変えて設計。

## 30テーマ（6バッチ）

### Batch 1 — 越境EC
| slug | 概要 | 既存との差分 |
|---|---|---|
| amazon-global-selling-launch | Amazon Global Selling 米国出品の立ち上げ全工程 | `amazon-us-localization-jp-brand`はコピーのローカライズのみ。本スキルは出店審査/税/FBA/出品オペ全体 |
| shopify-markets-cross-border-setup | Shopify Markets 多通貨・多言語・関税(DDP)設定 | 既存shopifyは国内向け。越境設定は無し |
| ebay-listing-optimization-jp | 日本セラー向け eBay 出品最適化(Item Specifics/送料/評価) | eBay系スキルは存在しない |
| cross-border-hs-code-duty-estimator | 越境EC の HSコード判定・関税/DDP/送料見積 | 通関/関税系は存在しない |
| taobao-tmall-entry-guide | 中国 天猫国際/淘宝 出店要件と運用設計 | 中国モール系は存在しない |

### Batch 2 — Qoo10/モール拡張・海外SEO
| slug | 概要 | 既存との差分 |
|---|---|---|
| qoo10-shop-opening-checklist | Qoo10 出店審査・QSM初期設定チェックリスト | Qoo10系は皆無 |
| qoo10-item-registration-guide | Qoo10 商品登録(QSM)の項目設計 | 同上 |
| qoo10-mega-wari-prep | Qoo10 メガ割キャンペーン準備 | `rakuten-super-sale-prep`は楽天専用。Qoo10メガ割は別仕様 |
| au-pay-market-item-setup | au PAY マーケット 出店/商品登録/Pontaキャンペーン | au PAYマーケット系は皆無 |
| multilingual-hreflang-planner | 多言語hreflang/海外SEO設計 | `shopify-collection-seo-builder`等は国内SEO。hreflang/国際化は無し |

### Batch 3 — 物流・在庫・通関
| slug | 概要 | 既存との差分 |
|---|---|---|
| wms-requirements-definition | WMS要件定義・3PL選定RFP | 倉庫システム/3PL選定は無し |
| multi-warehouse-allocation-planner | 複数倉庫の在庫配分設計 | `reorder-point`は発注点、`inventory-alert`はアラート。拠点間配分は無し |
| import-customs-clearance-checklist | 輸入通関書類・関税/消費税チェックリスト | 通関は無し |
| shipping-carrier-rate-optimizer | 配送キャリア選定・送料テーブル最適化 | `free-shipping-threshold`は閾値計算。キャリア/料金表設計は無し |
| lead-time-reduction-planner | 納期短縮・リードタイム改善設計 | リードタイム改善は無し |

### Batch 4 — 広告・大型セール・実験
| slug | 概要 | 既存との差分 |
|---|---|---|
| tiktok-ads-ec-planner | TikTok広告 EC運用(アカウント構成/クリエイティブ/計測)設計 | `meta-ad-copy-ec-jp`はMetaのコピーのみ。TikTok広告は無し |
| pinterest-shopping-ads-planner | Pinterest ショッピング広告/カタログ設計 | Pinterest系は無し |
| amazon-prime-day-prep | Amazonプライムデー 在庫予測/価格/広告チューニング | 楽天SS準備はあるがAmazon大型セールは無し |
| amazon-dsp-audience-planner | Amazon DSP オーディエンス/リターゲ設計 | `sponsored-products-rebuilder`は検索広告。DSP(ディスプレイ)は別物 |
| ab-test-design-ec | EC A/Bテスト設計(仮説/サンプルサイズ/評価) | `shopify-cvr-diagnosis`は単発診断。実験設計は無し |

### Batch 5 — D2C・CRM・データ
| slug | 概要 | 既存との差分 |
|---|---|---|
| d2c-subscription-design | D2Cサブスク設計・解約率(チャーン)改善 | サブスク/定期購入設計は無し |
| ltv-cohort-analysis-planner | LTV/コホート分析の設計と読み解き | `ec-monthly-management-report`は売上集計。コホート/LTVは無し |
| line-step-message-scenario | LINEステップ配信シナリオ/セグメント設計 | `line-official-message-ec`は単発配信文。多段シナリオ設計は別 |
| crm-rfm-segmentation-planner | RFMセグメンテーション・顧客育成施策設計 | RFM/顧客分類は無し |
| refund-workflow-designer | 返金・返品オペレーションのフロー設計 | `return-policy-consistency-check`はポリシー文整合。業務フロー設計は別 |

### Batch 6 — ふるさと納税・B2B・ライブコマース
| slug | 概要 | 既存との差分 |
|---|---|---|
| furusato-rakuten-listing | 楽天ふるさと納税 返礼品 出品/ページ設計 | ふるさと納税系は皆無 |
| furusato-satofuru-listing | さとふる/ふるさとチョイス 返礼品 出品設計 | 同上 |
| b2b-ec-quote-builder | B2B EC 見積書/掛け率/ロット設計 | `invoice-receipt-mail-template`はメール文。見積/掛け率設計は別 |
| b2b-credit-screening-checklist | B2B 取引先 与信審査チェックリスト | 与信は無し |
| live-commerce-script-planner | ライブコマース(楽天/TikTok/YouTube Live)台本・進行設計 | ライブコマース系は皆無 |

## 重複セルフチェック結果

30本いずれも既存104本と「対象モール」「対象業務」「成果物」のうち2つ以上が異なり、機能重複は5割未満と判断。
各descriptionに棲み分け注記(`※…は別スキル`)を入れ、検索/トリガーの衝突を回避。
