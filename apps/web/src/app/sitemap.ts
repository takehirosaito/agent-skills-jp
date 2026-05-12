import type { MetadataRoute } from "next";
import { listSkills, CATEGORY_LABELS } from "@/lib/meilisearch";

const SITE = "https://agent-skills.jp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticUrls: MetadataRoute.Sitemap = [
    "",
    "/directory",
    "/submit",
    "/about",
    "/reports/launch",
  ].map((p) => ({
    url: `${SITE}${p}`,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1.0 : 0.7,
    lastModified: new Date(),
  }));

  // カテゴリページ
  const categoryUrls: MetadataRoute.Sitemap = Object.keys(CATEGORY_LABELS).map(
    (slug) => ({
      url: `${SITE}/category/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
      lastModified: new Date(),
    }),
  );

  // 個別スキルページ (最大 5000 件まで)
  const skillUrls: MetadataRoute.Sitemap = [];
  try {
    const PAGE = 1000;
    for (let offset = 0; offset < 5000; offset += PAGE) {
      const r = await listSkills({ limit: PAGE, offset });
      for (const s of r.hits) {
        skillUrls.push({
          url: `${SITE}/skill/${s.slug}`,
          changeFrequency: "weekly",
          priority: 0.5,
          lastModified: s.last_updated ? new Date(s.last_updated) : new Date(),
        });
      }
      if (r.hits.length < PAGE) break;
    }
  } catch {
    // sitemap 生成失敗時は静的のみ
  }

  return [...staticUrls, ...categoryUrls, ...skillUrls];
}
