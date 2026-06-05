# SKILL_BATCH_PROGRESS — 独自スキル30本投入

タスク: agent-skills.jp に独自スキル30本（ecommerce-marketing / is_original）を投入。
再開方法: このファイルの「現在地」を見て、未完バッチから続行。

## アーキテクチャ要点（再開時に必読）
- スキルページは本番Meilisearch駆動（`PROD_MEILI_HOST`）。`[slug]`は generateStaticParams 無し＝オンデマンドISRで再デプロイ不要で200化。
- 投入手順: `data/alsel_originals/_<slug>/<slug>/SKILL.md` 作成 → `packages/pipeline/09_alsel_originals.py` のSLUGSに追加 → 本番Meiliへ urllib直叩きで upsert（id=uuid5(URL,"https://agent-skills.jp/alsel/<slug>")）。
- description のCREDIT_LINEは09スクリプトが自動付与（SKILL.mdには書かない）。
- 投入用ワンショット: `scripts/ingest_originals.py`（urllibでprod Meiliにupsert／本タスクで作成）。
- 検証: prod Meili REST search で slug 取得 → `https://agent-skills.jp/skill/<slug>` 200。
- 仕上げ: `11_publish_index.py` で `skills-index.json` 再生成 → commit → push。

## 現在地
- [x] Step 0 調査（reports/agent-skills-30-task-step0.md）
- [x] Step 1 テーマ選定（reports/agent-skills-30-task-themes.md）
- [ ] Batch 1 越境EC
- [ ] Batch 2 Qoo10/モール拡張・海外SEO
- [ ] Batch 3 物流・在庫・通関
- [ ] Batch 4 広告・大型セール・実験
- [ ] Batch 5 D2C・CRM・データ
- [ ] Batch 6 ふるさと納税・B2B・ライブコマース
- [ ] Step 3 公開（skills-index.json再生成・push・30URL 200）
- [ ] Step 4 完了報告（reports/agent-skills-30-task-final.md）

## バッチ別 slug
- Batch1: amazon-global-selling-launch, shopify-markets-cross-border-setup, ebay-listing-optimization-jp, cross-border-hs-code-duty-estimator, taobao-tmall-entry-guide
- Batch2: qoo10-shop-opening-checklist, qoo10-item-registration-guide, qoo10-mega-wari-prep, au-pay-market-item-setup, multilingual-hreflang-planner
- Batch3: wms-requirements-definition, multi-warehouse-allocation-planner, import-customs-clearance-checklist, shipping-carrier-rate-optimizer, lead-time-reduction-planner
- Batch4: tiktok-ads-ec-planner, pinterest-shopping-ads-planner, amazon-prime-day-prep, amazon-dsp-audience-planner, ab-test-design-ec
- Batch5: d2c-subscription-design, ltv-cohort-analysis-planner, line-step-message-scenario, crm-rfm-segmentation-planner, refund-workflow-designer
- Batch6: furusato-rakuten-listing, furusato-satofuru-listing, b2b-ec-quote-builder, b2b-credit-screening-checklist, live-commerce-script-planner

## ログ
- (まだ無し)
