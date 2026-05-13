import { ImageResponse } from "next/og";
import { getStats } from "@/lib/meilisearch";

export const runtime = "nodejs";
export const revalidate = 300;
export const alt =
  "Agent Skills by ALSEL — AI時代のスキル大全。世界中のAgent Skillsを日本語で。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const stats = await getStats();
  const count =
    stats.totalSkills > 0 ? stats.totalSkills.toLocaleString() : "6,800";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #c7d2fe 100%)",
          fontFamily: "sans-serif",
          padding: 72,
          boxSizing: "border-box",
        }}
      >
        {/* タグライン */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#64748b",
            letterSpacing: "0.2em",
            marginBottom: 16,
          }}
        >
          AI時代のスキル大全。
        </div>

        {/* ブランド名 */}
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          <span>Agent Skills&nbsp;</span>
          <span style={{ color: "#2563eb" }}>by ALSEL</span>
        </div>

        {/* メインコピー */}
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            color: "#1e293b",
            marginTop: 40,
            lineHeight: 1.3,
          }}
        >
          世界中の Agent Skills を、日本語で。
        </div>

        {/* 件数カード */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            marginTop: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              color: "#2563eb",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {count}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#475569",
              paddingBottom: 12,
            }}
          >
            件 のスキルを収録
          </div>
        </div>

        {/* スペーサー */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* URL */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          agent-skills.jp
        </div>
      </div>
    ),
    { ...size },
  );
}
