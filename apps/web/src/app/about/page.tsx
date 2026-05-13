export const metadata = {
  title: "About | Agent Skills by ALSEL",
  description:
    "Agent Skills by ALSEL の運営方針、データソース、翻訳について、運営会社情報。",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">About Agent Skills by ALSEL</h1>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">サービス概要</h2>
        <p className="text-slate-700 leading-relaxed">
          Agent Skills by ALSEL は、世界中の AI エージェント用スキル
          (Agent Skills) を日本語で検索・比較できる専門データベースです。
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">運営</h2>
        <ul className="text-slate-700 leading-relaxed space-y-1">
          <li>
            <strong>運営:</strong> 株式会社ALSEL
          </li>
          <li>
            <strong>代表者:</strong> 齋藤竹紘(技術評論社より 4 冊の書籍を出版、宅建士)
          </li>
          <li>
            <strong>事業:</strong> EC × AI コンサルティング、教育、不動産仲介、越境 EC
          </li>
          <li>
            <strong>実績:</strong> 18 年の EC 支援、5,000 社超の EC 事業者支援
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">データソース</h2>
        <p className="text-slate-700 leading-relaxed">
          世界中の GitHub 公開リポジトリで公開されている SKILL.md 形式のスキルを自動収集しています。
          Anthropic、OpenAI、Google、Vercel、Hugging Face 等の公式リポジトリから、世界中の個人開発者が公開する野良スキルまで網羅しています。
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
