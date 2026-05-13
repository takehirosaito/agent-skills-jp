import Link from "next/link";
import type { Metadata } from "next";
import { SearchBar } from "@/components/SearchBar";
import { CategoryTile } from "@/components/CategoryTile";
import { SkillCard } from "@/components/SkillCard";
import {
  getStats,
  getFeaturedSkills,
  getCategories,
  VENDOR_LABELS,
} from "@/lib/meilisearch";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getStats();
  const count = stats.totalSkills > 0
    ? stats.totalSkills.toLocaleString()
    : "6,800";
  return {
    title: "Agent Skills by ALSEL｜AI時代のスキル大全",
    description: `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較。Claude、OpenAI、Gemini、OpenCode に対応するスキルを、用途・対応 AI・導入方法から探せる専門データベースです。`,
  };
}

export default async function HomePage() {
  const [stats, featured, categories] = await Promise.all([
    getStats(),
    getFeaturedSkills(12),
    getCategories(),
  ]);

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
