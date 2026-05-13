export const metadata = {
  title: "プライバシーポリシー | Agent Skills by ALSEL",
  description: "Agent Skills by ALSEL の個人情報の取り扱い・クッキー利用について",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-slate-500 mb-10">最終更新日: 2026 年 5 月 13 日</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">1. 取得する情報</h2>
        <p className="text-slate-700 leading-relaxed">
          本サイト「Agent Skills by ALSEL」(以下「本サイト」)は、ユーザーから個人情報をフォーム等で取得することは原則ありません。お問い合わせ・削除依頼等でメールにより氏名・連絡先等をご提供いただいた場合のみ、当該対応のために利用します。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">2. アクセス解析</h2>
        <p className="text-slate-700 leading-relaxed">
          本サイトはサービス改善のため、アクセス解析ツール(例: Vercel Analytics、Google Analytics 等)を利用する場合があります。これらは Cookie を用いて匿名のトラフィック情報を収集することがあり、個人を特定するものではありません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">3. Cookie の利用</h2>
        <p className="text-slate-700 leading-relaxed">
          本サイトはユーザー体験の改善のために Cookie を利用することがあります。Cookie はブラウザ設定により無効化できます。無効化により一部機能が利用できなくなる場合があります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">4. 外部サービスへのリンク</h2>
        <p className="text-slate-700 leading-relaxed">
          本サイトには GitHub 等の外部サービスへのリンクが含まれます。リンク先のプライバシー方針は各サービスをご確認ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">5. 取得情報の第三者提供</h2>
        <p className="text-slate-700 leading-relaxed">
          法令に基づく場合または本人の同意がある場合を除き、取得した個人情報を第三者に提供することはありません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">6. お問い合わせ</h2>
        <p className="text-slate-700 leading-relaxed">
          本ポリシーに関するご質問・開示・訂正・削除のご要望は、下記までご連絡ください。
        </p>
        <p className="text-slate-700 leading-relaxed mt-3">
          株式会社 ALSEL<br />
          メール:{" "}
          <a
            href="mailto:info@alsel.co.jp"
            className="text-blue-600 hover:underline"
          >
            info@alsel.co.jp
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">7. 改定</h2>
        <p className="text-slate-700 leading-relaxed">
          本ポリシーの内容は、必要に応じて改定することがあります。改定後の内容は本ページに掲載した時点で効力を生じます。
        </p>
      </section>
    </main>
  );
}
