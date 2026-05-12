import Link from "next/link";
import { SkillCard } from "@/components/SkillCard";
import {
  listSkills,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/lib/meilisearch";

type Params = Promise<{ name: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { name } = await params;
  const label = CATEGORY_LABELS[name] ?? name;
  return {
    title: `${label} | Agent Skills 日本`,
    description: `カテゴリ「${label}」のスキル一覧`,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { name } = await params;
  const result = await listSkills({ category: name, limit: 100 });
  const label = CATEGORY_LABELS[name] ?? name;
  const icon = CATEGORY_ICONS[name] ?? "📦";

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <Link
        href="/"
        className="text-sm text-slate-500 hover:underline"
      >
        ← ホームへ戻る
      </Link>
      <h1 className="text-3xl font-bold mb-2 mt-3">
        <span className="mr-2">{icon}</span>
        {label}
      </h1>
      <p className="text-slate-600 mb-8">
        全 <strong>{result.total.toLocaleString()}</strong> 件のスキル
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.hits.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {result.hits.length === 0 && (
        <p className="mt-10 text-slate-500 text-center">
          このカテゴリにはまだスキルがありません。
        </p>
      )}
    </main>
  );
}
