import Link from "next/link";

export function CategoryTile({
  name,
  slug,
  count,
  icon,
}: {
  name: string;
  slug: string;
  count: number;
  icon: string;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className="block p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-300 transition bg-white"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-medium text-slate-900">{name}</div>
      <div className="text-xs text-slate-500 mt-1">
        {count.toLocaleString()} 件
      </div>
    </Link>
  );
}
