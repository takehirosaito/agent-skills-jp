export const metadata = {
  title: "About | Agent Skills 日本",
  description: "Agent Skills 日本の運営方針・データソース・問い合わせ先",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6 prose prose-slate">
      <h1 className="text-3xl font-bold mb-6">About Agent Skills 日本</h1>

      <h2 className="text-xl font-bold mt-8 mb-3">Agent Skills とは</h2>
      <p className="text-slate-700 leading-relaxed">
        Agent Skills は、AI エージェントが特定のタスクを実行するための「能力モジュール」の業界標準仕様です。
        Anthropic Claude、OpenAI Codex / ChatGPT、Google Gemini、OpenCode など主要ベンダーが事実上の標準として採用しており、
        SKILL.md という単一の Markdown ファイルで構造化されたスキルを記述します。
      </p>

      <h2 className="text-xl font-bold mt-8 mb-3">本サイトについて</h2>
      <p className="text-slate-700 leading-relaxed">
        本サイトは、世界中の GitHub リポジトリから公開された SKILL.md を収集し、日本語で検索可能にする日本初のディレクトリです。
        英語の description は Claude Haiku で自動的に日本語訳し、12 カテゴリへ自動分類しています。
      </p>

      <h2 className="text-xl font-bold mt-8 mb-3">データソース</h2>
      <ul className="list-disc list-inside text-slate-700 space-y-1">
        <li>GitHub Search API (filename:SKILL.md)</li>
        <li>主要組織のリポジトリを直接クローン (Anthropic, OpenAI, Vercel Labs 等)</li>
        <li>日次更新を予定</li>
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-3">著作権・引用</h2>
      <p className="text-slate-700 leading-relaxed">
        SKILL.md 本文はサイト側でフルコピーせず、メタデータ(name, description, リンク)のみ引用しています。
        全文閲覧は GitHub の原本へリンクで誘導します。各スキルページに Source URL とライセンスを明示しています。
      </p>

      <h2 className="text-xl font-bold mt-8 mb-3">運営</h2>
      <p className="text-slate-700 leading-relaxed">
        株式会社ALSEL / お問い合わせ:{" "}
        <a
          href="https://github.com/agent-skills-jp"
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener"
        >
          GitHub Issues
        </a>
      </p>

      <h2 className="text-xl font-bold mt-8 mb-3">DMCA / 掲載削除依頼</h2>
      <p className="text-slate-700 leading-relaxed">
        掲載に問題がある場合は、お手数ですが GitHub Issue または問い合わせメールにてご連絡ください。
        確認次第、速やかに対応します。
      </p>
    </main>
  );
}
