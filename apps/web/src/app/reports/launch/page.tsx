import Link from "next/link";
import { SkillCard } from "@/components/SkillCard";
import {
  getStats,
  listSkills,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  VENDOR_LABELS,
} from "@/lib/meilisearch";

export const revalidate = 3600;

export const metadata = {
  title: "ローンチレポート | Agent Skills by ALSEL",
  description:
    "Agent Skills by ALSEL のローンチ時点での収集統計・カテゴリ分布・上位スキル",
};

export default async function LaunchReportPage() {
  const [stats, top100] = await Promise.all([
    getStats(),
    listSkills({ limit: 100, sort: "quality_score:desc" }),
  ]);

  const vendorEntries = Object.entries(stats.byVendor).sort(
    (a, b) => (b[1] as number) - (a[1] as number),
  );
  const categoryEntries = Object.entries(stats.byCategory).sort(
    (a, b) => (b[1] as number) - (a[1] as number),
  );

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← ホームへ戻る
      </Link>
      <h1 className="text-4xl font-bold mt-3 mb-2">ローンチレポート</h1>
      <p className="text-slate-600 mb-10">
        Agent Skills by ALSEL の公開時点における収集・分類・品質スコアリングの結果です。
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">📊 収集サマリ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-blue-50 rounded-lg">
            <div className="text-sm text-slate-600">総スキル数</div>
            <div className="text-3xl font-bold text-blue-700">
              {stats.totalSkills.toLocaleString()}
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">カテゴリ</div>
            <div className="text-3xl font-bold">
              {categoryEntries.length}
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">対応エージェント</div>
            <div className="text-3xl font-bold">{vendorEntries.length}</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">公開日</div>
            <div className="text-3xl font-bold">2026</div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🏷 ベンダー別件数</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {vendorEntries.map(([v, c]) => (
            <li
              key={v}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <span className="font-medium">{VENDOR_LABELS[v] ?? v}</span>
              <span className="text-slate-600">{(c as number).toLocaleString()} 件</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">📚 カテゴリ別分布</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categoryEntries.map(([c, n]) => {
            const pct = stats.totalSkills
              ? Math.round(((n as number) / stats.totalSkills) * 100)
              : 0;
            return (
              <li
                key={c}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_ICONS[c] ?? "📦"}</span>
                  <Link
                    href={`/category/${c}`}
                    className="font-medium hover:underline"
                  >
                    {CATEGORY_LABELS[c] ?? c}
                  </Link>
                </span>
                <span className="text-slate-600">
                  {(n as number).toLocaleString()} 件 ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">⭐ TOP 100 高品質スキル</h2>
        <p className="text-sm text-slate-600 mb-4">
          GitHub stars・最終更新・description 充実度・ライセンス明示などから算出した品質スコア順。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {top100.hits.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>
    </main>
  );
}
