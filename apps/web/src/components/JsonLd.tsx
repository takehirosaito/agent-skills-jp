// JSON-LD (schema.org) を <script type="application/ld+json"> として描画する。
// XSS 対策のため `<` を unicode に置換している (Next.js 公式ガイドの推奨)。

// JSON.stringify が受け取れる範囲を許容する。schema.org のオブジェクトは
// ネストやキーの動的計算が多いので、ここでは構造的にゆるい型にする。
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
