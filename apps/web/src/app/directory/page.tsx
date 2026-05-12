import Link from "next/link";
import { SkillCard } from "@/components/SkillCard";
import {
  listSkills,
  CATEGORY_LABELS,
  VENDOR_LABELS,
} from "@/lib/meilisearch";

const PER_PAGE = 50;

type SearchParams = Promise<{
  vendor?: string;
  category?: string;
  page?: string;
  sort?: string;
}>;

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort = sp.sort ?? "quality_score:desc";
  const result = await listSkills({
    vendor: sp.vendor,
    category: sp.category,
    sort,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / PER_PAGE));

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-2">ディレクトリ</h1>
      <p className="text-slate-600 mb-6">
        全 <strong>{result.total.toLocaleString()}</strong> 件
        {sp.vendor && <> · ベンダー: {VENDOR_LABELS[sp.vendor] ?? sp.vendor}</>}
        {sp.category && <> · カテゴリ: {CATEGORY_LABELS[sp.category] ?? sp.category}</>}
      </p>

      <div className="flex gap-3 text-sm mb-6 flex-wrap">
        <SortLink current={sort} value="quality_score:desc" sp={sp}>
          品質スコア順
        </SortLink>
        <SortLink current={sort} value="github_stars:desc" sp={sp}>
          スター順
        </SortLink>
        <SortLink current={sort} value="last_updated:desc" sp={sp}>
          新着順
        </SortLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.hits.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {result.hits.length === 0 && (
        <p className="mt-10 text-slate-500 text-center">
          該当するスキルがありません。
        </p>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <nav className="mt-10 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(
            (p) => {
              const params = new URLSearchParams();
              if (sp.vendor) params.set("vendor", sp.vendor);
              if (sp.category) params.set("category", sp.category);
              if (sort !== "quality_score:desc") params.set("sort", sort);
              if (p !== 1) params.set("page", String(p));
              const q = params.toString();
              return (
                <Link
                  key={p}
                  href={`/directory${q ? `?${q}` : ""}`}
                  className={`px-3 py-1 rounded border ${
                    p === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </Link>
              );
            },
          )}
        </nav>
      )}
    </main>
  );
}

function SortLink({
  current,
  value,
  sp,
  children,
}: {
  current: string;
  value: string;
  sp: { vendor?: string; category?: string };
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (sp.vendor) params.set("vendor", sp.vendor);
  if (sp.category) params.set("category", sp.category);
  params.set("sort", value);
  return (
    <Link
      href={`/directory?${params.toString()}`}
      className={`px-3 py-1 rounded-full border ${
        current === value
          ? "bg-blue-600 text-white border-blue-600"
          : "border-slate-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
