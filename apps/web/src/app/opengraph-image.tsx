import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agent Skills by ALSEL — AI時代のスキル大全。世界中のAgent Skillsを日本語で。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #c7d2fe 100%)",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
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
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          <span>Agent Skills&nbsp;</span>
          <span style={{ color: "#2563eb" }}>by ALSEL</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#475569",
            marginTop: 36,
            lineHeight: 1.4,
          }}
        >
          約 6,800 件の Agent Skills を日本語で検索・比較
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#64748b",
            marginTop: 48,
            display: "flex",
            gap: 24,
          }}
        >
          <span>agent-skills.jp</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
