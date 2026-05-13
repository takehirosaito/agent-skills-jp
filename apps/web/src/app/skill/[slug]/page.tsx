import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSkillBySlug,
  getRelatedSkills,
  CATEGORY_LABELS,
  VENDOR_LABELS,
} from "@/lib/meilisearch";
import { classifyLicense } from "@/lib/license";
import { SkillCard } from "@/components/SkillCard";
import { InstallCommand } from "@/components/InstallCommand";
import { BodyToggle } from "@/components/BodyToggle";

export const revalidate = 86400;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) return { title: "Not Found | Agent Skills by ALSEL" };
  return {
    title: `${skill.name} | Agent Skills by ALSEL`,
    description: (skill.description_ja ?? skill.description_original).slice(0, 150),
  };
}

export default async function SkillPage({ params }: { params: Params }) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  if (!skill) notFound();
  const related = await getRelatedSkills(skill.category, skill.id, 6);
  const licenseHref = skill.license
    ? `${skill.repo_url}/blob/main/LICENSE`
    : null;

  const categoryLabel = CATEGORY_LABELS[skill.category] ?? skill.category;
  const vendorLabel = VENDOR_LABELS[skill.vendor] ?? skill.vendor;
  const licensePolicy = classifyLicense(skill.license);

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      {/* パンくず */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>{" "}
        /{" "}
        <Link href={`/category/${skill.category}`} className="hover:underline">
          {categoryLabel}
        </Link>{" "}
        / {skill.name}
      </nav>

      {/* タイトル */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {vendorLabel}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
            {categoryLabel}
          </span>
          <span className="text-xs text-slate-500">
            ⭐ {(skill.github_stars ?? 0).toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">
            品質スコア {skill.quality_score}/100
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{skill.name}</h1>
        <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
          {skill.description_ja || skill.description_original}
        </p>
      </header>

      {/* インストールコマンド */}
      {skill.install_command && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">インストール</h2>
          <InstallCommand command={skill.install_command} />
        </section>
      )}

      {/* 元のdescription(英語) */}
      {skill.language_original !== "ja" && skill.description_original && (
        <section className="mb-8">
          <details className="border border-slate-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium">
              description の原文を見る
            </summary>
            <p className="mt-3 text-slate-600 whitespace-pre-wrap">
              {skill.description_original}
            </p>
          </details>
        </section>
      )}

      {/* SKILL.md 本文(翻訳または原文 + ライセンス分岐) */}
      {skill.content_full && (
        <BodyToggle
          slug={skill.slug}
          contentEn={skill.content_full}
          contentJa={skill.content_full_ja ?? null}
          canShowFull={licensePolicy.canShowFull}
          needsCaution={licensePolicy.needsCaution}
          licenseLabel={licensePolicy.label}
          repoUrl={skill.repo_url}
          rawUrl={skill.raw_url}
        />
      )}

      {/* メタ情報 */}
      <section className="mb-8 border-t border-slate-200 pt-6">
        <h2 className="text-xl font-bold mb-3">詳細情報</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">作者</dt>
            <dd className="font-medium">{skill.author}</dd>
          </div>
          <div>
            <dt className="text-slate-500">リポジトリ</dt>
            <dd>
              <a
                href={skill.repo_url}
                target="_blank"
                rel="noopener"
                className="text-blue-600 hover:underline break-all"
              >
                {skill.repo_name}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">ライセンス</dt>
            <dd>
              {licenseHref ? (
                <a
                  href={licenseHref}
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 hover:underline"
                  title="GitHub の LICENSE ファイルを開く"
                >
                  {skill.license}
                </a>
              ) : (
                "不明"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">最終更新</dt>
            <dd>
              {skill.last_updated
                ? new Date(skill.last_updated).toLocaleDateString("ja-JP")
                : "不明"}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex gap-3 flex-wrap">
          <a
            href={skill.repo_url}
            target="_blank"
            rel="noopener"
            className="inline-block px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
          >
            GitHubで原本を見る →
          </a>
          <a
            href={`mailto:info@alsel.co.jp?subject=${encodeURIComponent(
              `[フィードバック] ${skill.name}`,
            )}&body=${encodeURIComponent(`スキル: ${skill.name}\nURL: https://agent-skills.jp/skill/${skill.slug}\n\nご意見:\n`)}`}
            className="inline-block px-5 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            フィードバックを送る
          </a>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Source: {skill.repo_url} / ライセンス: {skill.license ?? "未指定"}
        </p>
      </section>

      {/* 関連スキル */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 pt-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">関連スキル</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        </section>
      )}

      {/* アトリビューション・削除依頼 */}
      <footer className="border-t border-slate-200 mt-12 pt-6 text-xs text-slate-500 leading-relaxed">
        本サイトは GitHub 上で公開されているオープンソースの SKILL.md ファイルをクロール・インデックス化したものです。
        各スキルの著作権は原作者に帰属します。掲載に問題がある場合は{" "}
        <a
          href="mailto:info@alsel.co.jp?subject=%5B%E5%89%8A%E9%99%A4%E4%BE%9D%E9%A0%BC%5D%20agent-skills.jp"
          className="text-blue-600 hover:underline"
        >
          info@alsel.co.jp
        </a>{" "}
        または{" "}
        <Link href="/takedown" className="text-blue-600 hover:underline">
          /takedown
        </Link>{" "}
        フォームよりご連絡ください。<br />
        原作者: <strong>{skill.author}</strong> ·{" "}
        <a
          href={skill.repo_url}
          target="_blank"
          rel="noopener"
          className="text-blue-600 hover:underline"
        >
          {skill.repo_name}
        </a>{" "}
        · ライセンス: {licensePolicy.label}
      </footer>
    </main>
  );
}
