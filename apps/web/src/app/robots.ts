import type { MetadataRoute } from "next";

// 主要 AI クローラーは、サイトをまるごと AI エージェント向けに公開している
// 本サイトの性質上、全ページを明示的に許可する（references/ も含む）。
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Meta-ExternalAgent",
];

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
      {
        userAgent: AI_BOTS,
        allow: "/",
      },
    ],
    sitemap: "https://agent-skills.jp/sitemap.xml",
  };
}
