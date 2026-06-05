# Step 0 調査レポート — agent-skills.jp 独自スキル30本投入

実施日: 2026-06-05 / ブランチ: main（クリーン）

## 1. スキルの登録方法（実物確認）

### データの真実の源泉は「本番Meilisearch」

サイト（Next.js / `apps/web`）のスキルページ `src/app/skill/[slug]/page.tsx` は
**100% Meilisearch から `getSkillBySlug(slug)` で取得**してレンダリングする（`src/lib/meilisearch.ts`）。

- `[slug]` ルートに **`generateStaticParams` は無い** → オンデマンド ISR（`export const revalidate = 86400`）。
  新 slug は**初回アクセス時にサーバーでレンダリング**される（＝Meili にドキュメントがあれば再デプロイ不要で 200 を返す）。
- 本番 Meili: `PROD_MEILI_HOST=https://meilisearch-production-d128.up.railway.app`（Railway）。
  - health: `available` / `skills` index: **15,498 docs**、うち `is_original = true` は **104 件**（＝既存独自スキル）。
- ローカル Meili（`127.0.0.1:7700`）は未起動。`apps/web/.env.local` の `NEXT_PUBLIC_MEILI_HOST` はローカルを指す（開発用）。

### 独自スキル（ALSEL originals）の登録パイプライン

`packages/pipeline/09_alsel_originals.py` が独自スキル投入の本体。

- **入力**: `data/alsel_originals/_<slug>/<slug>/SKILL.md`（フロントマター＋本文）
- **出力**: `data/alsel_originals.jsonl` ＋ Meilisearch `skills` index へ `add_documents`（primary key `id` で upsert）
- `id = uuid5(NAMESPACE_URL, "https://agent-skills.jp/alsel/<slug>")` … slug から決定的 → 再投入で安全に upsert
- ドキュメント主要フィールド: `slug / name / description_ja(末尾にCREDIT_LINE自動付与) / content_full / content_full_ja / language_original=ja / vendor=claude / category=ecommerce-marketing / author=株式会社ALSEL / quality_score=100 / license=MIT / is_original=true / is_featured=true`
- `description` のCREDIT_LINE（「【ALSEL独自スキル】…」）は**スクリプトが自動付与**するので SKILL.md には書かない。
- `is_original / is_featured` は filterable/displayed に追加済み（既存104本で設定済み）。

> 注: スクリプトは `import meilisearch`（クライアント）を使うが、ローカル venv では import に問題あり。
> `11_publish_index.py` と同様に **urllib で Meili REST を直叩き**して投入する方針にする（依存回避・本番直投入）。

### `skills/` トップディレクトリの役割

`skills/<slug>/`（101件）は **ZIP/MDダウンロードのローカル・フォールバック専用**
（`api/skill/[slug]/zip|download/route.ts` が `skills/<slug>` を最優先で読み、無ければ Meili `content_full` を返す）。
→ 新独自スキルは `data/alsel_originals` ＋ Meili `content_full` だけで**ページ表示・ZIP・MD配布すべて成立**。
   既存も legacy 2件は `skills/` に無く Meili 経由で配布できている＝ `skills/` への複製は必須でない。

### スキル一覧の件数表示箇所

トップ等の件数は `getStats()`（Meili facet 集計）で**動的算出**。
ハードコードされたカウントは無く、Meili に投入すれば件数表示は自動で増える。
`skills-index.json`（リポ直下・約8MB）は `11_publish_index.py` が**本番Meiliから再生成**する派生物
（find-skills が raw.githubusercontent から fetch する用途）。30本投入後に再生成＆commitする。

### ビルド/ZIP化の要否

- スキル投入に**Next のビルドは不要**（スキルはアプリのバンドル対象でなくMeiliデータ）。
- ZIP化も不要（zip は API ルートが動的生成）。
- 必要なのは「SKILL.md 作成 → 09スクリプトのSLUGS追加 → 本番Meili投入 → skills-index.json再生成」。

## 2. 既存104本の description コーパス

`existing_skills_corpus.json`（リポ直下）に slug/name/description_ja/description_original/category を保存済み。
全104本が `category=ecommerce-marketing`。内訳: Amazon 15・楽天 23・Yahoo 10・Shopify 10・
他カート(BASE/makeshop/futureshop/next-engine/crossmall) 7・横断EC実務 約38・legacy/find-skills 4。

## 3. デプロイフロー

- `git push origin main` → Vercel 自動デプロイ（`apps/web`）。`vercel.json` あり。
- ただし**スキル表示は Meili 投入で即反映**（再デプロイ非依存・オンデマンドISR）。
- デプロイはおもに `skills-index.json` 更新・コード変更の反映用。

## 4. テスト方法（このタスクでの実運用）

- `npm run build`: アプリコード非変更なので baseline グリーンを1回ゲートとして確認（実行中）。
- 本当の検証は **Meili に doc が入ったか（REST search で slug 取得）＋ 本番URL 200**。
- ローカル `npm run dev` は localhost Meili 未起動のため新スキル一覧確認に不向き →
  本番Meili直投入＋本番URL curl で代替（より確実）。

## 結論（実行プラン）

1. `data/alsel_originals/_<slug>/<slug>/SKILL.md` を30本作成（日本語・既存の型準拠）
2. `09_alsel_originals.py` に新30 slug を追加
3. バッチ毎（5本×6）: フロントマター parse 検証 → 本番Meili に該当5本を upsert → REST で5 slug 取得確認 → 本番URL 200 確認 → git commit → 進捗更新
4. 全6バッチ後: `11_publish_index.py` で `skills-index.json` 再生成 → commit → push（Vercelデプロイ）→ 30URL 200 一括確認
