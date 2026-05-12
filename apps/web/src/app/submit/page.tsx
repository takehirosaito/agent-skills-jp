import Link from "next/link";

export const metadata = {
  title: "スキルを投稿 | Agent Skills 日本",
};

export default function SubmitPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-4">スキルを投稿</h1>
      <p className="text-slate-700 leading-relaxed mb-6">
        あなたが作った Agent Skill (SKILL.md) を本ディレクトリに掲載しませんか?
        現在は GitHub Issue 経由で受け付けています。
      </p>

      <ol className="list-decimal list-inside text-slate-700 space-y-2 mb-8">
        <li>
          SKILL.md を含む GitHub リポジトリを公開する(MIT / Apache-2.0 などのライセンス推奨)
        </li>
        <li>
          frontmatter に <code className="bg-slate-100 px-1 rounded">name</code> と{" "}
          <code className="bg-slate-100 px-1 rounded">description</code> を必ず記載
        </li>
        <li>下の「Issue で投稿」ボタンからリポジトリ URL を送信</li>
      </ol>

      <a
        href="https://github.com/agent-skills-jp/agent-skills-jp/issues/new?title=%5Bsubmit%5D&body=%23%23%20%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AAURL%0A%0A%23%23%20%E3%82%B9%E3%82%AD%E3%83%AB%E5%90%8D%0A%0A%23%23%20%E4%BD%9C%E8%80%85%0A%0A%23%23%20%E4%B8%80%E8%A8%80"
        target="_blank"
        rel="noopener"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Issue で投稿する
      </a>

      <p className="mt-10 text-slate-500 text-sm">
        ※ 本サイトの自動クロールでも、公開リポジトリの SKILL.md は次回更新で自動収集されます。
      </p>

      <p className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← ホームへ戻る
        </Link>
      </p>
    </main>
  );
}
