// GET /api/skill/[slug]/zip
//
// SKILL.md + README.md(あれば)を ZIP で配布。
// 例: /api/skill/find-skills/zip → find-skills.zip
//
// Meilisearch のスキルにも対応: SKILL.md だけを ZIP に入れて返す。

import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import JSZip from "jszip";
import { getSkillBySlug } from "@/lib/meilisearch";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

async function loadLocalSkillDir(slug: string): Promise<Record<string, string> | null> {
  const candidates = [
    path.resolve(process.cwd(), "..", "..", "skills", slug),
    path.resolve(process.cwd(), "skills", slug),
  ];
  for (const dir of candidates) {
    try {
      const entries = await fs.readdir(dir);
      const files: Record<string, string> = {};
      for (const name of entries) {
        const stat = await fs.stat(path.join(dir, name));
        if (stat.isFile()) {
          files[name] = await fs.readFile(path.join(dir, name), "utf-8");
        }
      }
      if (Object.keys(files).length > 0) return files;
    } catch {
      // continue
    }
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const zip = new JSZip();
  const folder = zip.folder(slug);
  if (!folder) {
    return NextResponse.json({ error: "zip init failed" }, { status: 500, headers: CORS });
  }

  // 1) リポジトリ直下に同梱したスキル(find-skills 等)はディレクトリごと
  const localDir = await loadLocalSkillDir(slug);
  if (localDir) {
    for (const [name, content] of Object.entries(localDir)) {
      folder.file(name, content);
    }
  } else {
    // 2) Meilisearch のスキルは SKILL.md のみ
    const skill = await getSkillBySlug(slug);
    if (!skill || !skill.content_full) {
      return NextResponse.json({ error: "not found", slug }, { status: 404, headers: CORS });
    }
    folder.file("SKILL.md", skill.content_full);
    folder.file(
      "README.md",
      `# ${skill.name}\n\n${skill.description_ja ?? skill.description_original ?? ""}\n\nSource: ${skill.repo_url}\nLicense: ${skill.license ?? "(unspecified)"}\n`,
    );
  }

  const buffer = await zip.generateAsync({ type: "uint8array" });
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      ...CORS,
    },
  });
}
