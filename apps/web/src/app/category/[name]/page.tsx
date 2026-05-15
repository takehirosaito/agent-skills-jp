import Link from "next/link";
import type { Metadata } from "next";
import { SkillCard } from "@/components/SkillCard";
import {
  listSkills,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/lib/meilisearch";
import { SITE_NAME, SITE_URL, canonical } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 300;

type Params = Promise<{ name: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { name } = await params;
  const label = CATEGORY_LABELS[name] ?? name;
  // metadata 生成時に件数を取得 (revalidate ありで再生成される)
  const { total } = await listSkills({
    category: name,
    limit: 1,
    pinOriginals: false,
  });
  const countStr = total.toLocaleString();
  const description = `${label}に関する Agent Skills を ${countStr} 件収録。Claude、OpenAI、Gemini、OpenCode に対応するスキルを、用途・対応 AI・導入方法から探せます。`;
  const url = canonical(`/category/${name}`);

  return {
    // layout の template が " | Agent Skills by ALSEL" を付けるので、ここはカテゴリ名のみ
    title: label,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { name } = await params;
  const result = await listSkills({ category: name, limit: 100 });
  const label = CATEGORY_LABELS[name] ?? name;
  const icon = CATEGORY_ICONS[name] ?? "📦";
  const url = canonical(`/category/${name}`);

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
      { "@type": "ListItem", position: 3, name: label, item: url },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: `${label} の Agent Skills`,
    description: `${label}に関する Agent Skills の一覧。`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "ja",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: result.total,
      itemListElement: result.hits.slice(0, 20).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonical(`/skill/${s.slug}`),
        name: s.name,
      })),
    },
  };

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />
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
