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
      className="block p-6 border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition bg-white"
    >
      <div className="text-5xl mb-3">{icon}</div>
      <div className="font-bold text-lg text-slate-900 leading-snug">{name}</div>
      <div className="text-sm text-slate-500 mt-1.5">
        {count.toLocaleString()} 件
      </div>
    </Link>
  );
}
