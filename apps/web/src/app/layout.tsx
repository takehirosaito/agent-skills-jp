import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills 日本 — Claude / ChatGPT / Gemini で使えるスキルを日本語で探す",
  description:
    "Anthropic Claude、OpenAI、Google Gemini、OpenCode 等の Agent Skills (SKILL.md) を世界中から収集し、日本語で検索できる日本初のディレクトリ。",
  metadataBase: new URL("https://agent-skills.jp"),
  openGraph: {
    title: "Agent Skills 日本",
    description:
      "AIエージェントの「スキル」を日本語で探せるディレクトリ",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-xl tracking-tight hover:opacity-80"
            >
              Agent Skills <span className="text-blue-600">日本</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/directory" className="hover:text-slate-900">
                ディレクトリ
              </Link>
              <Link href="/category/development" className="hover:text-slate-900">
                カテゴリ
              </Link>
              <Link href="/submit" className="hover:text-slate-900">
                投稿
              </Link>
              <Link href="/about" className="hover:text-slate-900">
                About
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
