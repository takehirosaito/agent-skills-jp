// GET /api/skill/[slug]/download?lang=ja|en
//
// SKILL.md を text/markdown でダウンロード。
// lang=ja(デフォルト) → 日本語訳本文(英語 frontmatter は保持)
// lang=en → 英語原本

import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { getSkillBySlug } from "@/lib/meilisearch";

export const runtime = "nodejs";
export const revalidate = 300;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

/** リポジトリ直下の skills/<slug>/SKILL.md を直接配信(find-skills 等) */
async function readLocalSkill(slug: string): Promise<string | null> {
  const candidates = [
    path.resolve(process.cwd(), "..", "..", "skills", slug, "SKILL.md"),
    path.resolve(process.cwd(), "skills", slug, "SKILL.md"),
  ];
  for (const p of candidates) {
    try {
      return await fs.readFile(p, "utf-8");
    } catch {
      // continue
    }
  }
  return null;
}

function stripMarkdownFence(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/);
  return m ? m[1] : s;
}

function stripFrontmatter(s: string): string {
  let t = s.replace(/^\s*---\s*\n[\s\S]*?\n---\s*\n+/, "");
  t = t.replace(/^(?:[A-Za-z_][\w-]*\s*:[^\n]*\n)+\s*\n+/, "");
  return t;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const lang = (url.searchParams.get("lang") ?? "ja").toLowerCase();

  // 1) リポジトリ直下に同梱したスキル(find-skills など)を優先
  const local = await readLocalSkill(slug);
  if (local) {
    return new NextResponse(local, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.SKILL.md"`,
        ...CORS,
      },
    });
  }

  // 2) Meilisearch のスキル
  const skill = await getSkillBySlug(slug);
  if (!skill) {
    return NextResponse.json({ error: "not found", slug }, { status: 404, headers: CORS });
  }

  const en = skill.content_full ?? "";
  const rawJa = skill.content_full_ja;
  const ja = rawJa ? stripMarkdownFence(rawJa) : "";

  let body = en;
  let filename = `${slug}.SKILL.md`;
  if (lang === "ja" && ja) {
    // SKILL.md の体裁を保つため、元の英語 frontmatter + 翻訳本文
    const fm = en.match(/^---\s*\n[\s\S]*?\n---\s*\n/)?.[0] ?? "";
    body = fm + stripFrontmatter(ja);
    filename = `${slug}.ja.SKILL.md`;
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...CORS,
    },
  });
}
