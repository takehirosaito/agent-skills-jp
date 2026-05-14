import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { getStats } from "@/lib/meilisearch";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-BG0NPT1ZF8";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getStats();
  const count = stats.totalSkills > 0
    ? stats.totalSkills.toLocaleString()
    : "6,800";
  return {
    title: {
      default: "Agent Skills by ALSEL｜AI時代のスキル大全",
      template: "%s | Agent Skills by ALSEL",
    },
    description: `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較。Claude、OpenAI、Gemini、OpenCode に対応するスキルを、用途・対応 AI・導入方法から探せる専門データベースです。`,
    metadataBase: new URL("https://agent-skills.jp"),
    openGraph: {
      title: "Agent Skills by ALSEL｜AI時代のスキル大全",
      description: `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較できる専門データベース。`,
      url: "https://agent-skills.jp",
      siteName: "Agent Skills by ALSEL",
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: "Agent Skills by ALSEL｜AI時代のスキル大全",
      description: `世界中から収集した Agent Skills 約 ${count} 件を日本語で検索・比較できる専門データベース。`,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const stats = await getStats();
  const count = stats.totalSkills.toLocaleString();

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-slate-900">
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
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
