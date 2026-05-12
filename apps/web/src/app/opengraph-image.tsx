import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agent Skills 日本 — Claude / ChatGPT / Gemini で使えるスキルを日本語で探す";
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
            fontSize: 96,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          <span>Agent Skills&nbsp;</span>
          <span style={{ color: "#2563eb" }}>日本</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#475569",
            marginTop: 32,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Claude / ChatGPT / Gemini で使える Agent Skills を日本語で探せる、日本初のディレクトリ
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
