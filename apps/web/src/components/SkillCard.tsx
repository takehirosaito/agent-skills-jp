import Link from "next/link";
import type { Skill } from "@/lib/meilisearch";
import { CATEGORY_LABELS, VENDOR_LABELS } from "@/lib/meilisearch";

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      href={`/skill/${skill.slug}`}
      className={`block p-6 border rounded-lg hover:shadow-lg transition bg-white ${
        skill.is_original
          ? "border-[#C9A84C] ring-1 ring-[#C9A84C]/40"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {skill.is_original && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
            style={{ backgroundColor: "#C9A84C" }}
            title="株式会社ALSEL のオリジナルスキル"
          >
            ALSEL独自
          </span>
        )}
        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
          {VENDOR_LABELS[skill.vendor] ?? skill.vendor}
        </span>
        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
          {CATEGORY_LABELS[skill.category] ?? skill.category}
        </span>
        {!skill.is_original && (
          <span
            className="text-xs text-slate-500"
            title="このスキルが属する GitHub リポジトリ全体の Star 数。スキル単体の評価ではありません"
          >
            ⭐ リポ {(skill.github_stars ?? 0).toLocaleString()}
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-2 line-clamp-1">{skill.name}</h3>
      <p className="text-sm text-slate-600 line-clamp-3">
        {skill.description_ja || skill.description_original}
      </p>
      <div className="mt-3 text-xs text-slate-500">by {skill.author}</div>
    </Link>
  );
}
