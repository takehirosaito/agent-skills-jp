import { CATEGORY_LABELS, getStats } from "@/lib/meilisearch";
import { ORG_LEGAL_NAME, ORG_NAME, ORG_URL, SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const stats = await getStats();
  const count = stats.totalSkills > 0 ? stats.totalSkills.toLocaleString() : "6,800";

  const categoryLines = Object.entries(CATEGORY_LABELS)
    .map(([slug, label]) => `- [${label}](${SITE_URL}/category/${slug})`)
    .join("\n");

  const body = `# ${SITE_NAME}

> 世界中の Agent Skills（AIエージェント向けスキル）を日本語で検索・比較できる専門データベース。Claude、OpenAI、Codex、Gemini CLI、OpenCode に対応する約 ${count} 件のスキルを収録しています。

${SITE_NAME} は、AIエージェントが「やりたいこと」から最適なスキル（プロンプト・コード・ツールセット）を日本語で発見し、SKILL.md または ZIP として取得して導入できる、日本最大級の Agent Skills データベースです。検索・カテゴリ・ベンダー（Claude / OpenAI / Gemini など）別に絞り込めます。

## 主要ページ

- [トップページ](${SITE_URL}/): サイト全体の入口・最新スキル
- [全スキル一覧（ディレクトリ）](${SITE_URL}/directory): 収録されている全 ${count} 件のスキルを一覧
- [カテゴリ一覧](${SITE_URL}/category): 13カテゴリで絞り込み
- [find-skills（AIエージェント向け利用ガイド）](${SITE_URL}/find-skills): AIエージェントから本データベースを使うための公式ガイド
- [ALSEL独自・EC実務スキル100選](${SITE_URL}/alsel-ec-skills): 株式会社ALSELが独自に作成した、EC・楽天・Amazon運用のための実務スキル集
- [スキル登録依頼（Submit）](${SITE_URL}/submit): 新規スキル掲載リクエスト
- [About](${SITE_URL}/about): 運営方針・収録基準
- [プライバシーポリシー](${SITE_URL}/privacy)
- [利用規約](${SITE_URL}/terms)
- [削除依頼フォーム](${SITE_URL}/takedown)

## カテゴリ

${categoryLines}

## AIエージェントからの利用方法

このサイトのデータは AI エージェントから直接利用することを前提に設計されています。各スキルページには以下のエンドポイントが用意されています。

- スキル詳細ページ（HTML + 構造化データ JSON-LD）: \`${SITE_URL}/skill/{slug}\`
- スキルZIP一括ダウンロード: \`${SITE_URL}/api/skill/{slug}/zip\`
- スキル単体Markdown（SKILL.md）: \`${SITE_URL}/api/skill/{slug}/download\`
- スキル検索API: \`${SITE_URL}/api/search?q={query}\`
- サイトマップ（全スキルURL一覧）: \`${SITE_URL}/sitemap.xml\`

AIエージェントが特定タスクのスキルを探す場合、まず [find-skills ガイド](${SITE_URL}/find-skills) を参照してください。コマンドライン（Claude Code / Codex CLI / Gemini CLI 等）からのインストール手順を含む完全な利用方法が記載されています。

## ライセンス

収録されている各スキルは個別のライセンス（Apache-2.0、MIT、CC-BY、独自ライセンスなど）を持ちます。スキル詳細ページの「ライセンス」欄に明記されているライセンスに従ってください。本データベース自体（${SITE_NAME}）の検索結果・分類・メタデータは、引用元として ${SITE_URL} を明記した上で AI モデルの回答に利用することができます。

## 運営：${ORG_NAME}（${ORG_LEGAL_NAME}）

${ORG_NAME} は、19年・5,000社以上の EC 支援実績を持つ、日本のEC × AI コンサルティング企業です。楽天市場・Amazon・Shopify などの EC 運営を AI で伴走支援しています。本データベース「${SITE_NAME}」は、ALSEL が AI 活用ノウハウを社会還元する一環として無償運営しています。

- [株式会社ALSEL コーポレートサイト](${ORG_URL})
- [ALSEL EC AI（EC × AI コンサルティングサービス）](${ORG_URL}pages/alsel-ecai-lp): EC事業者向けに、AIエージェント／LLM導入・運用設計を伴走で支援
- [お問い合わせ](${ORG_URL}pages/contact)
- 本サイトに関する問い合わせ: info@alsel.co.jp
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
