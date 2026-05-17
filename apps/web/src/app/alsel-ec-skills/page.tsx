import Link from "next/link";
import type { Metadata } from "next";
import { SkillCard } from "@/components/SkillCard";
import { getAlselEcSkills } from "@/lib/meilisearch";
import type { Skill } from "@/lib/meilisearch";
import {
  ALSEL_EC_CATEGORIES,
  categorizeAlselEcSlug,
  type AlselEcCategoryId,
} from "@/lib/alsel-ec-categories";
import { SITE_NAME, SITE_URL, canonical } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 300;

const TITLE = "ALSEL独自・EC実務スキル100選";
const DESCRIPTION =
  "19年・5,000社のEC支援知見をAgent Skillsに体系化。楽天・Amazon・Shopify・Yahoo!・法務・データ・広告まで、EC運用の現場でそのまま使える100スキルをカテゴリ別に収録。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: canonical("/alsel-ec-skills") },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: canonical("/alsel-ec-skills"),
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default async function AlselEcSkillsPage() {
  const all = await getAlselEcSkills();

  // カテゴリ別にグルーピング
  const grouped: Record<AlselEcCategoryId, Skill[]> = {
    amazon: [],
    rakuten: [],
    shopify: [],
    yahoo: [],
    "other-cart": [],
    legal: [],
    data: [],
    customer: [],
    ad: [],
    master: [],
  };
  for (const s of all) {
    const cat = categorizeAlselEcSlug(s.slug);
    grouped[cat].push(s);
  }

  const url = canonical("/alsel-ec-skills");
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: TITLE, item: url },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <JsonLd data={[breadcrumbJsonLd]} />

      {/* ヘッダー */}
      <div className="mb-10 text-center">
        <div
          className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold text-slate-900"
          style={{ backgroundColor: "#C9A84C" }}
        >
          ALSEL独自スキル特集
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {TITLE}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
          19年・5,000社のEC支援知見をAgent Skillsに体系化。
          <br className="hidden md:inline" />
          楽天・Amazon・Shopify・Yahoo!・法務・データ・広告まで、
          <br className="hidden md:inline" />
          EC運用の現場でそのまま使える {all.length} スキル。
        </p>
      </div>

      {/* カテゴリ目次 */}
      <div className="mb-12 grid grid-cols-2 md:grid-cols-5 gap-4">
        {ALSEL_EC_CATEGORIES.map((cat) => {
          const items = grouped[cat.id] ?? [];
          return (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="block p-5 bg-white border border-slate-200 rounded-xl hover:shadow transition"
              style={{ borderLeftWidth: "5px", borderLeftColor: cat.color }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl mb-3"
                style={{ backgroundColor: cat.bg, color: cat.color }}
              >
                {cat.mark}
              </div>
              <div className="font-bold text-base text-slate-900">{cat.label}</div>
              <div className="text-sm text-slate-500 mt-1">{items.length} スキル</div>
            </a>
          );
        })}
      </div>

      {/* カテゴリ別スキルリスト */}
      {ALSEL_EC_CATEGORIES.map((cat) => {
        const items = grouped[cat.id] ?? [];
        if (items.length === 0) return null;
        return (
          <section key={cat.id} id={cat.id} className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-4 mb-4 border-b border-slate-200 pb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0"
                style={{ backgroundColor: cat.bg, color: cat.color }}
              >
                {cat.mark}
              </div>
              <h2 className="text-3xl font-bold">{cat.label}</h2>
              <span className="text-base text-slate-500">
                {items.length} スキル
              </span>
            </div>
            <p className="text-base text-slate-600 mb-6">{cat.desc}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA：find-skills（AIエージェント側）+ ALSEL EC AI（伴走支援側） */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-slate-900 text-white rounded-2xl">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            まとめてAIエージェントに使わせる
          </h2>
          <p className="text-slate-300 mb-6 leading-relaxed text-sm">
            <code className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-100">
              find-skills
            </code>{" "}
            を入れれば、Claude Code/Codex/Gemini CLIから日本語で
            「楽天の薬機法チェックして」「JANコード見直したい」と頼むだけで該当スキルが自動推薦されます。
          </p>
          <Link
            href="/find-skills"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium hover:opacity-90"
            style={{ backgroundColor: "#C9A84C", color: "#0f172a" }}
          >
            find-skills を入れる →
          </Link>
        </div>

        <div
          className="p-8 rounded-2xl border-2"
          style={{ borderColor: "#C9A84C", backgroundColor: "#FFFBEB" }}
        >
          <div
            className="inline-block px-2.5 py-0.5 mb-3 rounded-full text-xs font-bold text-slate-900"
            style={{ backgroundColor: "#C9A84C" }}
          >
            EC事業者の方へ
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
            ALSEL EC AI で「実装・運用」まで伴走
          </h2>
          <p className="text-slate-700 mb-6 leading-relaxed text-sm">
            これらのスキルを自社EC運用に組み込みたい、
            社員のAI活用を伴走支援してほしい——
            ALSELが19年・5,000社の現場知見で実装まで支援します。
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="https://alsel.co.jp/pages/alsel-ecai-lp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium hover:opacity-90"
              style={{ backgroundColor: "#0f172a", color: "#fff" }}
            >
              ALSEL EC AI を見る ↗
            </a>
            <a
              href="https://alsel.co.jp/pages/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium border border-slate-300 hover:bg-white text-slate-800"
            >
              お問い合わせ ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
