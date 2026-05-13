import Link from "next/link";
import type { Metadata } from "next";
import { getStats } from "@/lib/meilisearch";
import { FindSkillsInstallTabs } from "@/components/FindSkillsInstallTabs";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "find-skills - AIエージェントから日本語で Agent Skills を探す",
    description:
      "Claude Code、Codex、Gemini CLI に追加するだけで、日本語の意図から Agent Skills を発見できる「find-skills」スキル。日本最大の Agent Skills データベース「Agent Skills by ALSEL」と連携。",
  };
}

export default async function FindSkillsLandingPage() {
  const stats = await getStats();
  const count = stats.totalSkills.toLocaleString();

  return (
    <main>
      {/* ヒーロー */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#C9A84C" }}>
            ALSEL独自スキル
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            find-skills
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Claude Code、Codex、Gemini CLI から、<br className="hidden md:inline" />
            <strong>日本語で Agent Skills を発見</strong>できるスキル。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/api/skill/find-skills/zip"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              download
            >
              📦 find-skills を ZIP でダウンロード
            </a>
            <Link
              href="/skill/find-skills"
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
            >
              SKILL.md を見る
            </Link>
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            こんなことができます
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-slate-200 rounded-lg bg-white">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-bold mb-1">自然な日本語でリクエスト</h3>
              <p className="text-sm text-slate-600">
                「楽天SEOのスキル探して」「PDF処理したい」と聞くだけ。意図を理解して最適なスキルを提示。
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg bg-white">
              <div className="text-2xl mb-2">🗂</div>
              <h3 className="font-bold mb-1">{count} 件から検索</h3>
              <p className="text-sm text-slate-600">
                Agent Skills by ALSEL に収録された <strong>{count}</strong> 件のスキルから、用途に合うものを瞬時に発見。
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg bg-white">
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-bold mb-1">品質スコア順に推薦</h3>
              <p className="text-sm text-slate-600">
                GitHub stars・更新頻度・description 充実度から算出した品質スコアの高い順に推薦。
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-lg bg-white">
              <div className="text-2xl mb-2">🏷</div>
              <h3 className="font-bold mb-1">ALSEL 独自スキルも含む</h3>
              <p className="text-sm text-slate-600">
                株式会社 ALSEL が開発した楽天SEO・Amazon SEO 等の独自スキルも検索対象。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* インストール */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            インストール
          </h2>
          <FindSkillsInstallTabs />
        </div>
      </section>

      {/* 使用例 */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">使用例</h2>

          <div className="space-y-5">
            <div className="p-5 border border-slate-200 rounded-lg bg-white">
              <div className="text-sm text-slate-500 mb-2">あなた:</div>
              <p className="text-slate-900">楽天SEOのスキル探して</p>
              <div className="text-sm text-slate-500 mt-4 mb-2">Claude Code:</div>
              <div className="text-sm text-slate-700 leading-relaxed">
                <p className="mb-2">
                  Agent Skills by ALSEL から検索しました。トップ候補は以下です:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    <strong>rakuten-seo</strong>{" "}
                    <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: "#C9A84C" }}>
                      ALSEL独自
                    </span>{" "}
                    — 楽天市場の商品名・キャッチコピー最適化(品質スコア 100、MIT)
                  </li>
                  <li>
                    <strong>rakuten-bulk-control-csv</strong>{" "}
                    <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: "#C9A84C" }}>
                      ALSEL独自
                    </span>{" "}
                    — 楽天 RMS 一括処理 CSV 作成(品質スコア 100、MIT)
                  </li>
                </ol>
                <p className="mt-2">
                  どれを入れますか? 番号で答えてください。
                </p>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded-lg bg-white">
              <div className="text-sm text-slate-500 mb-2">あなた:</div>
              <p className="text-slate-900">PDF を処理したい</p>
              <div className="text-sm text-slate-500 mt-4 mb-2">Claude Code:</div>
              <p className="text-sm text-slate-700">
                PDF 関連スキルが複数見つかりました(pdf, pdf-page-verification-correction, pdf-co-automation 等)。用途は「読み取り」「分割・結合」「OCR」「比較」のどれですか?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 提供元 */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">提供元</h2>
          <p className="text-slate-700">
            Agent Skills by ALSEL · 運営: 株式会社 ALSEL
            <br />
            お問い合わせ:{" "}
            <a
              href="mailto:info@alsel.co.jp"
              className="text-blue-600 hover:underline"
            >
              info@alsel.co.jp
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
