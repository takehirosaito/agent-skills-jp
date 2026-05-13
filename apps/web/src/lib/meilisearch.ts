// Meilisearch クライアント & 検索ヘルパ

import { Meilisearch } from "meilisearch";
import { PERMISSIVE_LICENSES } from "./license";

const host =
  process.env.NEXT_PUBLIC_MEILI_HOST ?? "http://127.0.0.1:7700";
const apiKey =
  process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY ?? "";

const client = new Meilisearch({ host, apiKey });
const index = client.index("skills");

// サイトでデフォルト非表示にする属性群:
// - is_template: 量産テンプレ系 (Auto-activating skill for X. Triggers on: ... パターン)
// - is_internal: 特定組織の内部リポでしか使えないスキル (Claude 判定)
// - is_off_topic: 文芸/占い/ゲームfan/思想家フレームワーク等 AI/dev/業務に無関係 (Claude 判定)
// Meilisearch の != は値が一致しないドキュメント (フィールド未定義含む) も返す。
const EXCLUDE_HIDDEN = [
  "is_template != true",
  "is_internal != true",
  "is_off_topic != true",
];

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
  is_original?: boolean;
  is_featured?: boolean;
};

export const CATEGORY_LABELS: Record<string, string> = {
  "ai-development": "LLM・AI開発",
  development: "ソフトウェア開発",
  "data-analysis": "データ・分析",
  devops: "DevOps・インフラ",
  security: "セキュリティ",
  "ecommerce-marketing": "EC・マーケティング",
  "design-creative": "デザイン・クリエイティブ",
  "media-audio": "音声・動画・メディア",
  business: "ビジネス・経営",
  productivity: "個人生産性",
  documentation: "ドキュメント",
  education: "教育・学習",
  misc: "その他",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "ai-development": "🤖",
  development: "💻",
  "data-analysis": "📊",
  devops: "⚙️",
  security: "🔒",
  "ecommerce-marketing": "🛒",
  "design-creative": "🎨",
  "media-audio": "🎬",
  business: "💼",
  productivity: "✅",
  documentation: "📝",
  education: "🎓",
  misc: "📦",
};

export const VENDOR_LABELS: Record<string, string> = {
  claude: "Anthropic Claude",
  openai: "OpenAI",
  gemini: "Google Gemini",
  opencode: "OpenCode",
  generic: "汎用",
};

export type Stats = {
  totalSkills: number;
  byVendor: Record<string, number>;
  byCategory: Record<string, number>;
  byLicense: { permissive: number; restrictive: number; unknown: number };
  lastUpdated: string | null;
};

export async function getStats(): Promise<Stats> {
  try {
    // 検索キーには stats アクションが無いため、facet 検索で集計
    const [facets, latest] = await Promise.all([
      index.search("", {
        filter: EXCLUDE_HIDDEN,
        facets: ["vendor", "category", "license"],
        limit: 0,
      }),
      index
        .search("", {
          filter: EXCLUDE_HIDDEN,
          sort: ["last_updated:desc"],
          limit: 1,
          attributesToRetrieve: ["last_updated"],
        })
        .catch(() => null),
    ]);

    const byVendor = (facets.facetDistribution?.vendor ?? {}) as Record<
      string,
      number
    >;
    const byCategory = (facets.facetDistribution?.category ?? {}) as Record<
      string,
      number
    >;
    const licenseDist = (facets.facetDistribution?.license ?? {}) as Record<
      string,
      number
    >;

    const total =
      facets.estimatedTotalHits ??
      Object.values(byVendor).reduce((a, b) => a + b, 0);

    // ライセンスを 3 カテゴリに集約
    const byLicense = { permissive: 0, restrictive: 0, unknown: 0 };
    let licenseAccountedFor = 0;
    for (const [name, count] of Object.entries(licenseDist)) {
      licenseAccountedFor += count;
      if (PERMISSIVE_LICENSES.has(name)) byLicense.permissive += count;
      else if (name === "NOASSERTION") byLicense.unknown += count;
      else byLicense.restrictive += count;
    }
    // license 属性が無いドキュメント分は unknown へ加算
    const missingLicense = Math.max(0, total - licenseAccountedFor);
    byLicense.unknown += missingLicense;

    const lastUpdated =
      (latest?.hits?.[0] as { last_updated?: string } | undefined)?.last_updated ?? null;

    return {
      totalSkills: total,
      byVendor,
      byCategory,
      byLicense,
      lastUpdated,
    };
  } catch {
    return {
      totalSkills: 0,
      byVendor: {},
      byCategory: {},
      byLicense: { permissive: 0, restrictive: 0, unknown: 0 },
      lastUpdated: null,
    };
  }
}

export async function getFeaturedSkills(limit: number) {
  try {
    // ALSEL 独自スキルを最優先で取得し、足りない分は quality_score 順で埋める
    const [originals, rest] = await Promise.all([
      index.search("", {
        filter: ["is_original = true", ...EXCLUDE_HIDDEN],
        sort: ["quality_score:desc"],
        limit,
      }),
      index.search("", {
        filter: ["is_original != true", ...EXCLUDE_HIDDEN],
        sort: ["quality_score:desc"],
        limit,
      }),
    ]);
    const merged = [
      ...(originals.hits as unknown as Skill[]),
      ...(rest.hits as unknown as Skill[]),
    ];
    return merged.slice(0, limit);
  } catch {
    return [] as Skill[];
  }
}

export async function getSkillBySlug(slug: string) {
  try {
    const res = await index.search("", {
      filter: [`slug = "${slug.replace(/"/g, '\\"')}"`, ...EXCLUDE_HIDDEN],
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
        ...EXCLUDE_HIDDEN,
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
      filter: EXCLUDE_HIDDEN,
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
  const filters: string[] = [...EXCLUDE_HIDDEN];
  if (opts.vendor) filters.push(`vendor = "${opts.vendor}"`);
  if (opts.category) filters.push(`category = "${opts.category}"`);
  try {
    const res = await index.search(query, {
      filter: filters,
      facets: ["vendor", "category"],
      limit: opts.limit ?? 30,
      offset: opts.offset ?? 0,
      // 全クエリ語必須(lindera で 楽天 が [楽, 天] に分解されて
      // "last" だと「楽」だけで音楽系などにヒットしてしまうのを防ぐ)
      matchingStrategy: "all",
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
  /** ALSEL 独自スキルをトップに固定するか(品質スコア順の場合のみ有効) */
  pinOriginals?: boolean;
}) {
  const filters: string[] = [...EXCLUDE_HIDDEN];
  if (opts.vendor) filters.push(`vendor = "${opts.vendor}"`);
  if (opts.category) filters.push(`category = "${opts.category}"`);
  const sort = opts.sort ?? "quality_score:desc";

  // 独自スキルピン留め: 1 ページ目 (offset 0) では常に ALSEL 独自スキルを
  // 先頭に出す。ソート種別に依存しない (stars 順/更新日順でも上に固定)。
  // 2 ページ目以降は重複を避けるためピン留めしない。
  const shouldPin = opts.pinOriginals !== false && (opts.offset ?? 0) === 0;

  try {
    if (shouldPin) {
      const baseFilter = filters.length ? filters.join(" AND ") : "";
      const originalsFilter = baseFilter
        ? `(${baseFilter}) AND is_original = true`
        : "is_original = true";
      const restFilter = baseFilter
        ? `(${baseFilter}) AND is_original != true`
        : "is_original != true";
      const [originals, rest] = await Promise.all([
        index.search("", { filter: originalsFilter, sort: [sort], limit: 20 }),
        index.search("", {
          filter: restFilter,
          sort: [sort],
          limit: opts.limit ?? 50,
        }),
      ]);
      const merged = [
        ...(originals.hits as unknown as Skill[]),
        ...(rest.hits as unknown as Skill[]),
      ].slice(0, opts.limit ?? 50);
      return {
        hits: merged,
        total:
          (rest.estimatedTotalHits ?? 0) + (originals.estimatedTotalHits ?? 0),
      };
    }

    const res = await index.search("", {
      filter: filters.length ? filters : undefined,
      sort: [sort],
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
