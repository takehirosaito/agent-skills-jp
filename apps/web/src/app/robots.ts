import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // SKILL.md 本文中の相対リンクがブラウザのベース URL から
        // /skill/references/... に誤って解決され Googlebot が 404 を踏むのを防ぐ
        disallow: ["/skill/references/", "/skill/*/references/"],
      },
    ],
    sitemap: "https://agent-skills.jp/sitemap.xml",
  };
}
