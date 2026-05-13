import Link from "next/link";
import { CategoryTile } from "@/components/CategoryTile";
import { getCategories } from "@/lib/meilisearch";

export const revalidate = 3600;

export const metadata = {
  title: "カテゴリ一覧 | Agent Skills by ALSEL",
  description:
    "Agent Skills を 12 カテゴリで分類。開発、データ分析、EC、デザイン、DevOps など、用途別にスキルを探せます。",
};

export default async function CategoryIndexPage() {
  const categories = await getCategories();
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, c) => sum + c.count, 0);

  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← ホームへ戻る
      </Link>
      <h1 className="text-3xl font-bold mt-3 mb-2">カテゴリ一覧</h1>
      <p className="text-slate-600 mb-10">
        全 <strong>{total.toLocaleString()}</strong> 件のスキルを{" "}
        <strong>{sorted.length}</strong> カテゴリに自動分類しています。気になる分野からスキルを探せます。
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((cat) => (
          <CategoryTile
            key={cat.slug}
            name={cat.name}
            slug={cat.slug}
            count={cat.count}
            icon={cat.icon}
          />
        ))}
      </div>
    </main>
  );
}
