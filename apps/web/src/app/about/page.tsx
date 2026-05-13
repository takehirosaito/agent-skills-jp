import type { Metadata } from "next";
import { getStats } from "@/lib/meilisearch";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getStats();
  const count = stats.totalSkills > 0
    ? stats.totalSkills.toLocaleString()
    : "6,800";
  return {
    title: "About",
    description: `Agent Skills by ALSEL の運営方針、データソース、翻訳について、運営会社情報。現在 ${count} 件のスキルを収録。`,
  };
}

export default async function AboutPage() {
  const stats = await getStats();
  const total = stats.totalSkills.toLocaleString();
  const lastUpdated = stats.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleDateString("ja-JP")
    : null;

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">About Agent Skills by ALSEL</h1>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">サービス概要</h2>
        <p className="text-slate-700 leading-relaxed">
          Agent Skills by ALSEL は、世界中の AI エージェント用スキル
          (Agent Skills) を日本語で検索・比較できる専門データベースです。現在{" "}
          <strong>{total}</strong> 件のスキルを収録しています。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">運営</h2>
        <ul className="text-slate-700 leading-relaxed space-y-1">
          <li>
            <strong>運営:</strong> 株式会社ALSEL(オルセル)
          </li>
          <li>
            <strong>代表者:</strong> 齋藤竹紘
          </li>
          <li>
            <strong>事業内容:</strong> AIソリューション事業 / ECソリューション事業 / 不動産事業
          </li>
          <li>
            <strong>設立:</strong> 2007年8月
          </li>
          <li>
            <strong>免許:</strong> 東京都知事(1)第113520号
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">データソース</h2>
        <p className="text-slate-700 leading-relaxed">
          世界中の GitHub 公開リポジトリで公開されている SKILL.md 形式のスキルを自動収集しています。
          Anthropic、OpenAI、Google、Vercel、Hugging Face 等の公式リポジトリから、世界中の個人開発者が公開する野良スキルまで網羅しています。
          現時点で <strong>{total}</strong> 件 を収録しており、日次でクロールし差分を反映しています。
          {lastUpdated && (
            <>
              {" "}最新の更新元データ: <strong>{lastUpdated}</strong>。
            </>
          )}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">翻訳について</h2>
        <p className="text-slate-700 leading-relaxed">
          スキルの日本語化は AI (Anthropic Claude Haiku) による自動翻訳です。原文(英語)も併記しているため、正確性を要する場合は原文をご確認ください。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">著作権・ライセンス</h2>
        <p className="text-slate-700 leading-relaxed">
          各スキルの著作権は原作者に帰属します。本サイトはオープンソースの SKILL.md ファイルをインデックス化したものです。寛容ライセンス(MIT, Apache 2.0, BSD, ISC, CC0 等)のスキルは本文を引用、それ以外はプレビューのみ表示するなど、ライセンスを尊重した運営を行っています。
        </p>
        <p className="text-slate-700 leading-relaxed mt-3">
          現在の内訳:{" "}
          <strong>{stats.byLicense.permissive.toLocaleString()}</strong> 件が寛容ライセンス、{" "}
          <strong>{stats.byLicense.restrictive.toLocaleString()}</strong> 件が制限的ライセンス、{" "}
          <strong>{stats.byLicense.unknown.toLocaleString()}</strong> 件がライセンス未確認。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">お問い合わせ</h2>
        <ul className="text-slate-700 leading-relaxed space-y-1">
          <li>
            メール:{" "}
            <a
              href="mailto:info@alsel.co.jp"
              className="text-blue-600 hover:underline"
            >
              info@alsel.co.jp
            </a>
          </li>
          <li>
            削除依頼:{" "}
            <a href="/takedown" className="text-blue-600 hover:underline">
              /takedown
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
