import Link from "next/link";
import type { Metadata } from "next";
import { CategoryTile } from "@/components/CategoryTile";
import { getCategories } from "@/lib/meilisearch";
import { SITE_NAME, SITE_URL, canonical } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description:
    "Agent Skills を 12 カテゴリで分類。LLM・AI開発、ソフトウェア開発、データ分析、EC・マーケティング、デザイン、DevOps など、用途別に Agent Skills を探せます。",
  alternates: { canonical: canonical("/category") },
  openGraph: {
    title: `カテゴリ一覧 | ${SITE_NAME}`,
    description:
      "Agent Skills を 12 カテゴリで分類。LLM・AI開発、ソフトウェア開発、データ分析、EC・マーケティングなど、用途別に Agent Skills を探せます。",
    url: canonical("/category"),
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: `カテゴリ一覧 | ${SITE_NAME}`,
    description:
      "Agent Skills を 12 カテゴリで分類。用途別に Agent Skills を探せます。",
  },
};

export default async function CategoryIndexPage() {
  const categories = await getCategories();
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, c) => sum + c.count, 0);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "カテゴリ一覧",
        item: canonical("/category"),
      },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <JsonLd data={breadcrumbJsonLd} />
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
