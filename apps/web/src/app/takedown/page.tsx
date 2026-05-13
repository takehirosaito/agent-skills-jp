import Link from "next/link";

export const metadata = {
  title: "削除依頼 / Takedown | Agent Skills by ALSEL",
  description:
    "agent-skills.jp に掲載されているスキル情報の削除依頼フォーム。著作権者・代理人のご請求を受け付けます。",
};

const SUBJECT = encodeURIComponent("[削除依頼] agent-skills.jp");
const BODY_TEMPLATE = encodeURIComponent(`■ 対象スキルの URL (複数の場合は改行で区切り)
https://agent-skills.jp/skill/<slug>

■ 対象スキルの GitHub リポジトリ URL
https://github.com/<owner>/<repo>

■ 申請者(著作権者 or 代理人)
氏名:
所属:
連絡先メール:
電話番号:

■ 著作権者本人である / 正当な代理権を有する旨の宣誓
( ) はい

■ 削除理由 (該当する項目に印)
[ ] 著作権侵害
[ ] ライセンス違反
[ ] 個人情報・プライバシー侵害
[ ] その他 (理由を記載):

■ 詳細・補足
(任意)

■ 上記内容に虚偽がないことを誓約します
( ) 誓約します
氏名:
日付: YYYY-MM-DD`);

export default function TakedownPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← ホームへ戻る
      </Link>
      <h1 className="text-3xl font-bold mt-3 mb-4">
        削除依頼 / Takedown Notice
      </h1>
      <p className="text-slate-700 leading-relaxed mb-6">
        当サイト「Agent Skills by ALSEL」(<code>agent-skills.jp</code>)に掲載されている SKILL.md
        およびメタ情報について、削除をご希望の権利者・代理人の方は、以下の手順に従ってご請求ください。
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">基本方針</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1">
          <li>
            本サイトは GitHub 上で<strong>公開</strong>されている SKILL.md
            ファイルをクロール・インデックス化したものです。
          </li>
          <li>
            メタデータ(name, description, リンク)は引用の範囲、本文(content)は寛容ライセンス(MIT, Apache-2.0 等)のみ全文を表示しています。
          </li>
          <li>
            それ以外のライセンス(NOASSERTION、GPL 系等)は冒頭プレビューのみ表示しています。
          </li>
          <li>
            権利者または代理人からの削除依頼を受領後、原則 <strong>3 営業日以内</strong> に対応します。
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">依頼方法</h2>
        <ol className="list-decimal list-inside text-slate-700 space-y-2 mb-6">
          <li>
            下記「依頼メールを作成」ボタンを押すと、テンプレが入った状態でメールクライアントが開きます。
          </li>
          <li>必要事項を埋めて送信してください。</li>
          <li>
            権利者本人 / 代理人であることを確認できる書類が必要となる場合があります(後日メールでご案内)。
          </li>
        </ol>
        <a
          href={`mailto:info@alsel.co.jp?subject=${SUBJECT}&body=${BODY_TEMPLATE}`}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ✉️ 依頼メールを作成
        </a>
        <p className="mt-3 text-sm text-slate-500">
          メールが開かない場合は{" "}
          <a
            href="mailto:info@alsel.co.jp"
            className="text-blue-600 hover:underline"
          >
            info@alsel.co.jp
          </a>{" "}
          まで直接ご送信ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">必要記載事項</h2>
        <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm">
          <li>削除対象の URL (例: https://agent-skills.jp/skill/xxx)</li>
          <li>対象 SKILL.md の GitHub 原本 URL</li>
          <li>申請者の氏名・所属・連絡先(メール / 電話)</li>
          <li>著作権者本人 / 正当な代理権を有する旨の宣誓</li>
          <li>削除理由(著作権侵害・ライセンス違反・個人情報など)</li>
          <li>申請内容に虚偽がない旨の誓約</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">運営者</h2>
        <p className="text-slate-700">
          株式会社ALSEL<br />
          連絡先:{" "}
          <a
            href="mailto:info@alsel.co.jp"
            className="text-blue-600 hover:underline"
          >
            info@alsel.co.jp
          </a>
        </p>
      </section>

      <p className="text-xs text-slate-400 mt-12">
        本フォームでは、本サイトのインデックスからの削除のみを受け付けています。
        GitHub の原本リポジトリへの削除請求は GitHub の DMCA 窓口へ別途お送りください。
      </p>
    </main>
  );
}
