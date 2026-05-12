import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { SkillCard } from "@/components/SkillCard";
import {
  searchSkills,
  CATEGORY_LABELS,
  VENDOR_LABELS,
} from "@/lib/meilisearch";

type SearchParams = Promise<{
  q?: string;
  vendor?: string;
  category?: string;
}>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", vendor, category } = await searchParams;
  const result = await searchSkills(q, { vendor, category, limit: 50 });

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-4">検索結果</h1>
      <SearchBar initial={q} size="sm" />

      <p className="mt-6 text-sm text-slate-600">
        「<strong>{q || "(全件)"}</strong>」: {result.total.toLocaleString()} 件
      </p>

      {/* ファセット */}
      <div className="flex flex-wrap gap-2 mt-4">
        {Object.entries(result.facets.vendor ?? {}).map(([v, c]) => (
          <Link
            key={v}
            href={`/search?q=${encodeURIComponent(q)}&vendor=${v}`}
            className={`text-xs px-2 py-1 rounded-full border ${
              vendor === v
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {VENDOR_LABELS[v] ?? v} ({c as number})
          </Link>
        ))}
        {Object.entries(result.facets.category ?? {}).map(([c, n]) => (
          <Link
            key={c}
            href={`/search?q=${encodeURIComponent(q)}&category=${c}`}
            className={`text-xs px-2 py-1 rounded-full border ${
              category === c
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {CATEGORY_LABELS[c] ?? c} ({n as number})
          </Link>
        ))}
        {(vendor || category) && (
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="text-xs px-2 py-1 rounded-full text-blue-600 hover:underline"
          >
            フィルタをクリア
          </Link>
        )}
      </div>

      {/* 結果一覧 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.hits.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
      {result.hits.length === 0 && (
        <p className="mt-10 text-slate-500 text-center">
          該当するスキルが見つかりませんでした。
        </p>
      )}
    </main>
  );
}
