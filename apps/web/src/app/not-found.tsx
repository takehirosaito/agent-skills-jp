import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto py-20 px-6 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-slate-600 mb-8">
        お探しのスキルまたはページが見つかりませんでした。
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
        >
          ホームへ戻る
        </Link>
        <Link
          href="/directory"
          className="px-5 py-2 border border-slate-300 rounded-lg hover:bg-slate-100"
        >
          ディレクトリを見る
        </Link>
      </div>
    </main>
  );
}
