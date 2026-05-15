import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { getStats } from "@/lib/meilisearch";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DEFAULT_TITLE,
  ORG_NAME,
  ORG_LEGAL_NAME,
  ORG_URL,
  ORG_LOGO_URL,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getStats();
  const count =
    stats.totalSkills > 0 ? stats.totalSkills.toLocaleString() : "6,800";
  const description = `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較。Claude、OpenAI、Gemini、OpenCode に対応するスキルを、用途・対応 AI・導入方法から探せる専門データベースです。`;
  const ogDescription = `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較できる専門データベース。`;

  return {
    title: {
      default: SITE_DEFAULT_TITLE,
      // 子ルートセグメントの `title` (文字列) にサフィックスを 1 回だけ付与する。
      // 子ページ側では「ページ固有名のみ」を返すこと (例: skill.name, "カテゴリ一覧" など)。
      template: `%s | ${SITE_NAME}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: SITE_DEFAULT_TITLE,
      description: ogDescription,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_DEFAULT_TITLE,
      description: ogDescription,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const stats = await getStats();
  const count = stats.totalSkills.toLocaleString();

  // 全ページに乗せるサイト共通の構造化データ:
  // - WebSite (potentialAction.SearchAction でサイト内検索を Google に伝える)
  // - Organization (ALSEL Inc.)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ["agent-skills.jp", "Agent Skills"],
    url: SITE_URL,
    inLanguage: "ja",
    description: "世界中の Agent Skills を日本語で検索・比較できる専門データベース。",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: ORG_URL,
    logo: ORG_LOGO_URL,
    sameAs: [SITE_URL],
  };

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 shrink-0"
              aria-label="Agent Skills by ALSEL — ホームへ"
            >
              <Image
                src="/logo.svg"
                alt="Agent Skills by ALSEL"
                width={1672}
                height={500}
                priority
                className="h-12 md:h-14 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/directory" className="hover:text-slate-900">
                ディレクトリ
              </Link>
              <Link href="/category" className="hover:text-slate-900">
                カテゴリ
              </Link>
              <Link href="/about" className="hover:text-slate-900">
                About
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate-600">
            <div>
              <div className="font-bold text-slate-900">Agent Skills by ALSEL</div>
              <div className="mt-1 text-slate-500">AI時代のスキル大全。</div>
              {stats.totalSkills > 0 && (
                <div className="mt-1 text-slate-500">
                  現在 <strong>{count}</strong> 件を収録
                </div>
              )}
              <div className="mt-2 text-xs">© 2026 ALSEL Inc. / 株式会社ALSEL</div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/about" className="hover:text-slate-900">About</Link>
              <Link href="/terms" className="hover:text-slate-900">利用規約</Link>
              <Link href="/privacy" className="hover:text-slate-900">プライバシー</Link>
              <Link href="/takedown" className="hover:text-slate-900">削除依頼</Link>
              <a href="mailto:info@alsel.co.jp" className="hover:text-slate-900">
                お問い合わせ
              </a>
            </div>
          </div>
        </footer>
        <SpeedInsights />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
