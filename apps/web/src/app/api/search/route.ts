// GET /api/search?q=<query>&limit=<n>&vendor=<v>&category=<c>
//
// Agent Skills の検索 JSON API。
// find-skills スキル (skills/find-skills/SKILL.md) や外部の AI エージェントから
// 利用されることを想定。

import { NextResponse } from "next/server";
import { searchSkills } from "@/lib/meilisearch";

export const runtime = "nodejs";
export const revalidate = 60;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "5", 10) || 5),
  );
  const vendor = url.searchParams.get("vendor") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;

  const result = await searchSkills(q, { limit, vendor, category });

  const hits = result.hits.map((s) => ({
    slug: s.slug,
    name: s.name,
    description_ja: s.description_ja,
    description_en: s.description_original,
    vendor: s.vendor,
    category: s.category,
    author: s.author,
    license: s.license,
    quality_score: s.quality_score,
    github_stars: s.github_stars,
    is_original: s.is_original ?? false,
    repo_url: s.repo_url,
    site_url: `https://agent-skills.jp/skill/${s.slug}`,
    download_url: `https://agent-skills.jp/api/skill/${s.slug}/download`,
  }));

  return NextResponse.json(
    {
      query: q,
      total: result.total,
      count: hits.length,
      hits,
    },
    { headers: CORS },
  );
}
