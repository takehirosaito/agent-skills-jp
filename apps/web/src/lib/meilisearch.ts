// Meilisearch クライアント & 検索ヘルパ

import { Meilisearch } from "meilisearch";

const host =
  process.env.NEXT_PUBLIC_MEILI_HOST ?? "http://127.0.0.1:7700";
const apiKey =
  process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY ?? "";

const client = new Meilisearch({ host, apiKey });
const index = client.index("skills");

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description_ja: string;
  description_original: string;
  category: string;
  vendor: string;
  author: string;
  repo_name: string;
  repo_url: string;
  raw_url: string;
  github_stars: number;
  quality_score: number;
  last_updated: string | null;
  license: string | null;
  language_original: string;
  install_command?: string;
  content_full?: string;
  content_full_ja?: string | null;
};

export const CATEGORY_LABELS: Record<string, string> = {
  development: "開発・コーディング",
  "data-analysis": "データ・分析",
  documentation: "ドキュメント作成",
  "ecommerce-marketing": "EC・マーケティング",
  "design-creative": "デザイン・クリエイティブ",
  devops: "DevOps・インフラ",
  business: "ビジネス・経営",
  education: "教育・学習",
  language: "翻訳・言語",
  security: "セキュリティ",
  productivity: "個人生産性",
  misc: "その他",
};

export const CATEGORY_ICONS: Record<string, string> = {
  development: "💻",
  "data-analysis": "📊",
  documentation: "📝",
  "ecommerce-marketing": "🛒",
  "design-creative": "🎨",
  devops: "⚙️",
  business: "💼",
  education: "🎓",
  language: "🌐",
  security: "🔒",
  productivity: "✅",
  misc: "📦",
};

export const VENDOR_LABELS: Record<string, string> = {
  claude: "Anthropic Claude",
  openai: "OpenAI",
  gemini: "Google Gemini",
  opencode: "OpenCode",
  generic: "汎用",
};

export async function getStats() {
  try {
    // 検索キーには stats アクションが無いため、facet 検索で集計
    const facets = await index.search("", {
      facets: ["vendor", "category"],
      limit: 0,
    });
    const byVendor = (facets.facetDistribution?.vendor ?? {}) as Record<
      string,
      number
    >;
    const byCategory = (facets.facetDistribution?.category ?? {}) as Record<
      string,
      number
    >;
    const total =
      facets.estimatedTotalHits ??
      Object.values(byVendor).reduce((a, b) => a + b, 0);
    return { totalSkills: total, byVendor, byCategory };
  } catch {
    return { totalSkills: 0, byVendor: {}, byCategory: {} };
  }
}

export async function getFeaturedSkills(limit: number) {
  try {
    const res = await index.search("", {
      sort: ["quality_score:desc"],
      limit,
    });
    return res.hits as unknown as Skill[];
  } catch {
    return [] as Skill[];
  }
}

export async function getSkillBySlug(slug: string) {
  try {
    const res = await index.search("", {
      filter: `slug = "${slug.replace(/"/g, '\\"')}"`,
      limit: 1,
    });
    return (res.hits[0] as unknown as Skill) ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedSkills(
  category: string,
  excludeId: string,
  limit: number,
) {
  try {
    const res = await index.search("", {
      filter: [
        `category = "${category}"`,
        `id != "${excludeId}"`,
      ],
      sort: ["quality_score:desc"],
      limit,
    });
    return res.hits as unknown as Skill[];
  } catch {
    return [] as Skill[];
  }
}

export async function getCategories() {
  try {
    const facets = await index.search("", {
      facets: ["category"],
      limit: 0,
    });
    const dist = (facets.facetDistribution?.category ?? {}) as Record<
      string,
      number
    >;
    // すべての既知カテゴリを表示(0件でも表示)
    const allKeys = new Set([
      ...Object.keys(CATEGORY_LABELS),
      ...Object.keys(dist),
    ]);
    return Array.from(allKeys).map((slug) => ({
      slug,
      name: CATEGORY_LABELS[slug] ?? slug,
      icon: CATEGORY_ICONS[slug] ?? "📦",
      count: dist[slug] ?? 0,
    }));
  } catch {
    return Object.keys(CATEGORY_LABELS).map((slug) => ({
      slug,
      name: CATEGORY_LABELS[slug],
      icon: CATEGORY_ICONS[slug],
      count: 0,
    }));
  }
}

export async function searchSkills(
  query: string,
  opts: {
    vendor?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const filters: string[] = [];
  if (opts.vendor) filters.push(`vendor = "${opts.vendor}"`);
  if (opts.category) filters.push(`category = "${opts.category}"`);
  try {
    const res = await index.search(query, {
      filter: filters.length ? filters : undefined,
      facets: ["vendor", "category"],
      limit: opts.limit ?? 30,
      offset: opts.offset ?? 0,
      attributesToHighlight: ["name", "description_ja"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });
    return {
      hits: res.hits as unknown as Skill[],
      total: res.estimatedTotalHits ?? 0,
      facets: res.facetDistribution ?? {},
    };
  } catch {
    return { hits: [] as Skill[], total: 0, facets: {} };
  }
}

export async function listSkills(opts: {
  vendor?: string;
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}) {
  const filters: string[] = [];
  if (opts.vendor) filters.push(`vendor = "${opts.vendor}"`);
  if (opts.category) filters.push(`category = "${opts.category}"`);
  try {
    const res = await index.search("", {
      filter: filters.length ? filters : undefined,
      sort: [opts.sort ?? "quality_score:desc"],
      limit: opts.limit ?? 50,
      offset: opts.offset ?? 0,
    });
    return {
      hits: res.hits as unknown as Skill[],
      total: res.estimatedTotalHits ?? 0,
    };
  } catch {
    return { hits: [] as Skill[], total: 0 };
  }
}
