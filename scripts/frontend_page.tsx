// app/page.tsx
// agent-skills.jp トップページ

import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { CategoryTile } from "@/components/CategoryTile";
import { SkillCard } from "@/components/SkillCard";
import { getStats, getFeaturedSkills, getCategories } from "@/lib/meilisearch";

export const revalidate = 3600; // 1時間ごと再生成

export default async function HomePage() {
  const [stats, featured, categories] = await Promise.all([
    getStats(),
    getFeaturedSkills(12),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen">
      {/* ヒーロー */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Agent Skills 日本
          </h1>
          <p className="text-xl text-slate-600 mb-10">
            Claude、ChatGPT、Geminiで使える
            <br className="md:hidden" />
            Agent Skillsを日本語で探す
          </p>
          <SearchBar />
          <p className="text-sm text-slate-500 mt-6">
            現在 <strong>{stats.totalSkills.toLocaleString()}</strong> 件の
            Agent Skillsから検索できます
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      {/* ベンダー別 */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">対応エージェント</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Anthropic Claude", slug: "claude", count: stats.byVendor.claude },
              { name: "OpenAI Codex / ChatGPT", slug: "openai", count: stats.byVendor.openai },
              { name: "Google Gemini", slug: "gemini", count: stats.byVendor.gemini },
              { name: "OpenCode", slug: "opencode", count: stats.byVendor.opencode },
            ].map((v) => (
              <Link
                key={v.slug}
                href={`/directory?vendor=${v.slug}`}
                className="block p-6 border rounded-lg hover:shadow-md transition"
              >
                <div className="text-sm text-slate-500">{v.name}</div>
                <div className="text-3xl font-bold mt-2">
                  {(v.count ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">件のスキル</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Agent Skills 日本について</h2>
          <p className="text-slate-600 leading-relaxed">
            Agent SkillsはAnthropic・OpenAI・Google
            DeepMindが事実上の標準として採用する、AIエージェントの能力モジュール仕様です。
            本サイトは世界中のSKILL.md形式のスキルを集めて日本語で検索可能にする、
            日本初のディレクトリです。
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/about"
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
            >
              詳しく見る
            </Link>
            <Link
              href="/submit"
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              スキルを登録する
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-slate-600">
          <div>
            <div className="font-bold text-slate-900">Agent Skills 日本</div>
            <div className="mt-2">運営: 株式会社ALSEL</div>
          </div>
          <div className="flex gap-6">
            <Link href="/about">About</Link>
            <Link href="/submit">投稿</Link>
            <Link href="/privacy">プライバシー</Link>
            <a href="https://github.com/agent-skills-jp" target="_blank" rel="noopener">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
