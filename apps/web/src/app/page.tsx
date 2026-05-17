import Link from "next/link";
import type { Metadata } from "next";
import { SearchBar } from "@/components/SearchBar";
import { CategoryTile } from "@/components/CategoryTile";
import { SkillCard } from "@/components/SkillCard";
import {
  getStats,
  getFeaturedSkills,
  getCategories,
  getAlselEcSkills,
  VENDOR_LABELS,
} from "@/lib/meilisearch";
import {
  ALSEL_EC_CATEGORIES,
  categorizeAlselEcSlug,
  type AlselEcCategoryId,
} from "@/lib/alsel-ec-categories";
import { SITE_DEFAULT_TITLE, SITE_NAME, canonical } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getStats();
  const count = stats.totalSkills > 0
    ? stats.totalSkills.toLocaleString()
    : "6,800";
  const description = `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較。Claude、OpenAI、Gemini、OpenCode に対応するスキルを、用途・対応 AI・導入方法から探せる専門データベースです。`;
  return {
    // トップは title.template を適用させないため absolute を使う
    title: { absolute: SITE_DEFAULT_TITLE },
    description,
    alternates: { canonical: canonical("/") },
    openGraph: {
      title: SITE_DEFAULT_TITLE,
      description,
      url: canonical("/"),
      siteName: SITE_NAME,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_DEFAULT_TITLE,
      description,
    },
  };
}

export default async function HomePage() {
  const [stats, featured, categories, alselEc] = await Promise.all([
    getStats(),
    getFeaturedSkills(12),
    getCategories(),
    getAlselEcSkills(),
  ]);

  // ALSEL EC スキルをカテゴリ別に件数集計
  const alselEcCounts: Record<AlselEcCategoryId, number> = {
    amazon: 0,
    rakuten: 0,
    shopify: 0,
    yahoo: 0,
    "other-cart": 0,
    legal: 0,
    data: 0,
    customer: 0,
    ad: 0,
    master: 0,
  };
  for (const s of alselEc) {
    const cat = categorizeAlselEcSlug(s.slug);
    alselEcCounts[cat]++;
  }

  return (
    <main>
      {/* ヒーロー */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm tracking-widest text-slate-500 mb-4 uppercase">
            AI時代のスキル大全。
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            世界中の <span className="text-blue-600">Agent Skills</span> を、
            <br className="hidden md:inline" />
            日本語で探す。
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Claude、OpenAI、Gemini、OpenCode などに対応する Agent Skills を、日本語で検索・比較できる専門データベース。約{" "}
            <strong>{stats.totalSkills.toLocaleString()} 件</strong> を収録。
          </p>
          <SearchBar />
          <p className="text-sm text-slate-500 mt-6">
            現在{" "}
            <strong>{stats.totalSkills.toLocaleString()}</strong> 件のスキルから検索できます
          </p>
        </div>
      </section>

      {/* find-skills CTA (AIエージェントから直接使う) */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex-1">
              <div
                className="inline-block px-2 py-0.5 mb-3 rounded-full text-xs font-bold text-slate-900"
                style={{ backgroundColor: "#C9A84C" }}
              >
                ALSEL独自スキル
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                Claude Code / Codex / Gemini CLI から、
                <br className="hidden md:inline" />
                日本語でスキルを発見。
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                <code className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-100">find-skills</code> を入れるだけで、AIエージェントに「楽天SEOのスキル探して」「PDFを処理したい」と日本語で頼むと、本サイトの {stats.totalSkills.toLocaleString()} 件から最適なスキルを推薦・インストール案内します。
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 md:min-w-[260px]">
              <Link
                href="/find-skills"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium hover:opacity-90"
                style={{ backgroundColor: "#C9A84C", color: "#0f172a" }}
              >
                find-skills を入れる →
              </Link>
              <a
                href="/api/skill/find-skills/zip"
                download
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                📦 ZIP を直接ダウンロード
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ALSEL独自・EC実務スキル100選（特集） */}
      <section className="py-16 px-6 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-y border-amber-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-2 gap-4 flex-wrap">
            <div>
              <div
                className="inline-block px-2.5 py-0.5 mb-2 rounded-full text-xs font-bold text-slate-900"
                style={{ backgroundColor: "#C9A84C" }}
              >
                ALSEL独自・EC特集
              </div>
              <h2 className="text-3xl font-bold">
                日本のEC実務スキル {alselEc.length} 選
              </h2>
            </div>
            <Link
              href="/alsel-ec-skills"
              className="text-sm text-amber-700 hover:underline font-medium"
            >
              特集ページで全件を見る →
            </Link>
          </div>
          <p className="text-slate-600 mb-8 leading-relaxed">
            19年・5,000社のEC支援知見をAgent Skillsに体系化。
            楽天・Amazon・Shopify・Yahoo!・法務・データ・広告まで、EC運用の現場でそのまま使えるスキルを{" "}
            {alselEc.length} 件、カテゴリ別にまとめています。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ALSEL_EC_CATEGORIES.map((cat) => {
              const count = alselEcCounts[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/alsel-ec-skills#${cat.id}`}
                  className="block p-4 bg-white border border-amber-200 rounded-lg hover:shadow-md hover:border-amber-400 transition"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-bold text-sm leading-snug">
                    {cat.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {count} スキル
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* カテゴリ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">カテゴリから探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryTile
                key={cat.slug}
                name={cat.name}
                slug={cat.slug}
                count={cat.count}
                icon={cat.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 注目スキル */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-3xl font-bold">注目のスキル</h2>
            <Link
              href="/directory"
              className="text-sm text-blue-600 hover:underline"
            >
              全{stats.totalSkills.toLocaleString()}件を見る →
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="text-slate-500">データを準備中です。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ベンダー別 */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
            <h2 className="text-3xl font-bold">対応エージェント</h2>
            <p className="text-sm text-slate-500">
              合計 <strong>{stats.totalSkills.toLocaleString()}</strong> 件
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["claude", "openai", "gemini", "opencode", "generic"]
              .sort((a, b) => (stats.byVendor[b] ?? 0) - (stats.byVendor[a] ?? 0))
              .map((v) => (
              <Link
                key={v}
                href={`/directory?vendor=${v}`}
                className="block p-6 border border-slate-200 rounded-lg hover:shadow-md transition"
              >
                <div className="text-sm text-slate-500">
                  {VENDOR_LABELS[v] ?? v}
                </div>
                <div className="text-3xl font-bold mt-2">
                  {(stats.byVendor[v] ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">件のスキル</div>
              </Link>
              ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            ※「汎用」は対応エージェントが SKILL.md 内で明示されていない、または複数エージェントで利用できるスキルです。
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Agent Skills by ALSEL について</h2>
          <p className="text-slate-600 leading-relaxed">
            Agent Skills は Anthropic・OpenAI・Google・Vercel などが事実上の標準として採用する、AI エージェントの能力モジュール仕様です。
            本サイトは世界中の SKILL.md 形式のスキルを収集し、日本語で検索・比較できる専門データベースです。
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              href="/about"
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
            >
              詳しく見る
            </Link>
            <Link
              href="/directory"
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              ディレクトリ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
