import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills by ALSEL｜AI時代のスキル大全",
  description:
    "世界中から収集した Agent Skills 約 6,800 件を日本語で検索・比較。Claude、OpenAI、Gemini、OpenCode に対応するスキルを、用途・対応 AI・導入方法から探せる専門データベースです。",
  metadataBase: new URL("https://agent-skills.jp"),
  openGraph: {
    title: "Agent Skills by ALSEL｜AI時代のスキル大全",
    description:
      "世界中から収集した Agent Skills 約 6,800 件を日本語で検索・比較できる専門データベース。",
    url: "https://agent-skills.jp",
    siteName: "Agent Skills by ALSEL",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agent Skills by ALSEL",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Skills by ALSEL｜AI時代のスキル大全",
    description:
      "世界中から収集した Agent Skills 約 6,800 件を日本語で検索・比較できる専門データベース。",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
                width={426}
                height={240}
                priority
                className="h-24 md:h-32 w-auto"
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
    </html>
  );
}
