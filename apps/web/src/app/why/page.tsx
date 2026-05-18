import Link from "next/link";
import type { Metadata } from "next";
import { getStats } from "@/lib/meilisearch";
import { SITE_NAME, SITE_URL, canonical } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 300;

// 2026-05-17 時点の実数値。PageSpeed Insights (モバイル) 計測。
const PAGESPEED_PERFORMANCE = 99;
const PAGESPEED_ACCESSIBILITY = 96;
const PAGESPEED_BEST_PRACTICES = 100;
const PAGESPEED_SEO = 100;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Agent Skills by ALSEL を選ぶ理由";
  const description =
    "日本語ファースト・10,000件超の収録・EC実務カテゴリの充実・自然言語スキル探索 find-skills・PageSpeed 99 の高速性。海外の Agent Skills サービスとの違いを比較表で明示。";
  const url = canonical("/why");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function WhyPage() {
  const stats = await getStats();
  // 2026-05-17 時点で 10,000 件超を収録。スタッツ取得失敗時のフォールバック表示も用意。
  const count =
    stats.totalSkills > 0 ? stats.totalSkills.toLocaleString() : "10,000";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Agent Skills by ALSEL を選ぶ理由",
        item: canonical("/why"),
      },
    ],
  };

  return (
    <main>
      <JsonLd data={breadcrumbJsonLd} />

      {/* ヒーロー */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            なぜ Agent Skills by ALSEL を選ぶのか
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            日本語で <strong>{count}</strong> 件超の Agent Skills を検索・比較。
            <br className="hidden md:inline" />
            日本の EC 実務に直結するカテゴリと、自然言語で最適スキルを推薦する独自ツールを備えた、唯一のサービスです。
          </p>
        </div>
      </section>

      {/* 5つの差別化要素 */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* 1. 日本語ファースト */}
          <div className="border border-slate-200 rounded-lg p-6 md:p-8 bg-white">
            <div className="text-sm font-bold text-blue-600 mb-2">01</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              日本語ファースト
            </h2>
            <p className="text-slate-700 leading-relaxed">
              <strong>{count}</strong> 件超の Agent Skills
              を日本語で検索・比較できる唯一のサービス。英語ドキュメントを読み解く時間がそのままゼロに。
              スキルの説明・カテゴリ・タグまですべて日本語化されており、開発者・EC運営者・社内DX担当者がそのまま実務に投入できます。
            </p>
          </div>

          {/* 2. EC実務カテゴリの充実 */}
          <div className="border border-slate-200 rounded-lg p-6 md:p-8 bg-white">
            <div className="text-sm font-bold text-blue-600 mb-2">02</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              EC実務カテゴリの充実
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              楽天SEO、商品名最適化、RPP運用、レビュー対応、競合価格リサーチ——日本のEC運営に直結するカテゴリを前面に。
              ALSEL独自スキルも上位に並び、現場で「すぐ動く」スキルから探せます。
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "rakuten-seo",
                "amazon-seo-jp",
                "rakuten-bulk-control-csv",
                "find-skills",
                "seminar-orange",
              ].map((slug) => (
                <Link
                  key={slug}
                  href={`/skill/${slug}`}
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: "#C9A84C" }}
                >
                  {slug}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. find-skills という独自ツール */}
          <div className="border border-slate-200 rounded-lg p-6 md:p-8 bg-white">
            <div className="text-sm font-bold text-blue-600 mb-2">03</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              find-skills という独自ツール
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              自然言語で「楽天SEOやりたい」と頼むだけで、<strong>{count}</strong> 件超から
              <strong>品質スコア順に最適スキルを推薦・インストール</strong>。
              Claude Code / Codex CLI / Gemini CLI に対応し、AIエージェントの中から直接スキルを発見できます。
            </p>
            <Link
              href="/find-skills"
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              find-skills の詳細を見る →
            </Link>
          </div>

          {/* 4. 圧倒的なパフォーマンス */}
          <div className="border border-slate-200 rounded-lg p-6 md:p-8 bg-white">
            <div className="text-sm font-bold text-blue-600 mb-2">04</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              圧倒的なパフォーマンス
            </h2>
            <p className="text-slate-700 leading-relaxed mb-5">
              PageSpeed Insights (モバイル) で以下の高スコアを維持。Vercel + Next.js + Speed Insights / Web Analytics
              の構成で、検索流入の Core Web Vitals 優位を支えます。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard label="Performance" value={PAGESPEED_PERFORMANCE} />
              <ScoreCard label="Accessibility" value={PAGESPEED_ACCESSIBILITY} />
              <ScoreCard label="Best Practices" value={PAGESPEED_BEST_PRACTICES} />
              <ScoreCard label="SEO" value={PAGESPEED_SEO} />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              ※ 2026-05-17 時点、PageSpeed Insights モバイル計測値。
            </p>
          </div>
        </div>
      </section>

      {/* 5. 競合比較表 */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center">
            海外サービスとの比較
          </h2>
          <p className="text-slate-600 text-center mb-8 text-sm">
            主要な Agent Skills サービスとの違いを 5 つの軸で比較します。
          </p>

          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-slate-200 rounded-lg text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    項目
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-700 bg-blue-50">
                    Agent Skills by ALSEL
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    LobeHub Skills
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    SkillsMP
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    anthropics/skills
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-200">
                  <td className="py-3 px-4 font-medium">主要言語</td>
                  <td className="py-3 px-4 bg-blue-50 font-semibold">日本語</td>
                  <td className="py-3 px-4">英語</td>
                  <td className="py-3 px-4">英語</td>
                  <td className="py-3 px-4">英語</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-3 px-4 font-medium">収録件数</td>
                  <td className="py-3 px-4 bg-blue-50 font-semibold">
                    {count} 件超
                  </td>
                  <td className="py-3 px-4">数百件</td>
                  <td className="py-3 px-4">数百件</td>
                  <td className="py-3 px-4">数十件</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-3 px-4 font-medium">EC実務カテゴリ</td>
                  <td className="py-3 px-4 bg-blue-50 font-semibold">充実</td>
                  <td className="py-3 px-4">△</td>
                  <td className="py-3 px-4">△</td>
                  <td className="py-3 px-4 text-slate-400">なし</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-3 px-4 font-medium">自然言語スキル探索</td>
                  <td className="py-3 px-4 bg-blue-50 font-semibold">
                    find-skills 搭載
                  </td>
                  <td className="py-3 px-4 text-slate-400">なし</td>
                  <td className="py-3 px-4 text-slate-400">なし</td>
                  <td className="py-3 px-4 text-slate-400">なし</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">検索精度</td>
                  <td className="py-3 px-4 bg-blue-50 font-semibold">
                    用途・対応AI・導入方法から絞込
                  </td>
                  <td className="py-3 px-4">基本検索</td>
                  <td className="py-3 px-4">基本検索</td>
                  <td className="py-3 px-4">GitHub README 閲覧のみ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            ※ 2026-05-17 時点の各サービス公開情報に基づきます。各社の商標・サービス名はそれぞれの権利者に帰属します。
          </p>
        </div>
      </section>

      {/* 最終 CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            まずは触ってみる
          </h2>
          <p className="text-slate-600 mb-8">
            <strong>{count}</strong> 件超のスキルを眺めるところから、または find-skills
            を入れて自然言語で発見するところから始められます。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/directory"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              まずは {count} 件超のスキルを眺めてみる →
            </Link>
            <Link
              href="/find-skills"
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
            >
              find-skills を試す →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-center">
      <div className="text-3xl md:text-4xl font-bold text-blue-600 leading-none">
        {value}
      </div>
      <div className="text-xs text-slate-600 mt-2 font-medium">{label}</div>
    </div>
  );
}
