// ============================================================
// app/skill/[slug]/page.tsx — スキル個別ページ
// ============================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkillBySlug, getRelatedSkills } from "@/lib/meilisearch";
import { SkillCard } from "@/components/SkillCard";
import { InstallCommand } from "@/components/InstallCommand";

export const revalidate = 86400; // 1日

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const skill = await getSkillBySlug(params.slug);
  if (!skill) return { title: "Not Found" };
  return {
    title: `${skill.name} | Agent Skills 日本`,
    description: skill.description_ja.slice(0, 150),
  };
}

export default async function SkillPage({ params }: { params: { slug: string } }) {
  const skill = await getSkillBySlug(params.slug);
  if (!skill) notFound();
  const related = await getRelatedSkills(skill.category, skill.id, 5);

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      {/* パンくず */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:underline">ホーム</Link> /{" "}
        <Link href={`/category/${skill.category}`} className="hover:underline">
          {skill.category}
        </Link>{" "}
        / {skill.name}
      </nav>

      {/* タイトル */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
            {skill.vendor}
          </span>
          <span className="text-xs text-slate-500">
            ⭐ {skill.github_stars.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">
            品質スコア {skill.quality_score}/100
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{skill.name}</h1>
        <p className="text-lg text-slate-700 leading-relaxed">
          {skill.description_ja}
        </p>
      </header>

      {/* インストールコマンド */}
      {skill.install_command && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">インストール</h2>
          <InstallCommand command={skill.install_command} />
        </section>
      )}

      {/* 元のdescription(英語) */}
      <section className="mb-8">
        <details className="border rounded-lg p-4">
          <summary className="cursor-pointer font-medium">
            英語原文を見る
          </summary>
          <p className="mt-3 text-slate-600 whitespace-pre-wrap">
            {skill.description_original}
          </p>
        </details>
      </section>

      {/* メタ情報 */}
      <section className="mb-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-3">詳細情報</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">作者</dt>
            <dd className="font-medium">{skill.author}</dd>
          </div>
          <div>
            <dt className="text-slate-500">リポジトリ</dt>
            <dd>
              <a
                href={skill.repo_url}
                target="_blank"
                rel="noopener"
                className="text-blue-600 hover:underline"
              >
                {skill.repo_name}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">ライセンス</dt>
            <dd>{skill.license ?? "不明"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">最終更新</dt>
            <dd>{skill.last_updated ? new Date(skill.last_updated).toLocaleDateString("ja-JP") : "不明"}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <a
            href={skill.repo_url}
            target="_blank"
            rel="noopener"
            className="inline-block px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
          >
            GitHubで原本を見る →
          </a>
        </div>
      </section>

      {/* 関連スキル */}
      {related.length > 0 && (
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">関連スキル</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}


// ============================================================
// components/SearchBar.tsx
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 楽天SEO、PDF処理、データ分析..."
          className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-full focus:border-blue-500 focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          検索
        </button>
      </div>
    </form>
  );
}


// ============================================================
// components/SkillCard.tsx
// ============================================================

import Link from "next/link";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description_ja: string;
  category: string;
  vendor: string;
  github_stars: number;
  quality_score: number;
  author: string;
};

export function SkillCardComp({ skill }: { skill: Skill }) {
  return (
    <Link
      href={`/skill/${skill.slug}`}
      className="block p-6 border rounded-lg hover:shadow-lg transition bg-white"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
          {skill.vendor}
        </span>
        <span className="text-xs text-slate-500">⭐ {skill.github_stars}</span>
      </div>
      <h3 className="font-bold text-lg mb-2 line-clamp-1">{skill.name}</h3>
      <p className="text-sm text-slate-600 line-clamp-3">{skill.description_ja}</p>
      <div className="mt-3 text-xs text-slate-500">by {skill.author}</div>
    </Link>
  );
}


// ============================================================
// lib/meilisearch.ts — Meilisearch client
// ============================================================

import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILI_HOST!,
  apiKey: process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY!,
});

const index = client.index("skills");

export async function getStats() {
  const stats = await index.getStats();
  const facets = await index.search("", {
    facets: ["vendor", "category"],
    limit: 0,
  });
  return {
    totalSkills: stats.numberOfDocuments,
    byVendor: facets.facetDistribution?.vendor ?? {},
    byCategory: facets.facetDistribution?.category ?? {},
  };
}

export async function getFeaturedSkills(limit: number) {
  const res = await index.search("", {
    sort: ["quality_score:desc"],
    limit,
  });
  return res.hits;
}

export async function getSkillBySlug(slug: string) {
  const res = await index.search("", {
    filter: `slug = "${slug}"`,
    limit: 1,
  });
  return res.hits[0] ?? null;
}

export async function getRelatedSkills(category: string, excludeId: string, limit: number) {
  const res = await index.search("", {
    filter: [`category = "${category}"`, `id != "${excludeId}"`],
    sort: ["quality_score:desc"],
    limit,
  });
  return res.hits;
}

export async function getCategories() {
  const facets = await index.search("", {
    facets: ["category"],
    limit: 0,
  });
  const dist = facets.facetDistribution?.category ?? {};
  return Object.entries(dist).map(([slug, count]) => ({
    slug,
    name: CATEGORY_LABELS[slug] ?? slug,
    icon: CATEGORY_ICONS[slug] ?? "📦",
    count: count as number,
  }));
}

const CATEGORY_LABELS: Record<string, string> = {
  development: "開発・コーディング",
  "data-analysis": "データ・分析",
  documentation: "ドキュメント作成",
  "ecommerce-marketing": "EC・マーケティング",
  "design-creative": "デザイン・クリエイティブ",
  devops: "DevOps・インフラ",
  business: "ビジネス・経営",
  education: "教育・学習",
  language: "翻訳・言語",
  security: "セキュリティ",
  productivity: "個人生産性",
  misc: "その他",
};

const CATEGORY_ICONS: Record<string, string> = {
  development: "💻",
  "data-analysis": "📊",
  documentation: "📝",
  "ecommerce-marketing": "🛒",
  "design-creative": "🎨",
  devops: "⚙️",
  business: "💼",
  education: "🎓",
  language: "🌐",
  security: "🔒",
  productivity: "✅",
  misc: "📦",
};
