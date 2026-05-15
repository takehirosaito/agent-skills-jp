// 共通 SEO 定数 / ヘルパ

export const SITE_URL = "https://agent-skills.jp";
export const SITE_NAME = "Agent Skills by ALSEL";
export const SITE_TAGLINE = "AI時代のスキル大全";
export const SITE_DEFAULT_TITLE = `${SITE_NAME}｜${SITE_TAGLINE}`;

export const ORG_NAME = "株式会社ALSEL";
export const ORG_LEGAL_NAME = "ALSEL Inc.";
export const ORG_URL = "https://alsel.co.jp/";
export const ORG_LOGO_URL = `${SITE_URL}/logo.svg`;

// metadata.alternates.canonical で使うフルURL文字列を返す。
// 例: canonical("/directory") -> "https://agent-skills.jp/directory"
export function canonical(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE_URL}${path === "/" ? "" : path}`;
}
