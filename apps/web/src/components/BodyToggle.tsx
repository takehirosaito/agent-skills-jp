"use client";

import { useState } from "react";
import { MarkdownView } from "./MarkdownView";
import { DownloadButtons } from "./DownloadButtons";

type Props = {
  slug: string;
  contentEn: string;
  contentJa: string | null;
  canShowFull: boolean;
  needsCaution: boolean;
  licenseLabel: string;
  repoUrl: string;
  rawUrl: string;
};

const PREVIEW_LENGTH = 600;

export function BodyToggle(props: Props) {
  const {
    slug,
    contentEn,
    contentJa,
    canShowFull,
    needsCaution,
    licenseLabel,
    repoUrl,
    rawUrl,
  } = props;

  // 翻訳本文が利用可能かつ寛容ライセンスなら、デフォルト日本語
  const hasJa = !!contentJa && contentJa.trim().length > 0;
  const [lang, setLang] = useState<"ja" | "en">(hasJa ? "ja" : "en");

  const fullContent = lang === "ja" && hasJa ? contentJa! : contentEn;

  // プレビュー(冒頭のみ + frontmatter は隠す)
  const stripFrontmatter = (s: string) =>
    s.replace(/^---[\s\S]*?---\n*/, "");
  const preview = stripFrontmatter(fullContent).slice(0, PREVIEW_LENGTH);

  return (
    <section className="mt-10 border-t border-slate-200 pt-8">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold">SKILL.md 本文</h2>
        <div className="flex items-center gap-2">
          {hasJa && (
            <div className="inline-flex rounded-md border border-slate-300 text-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setLang("ja")}
                className={`px-3 py-1 ${
                  lang === "ja"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                日本語訳
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 ${
                  lang === "en"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                英語原文
              </button>
            </div>
          )}
        </div>
      </div>

      {canShowFull ? (
        <>
          <div className="mb-4">
            <DownloadButtons
              slug={slug}
              contentEn={contentEn}
              contentJa={hasJa ? contentJa : null}
            />
          </div>
          <MarkdownView content={fullContent} />
          <p className="mt-6 text-xs text-slate-500">
            ライセンス: <strong>{licenseLabel}</strong>(寛容ライセンスのため全文を引用しています) ·{" "}
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener"
              className="text-blue-600 hover:underline"
            >
              原本リポジトリ
            </a>
          </p>
        </>
      ) : (
        <>
          {needsCaution && (
            <div className="mb-4 p-4 border border-amber-300 bg-amber-50 rounded-lg text-sm text-amber-900">
              <strong>注意:</strong>{" "}
              このスキルのライセンスは <strong>{licenseLabel}</strong>{" "}
              です。本サイトでは本文プレビューのみを表示しています。利用前に GitHub の原本でライセンス条件をご確認ください。
            </div>
          )}
          <MarkdownView content={preview + (fullContent.length > PREVIEW_LENGTH ? "\n\n..." : "")} />
          <div className="mt-6 flex gap-3 flex-wrap">
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener"
              className="inline-block px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
            >
              全文を GitHub の原本で見る →
            </a>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener"
              className="inline-block px-5 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700"
            >
              リポジトリ
            </a>
          </div>
        </>
      )}
    </section>
  );
}
