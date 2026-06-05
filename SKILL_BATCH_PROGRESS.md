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
- [x] Batch 1 越境EC（投入5/5・Meili検証5/5・本番URL 200×5・commit 2c4fc81）
- [x] Batch 2 Qoo10/モール拡張・海外SEO（投入5/5・200×5・commit 9ca89ea）
- [x] Batch 3 物流・在庫・通関（投入5/5・200×5・commit b992213）
- [x] Batch 4 広告・大型セール・実験（投入5/5・200×5・commit bca97e3）
- [x] Batch 5 D2C・CRM・データ（投入5/5・200×5・commit a674434）
- [x] Batch 6 ふるさと納税・B2B・ライブコマース（投入5/5・200×5・commit 1e98f9b）
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
- Batch1: 5本作成→data/＋skills/両方に配置→09 SLUGS追加→prod Meili upsert(task33 succeeded)→Meili検証5/5→本番URL 200×5→commit 2c4fc81。再デプロイ不要で200化を確認。
- Batch2: 5本→prod Meili upsert(task34)→検証5/5→200×5→commit 9ca89ea。注: ingestのslug指定はzshでword-split無効のため1個ずつ列挙する。
