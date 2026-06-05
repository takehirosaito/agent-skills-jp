# 完了報告 — agent-skills.jp 独自スキル30本投入

実施日: 2026-06-05 / 実行者: Claude (Opus 4.8) / 依頼: たけさん

## サマリ

- **30本すべて投入・本番反映・URL 200 確認完了**（投入30/30・Meili検証30/30・本番URL 200×30）。
- 本番Meilisearch `is_original` 件数: **104 → 134**（+30）。
- `skills-index.json`: **10,260 → 10,290**（ALSEL 104→134）に再生成・commit・push 済み。
- Vercel 本番デプロイ: **Ready**（最新 Production デプロイ完了）。
- スキル詳細ページ・MDダウンロード・ZIPダウンロード・検索 すべて動作確認済み。
- スキップ・失敗: **0件**（3回リトライ枠は未使用）。

## アーキテクチャ（Step 0 調査結論）

- サイトのスキルページは**本番Meilisearch駆動**（`getSkillBySlug`）。`/skill/[slug]` は `generateStaticParams` を持たないオンデマンドISR（`revalidate=86400`）のため、**Meili投入だけで再デプロイ不要で 200 化**する（実測で確認）。
- 投入経路: `data/alsel_originals/_<slug>/<slug>/SKILL.md`（gitignore対象）→ `scripts/ingest_originals.py`（urllibで本番Meiliへ upsert、id=uuid5）。`09_alsel_originals.py` のSLUGSにも30本追記（正式レジストリ）。
- git追跡の源泉は `skills/<slug>/SKILL.md`（全30本コピー済み）。`skills/` はMD/ZIP配布のローカルfallbackも兼ねる。
- `description` 末尾の「【ALSEL独自スキル】…」クレジットは投入スクリプトが自動付与（SKILL.md本文には不記載）。

## 投入30スキル（slug / URL / カテゴリ）

全て `category=ecommerce-marketing` / `vendor=claude` / `is_original=true` / `license=MIT` / `quality_score=100`。
URL形式: `https://agent-skills.jp/skill/<slug>`

### Batch 1 越境EC（commit 2c4fc81）
| slug | 要旨 |
|---|---|
| amazon-global-selling-launch | Amazon Global Selling 米国出品の立ち上げ（登録/税務/物流/出品オペ） |
| shopify-markets-cross-border-setup | Shopify Markets 多通貨/多言語/関税(DDP)設定 |
| ebay-listing-optimization-jp | 日本セラー向け eBay 出品最適化（Item Specifics/送料/評価） |
| cross-border-hs-code-duty-estimator | 越境EC HSコード候補・関税/輸入税の概算見積 |
| taobao-tmall-entry-guide | 中国（天猫国際/淘宝）出店要件・運用設計 |

### Batch 2 Qoo10/モール拡張・海外SEO（commit 9ca89ea）
| slug | 要旨 |
|---|---|
| qoo10-shop-opening-checklist | Qoo10 出店審査・QSM初期設定チェックリスト |
| qoo10-item-registration-guide | Qoo10 商品登録（QSM）の項目設計 |
| qoo10-mega-wari-prep | Qoo10 メガ割キャンペーン準備（価格/粗利/在庫/露出） |
| au-pay-market-item-setup | au PAY マーケット 出店/商品登録/Ponta施策 |
| multilingual-hreflang-planner | 多言語hreflang/海外SEO設計 |

### Batch 3 物流・在庫・通関（commit b992213）
| slug | 要旨 |
|---|---|
| wms-requirements-definition | WMS要件定義・3PL選定RFP |
| multi-warehouse-allocation-planner | 複数倉庫の在庫配分設計（拠点間） |
| import-customs-clearance-checklist | 輸入通関 書類・他法令・コストのチェックリスト |
| shipping-carrier-rate-optimizer | 配送キャリア選定・送料テーブル最適化 |
| lead-time-reduction-planner | 納期短縮・リードタイム改善設計 |

### Batch 4 広告・大型セール・実験（commit bca97e3）
| slug | 要旨 |
|---|---|
| tiktok-ads-ec-planner | TikTok広告 EC運用設計（計測/オーディエンス/クリエイティブ） |
| pinterest-shopping-ads-planner | Pinterest ショッピング広告/カタログ/季節先取り |
| amazon-prime-day-prep | Amazonプライムデー 在庫予測/価格/広告チューニング |
| amazon-dsp-audience-planner | Amazon DSP オーディエンス/ファネル設計 |
| ab-test-design-ec | EC A/Bテスト設計（仮説/サンプルサイズ/判定） |

### Batch 5 D2C・CRM・データ（commit a674434）
| slug | 要旨 |
|---|---|
| d2c-subscription-design | D2Cサブスク設計・解約率(チャーン)改善 |
| ltv-cohort-analysis-planner | LTV/コホート分析の設計と読み解き |
| line-step-message-scenario | LINEステップ配信シナリオ/分岐設計 |
| crm-rfm-segmentation-planner | RFMセグメンテーション・CRM施策設計 |
| refund-workflow-designer | 返金・返品 業務フロー設計 |

### Batch 6 ふるさと納税・B2B・ライブコマース（commit 1e98f9b）
| slug | 要旨 |
|---|---|
| furusato-rakuten-listing | 楽天ふるさと納税 返礼品ページ設計（ルール順守） |
| furusato-satofuru-listing | さとふる/ふるさとチョイス 返礼品掲載設計 |
| b2b-ec-quote-builder | B2B EC 見積書・掛け率/数量階段設計 |
| b2b-credit-screening-checklist | B2B 取引先 与信審査チェックリスト |
| live-commerce-script-planner | ライブコマース（楽天/TikTok/YouTube Live）台本設計 |

## 各バッチのビルド/lint・検証結果

- **baseline `npm run build`: 成功（exit 0）**。本タスクはアプリのコード（`apps/web`）を変更していない（スキルはMeiliデータ＋`data/`/`skills/`のMDファイル、`09`はPython）。よってビルド成果物に影響はなく baseline グリーンを維持。
- 実効検証は各バッチで「フロントマターparse → 本番Meili upsert(task成功) → REST searchでslug取得 → 本番URL 200」を実施し、全バッチ **5/5 成功**。

| バッチ | Meili task | Meili検証 | URL200 | commit |
|---|---|---|---|---|
| 1 | 33 succeeded | 5/5 | 5/5 | 2c4fc81 |
| 2 | 34 succeeded | 5/5 | 5/5 | 9ca89ea |
| 3 | 35 succeeded | 5/5 | 5/5 | b992213 |
| 4 | 36 succeeded | 5/5 | 5/5 | bca97e3 |
| 5 | 37 succeeded | 5/5 | 5/5 | a674434 |
| 6 | 38 succeeded | 5/5 | 5/5 | 1e98f9b |

## main 最終コミット / デプロイ

- main 最終コミット: **d162918**（`chore(index): skills-index.json 再生成`）。push 済み（d03397b..d162918）。
- Vercel 本番: 最新 Production デプロイ **Ready**（`agent-skills-mlaoh05m1-...vercel.app`、本番ドメイン `https://agent-skills.jp`）。

## 30URL 200確認（デプロイ後 最終スイープ）

**200 = 30 / NG = 0（全30本）**。加えて以下も確認:
- MDダウンロード（`/api/skill/<slug>/download`）200（local skills/ fallback 経由）
- ZIPダウンロード（`/api/skill/<slug>/zip`）200
- 検索API `?q=Qoo10` で新規4本がヒット（total 4）

## スキップ・失敗

- なし（0件）。自己修正リトライ枠（3回）の使用なし。

## 既存104本とのトピック重複チェック

既存104本は全て `ecommerce-marketing`。30本は既存が手薄/皆無の空白領域に配置し、各descriptionに `※○○は別スキル \`slug\`` で機能境界を明示。代表的な棲み分け:

- 越境/海外: Amazon/eBay/中国/Shopify Markets/hreflang は既存に皆無 → 新規領域。
- Qoo10/au PAYマーケット: 既存はrakuten/amazon/yahoo/shopify中心でこの2モールは皆無。
- メガ割 vs `rakuten-super-sale-prep`: モール・クーポン仕様が別。プライムデー vs 楽天SSも別。
- 物流: `multi-warehouse`(拠点配分) は `reorder-point-forecast-lite`(発注点)/`inventory-alert-action-list`(アラート) と役割分離。通関・WMS選定・キャリア最適化・リードタイムは皆無。
- 広告: `tiktok-ads`/`pinterest`/`amazon-dsp` は `meta-ad-copy-ec-jp`(コピーのみ)/`amazon-sponsored-products-rebuilder`(検索広告)と媒体・領域が別。
- D2C/CRM: サブスク/LTVコホート/RFM/ステップ配信 は既存に無し。`line-step-message-scenario` は `line-official-message-ec`(単発)と段数が別。`ltv-cohort` は `ec-monthly-management-report`(売上集計)と別。
- 返金フロー `refund-workflow-designer` は `return-policy-consistency-check`(ポリシー文整合)と「業務フロー設計」で別。A/Bテスト設計 `ab-test-design-ec` は `shopify-cvr-diagnosis`(単発診断)と別。
- ふるさと納税・B2B(見積/与信)・ライブコマース: 既存に皆無。

→ 30本いずれも「対象モール/対象業務/成果物」のうち2つ以上が既存と異なり、機能重複は5割未満と判断。検索スポットチェック（Qoo10）でも新規slugが正しく独立ヒット。

## 品質・コンプライアンス方針

- 全SKILL.md日本語。description は固有名詞・トリガーフレーズ5〜10個・`※棲み分け`注記を含む型を踏襲。
- 薬機法/景表法に反する効能断定・誇大表現・不当二重価格表現を避ける旨を各スキルの「注意事項」「品質ゲート」に明記。
- 手数料/税率/仕様など変動値は「公式で最新確認」を必須化し、断定を回避。

## 成果物一覧（リポジトリ）

- `skills/<slug>/SKILL.md` ×30（git追跡）/ `data/alsel_originals/_<slug>/...`（gitignore・Meili投入元）
- `packages/pipeline/09_alsel_originals.py`（SLUGSに30本追記）
- `scripts/ingest_originals.py`（本番Meili投入スクリプト・新規）
- `skills-index.json`（再生成）
- `reports/agent-skills-30-task-{step0,themes,final}.md` / `SKILL_BATCH_PROGRESS.md` / `existing_skills_corpus.json`
