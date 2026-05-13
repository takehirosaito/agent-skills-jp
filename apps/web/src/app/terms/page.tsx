export const metadata = {
  title: "利用規約 | Agent Skills by ALSEL",
  description: "Agent Skills by ALSEL の利用規約",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-2">利用規約</h1>
      <p className="text-sm text-slate-500 mb-10">最終更新日: 2026 年 5 月 13 日</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 1 条 (適用)</h2>
        <p className="text-slate-700 leading-relaxed">
          本規約は、株式会社 ALSEL(以下「当社」)が運営するウェブサイト「Agent Skills by ALSEL」(以下「本サイト」、URL: <code>https://agent-skills.jp</code>)の利用に関する条件を、本サイトを利用する全てのユーザー(以下「ユーザー」)と当社との間で定めるものです。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 2 条 (サービスの目的)</h2>
        <p className="text-slate-700 leading-relaxed">
          本サイトは、世界中の GitHub 公開リポジトリで公開されている SKILL.md 形式のメタデータをインデックス化・分類・日本語化し、ユーザーが効率的に検索・比較できるようにすることを目的とします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 3 条 (著作権・ライセンス)</h2>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1">
          <li>本サイトに掲載されている各スキル(SKILL.md)の著作権は、それぞれの原作者に帰属します。</li>
          <li>当社は、各スキルのライセンスを尊重した運営を行います。具体的には、寛容ライセンス(MIT・Apache-2.0・BSD・ISC・CC0 等)のスキルは本文を引用し、それ以外のライセンスはプレビューのみを表示するなどの方針を採っています。</li>
          <li>ユーザーが本サイト経由で取得したスキルを利用する場合は、各スキルのライセンス条項を必ずご確認ください。</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 4 条 (禁止事項)</h2>
        <p className="text-slate-700 leading-relaxed mb-2">
          ユーザーは、本サイトの利用にあたり、以下の行為を行ってはなりません。
        </p>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1">
          <li>法令・公序良俗に反する行為</li>
          <li>当社・他のユーザー・第三者の知的財産権・名誉・プライバシー・その他の権利を侵害する行為</li>
          <li>本サイトの運営を妨害する行為(スクレイピング、過剰な負荷をかける行為、不正アクセス等)</li>
          <li>本サイトを通じて取得したコンテンツを、ライセンスで認められた範囲を超えて利用する行為</li>
          <li>その他、当社が不適切と判断する行為</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 5 条 (免責)</h2>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1">
          <li>本サイトに掲載される情報の正確性・完全性・有用性について、当社は保証しません。日本語訳は AI 自動翻訳によるものであり、誤訳を含む場合があります。</li>
          <li>本サイトの利用に起因してユーザーまたは第三者に生じた損害について、当社は責任を負いません。</li>
          <li>本サイトはメンテナンス・障害等により予告なく停止する場合があります。</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 6 条 (削除依頼)</h2>
        <p className="text-slate-700 leading-relaxed">
          スキルの著作権者または正当な代理人は、{" "}
          <a href="/takedown" className="text-blue-600 hover:underline">/takedown</a>{" "}
          または{" "}
          <a
            href="mailto:info@alsel.co.jp"
            className="text-blue-600 hover:underline"
          >
            info@alsel.co.jp
          </a>{" "}
          より削除を申請できます。当社は受領後、原則 3 営業日以内に対応します。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 7 条 (規約の改定)</h2>
        <p className="text-slate-700 leading-relaxed">
          当社は、必要に応じて本規約を改定することができます。改定後の規約は本サイトに掲載した時点で効力を生じます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">第 8 条 (準拠法・管轄)</h2>
        <p className="text-slate-700 leading-relaxed">
          本規約は日本法に準拠します。本サイトに関する紛争は、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
        </p>
      </section>

      <p className="text-slate-700 mt-12">
        運営: 株式会社 ALSEL · お問い合わせ:{" "}
        <a
          href="mailto:info@alsel.co.jp"
          className="text-blue-600 hover:underline"
        >
          info@alsel.co.jp
        </a>
      </p>
    </main>
  );
}
