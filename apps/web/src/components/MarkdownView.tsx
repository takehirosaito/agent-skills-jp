"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

// SKILL.md は元々 GitHub リポジトリ内に置かれていた前提のファイルなので、
// 本文中の相対リンクは「同じリポジトリ内の別ファイル」を指している。
// 当サイトの /skill/[slug] 配下にそのファイルは無く、ブラウザは現在URLから
// /skill/references/xxx.md などと解決して 404 を量産する(GSC で 109件検出)。
// → リンクを定義しても飛び先が無いため、非リンクの <code> 表記に置き換える。
function isSafeAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function isAnchorLink(href: string): boolean {
  return href.startsWith("#");
}

function isMailOrTel(href: string): boolean {
  return /^(mailto:|tel:)/i.test(href);
}

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, node: _node, ...rest }) => {
            void _node;
            const h = href ?? "";
            if (!h || (!isSafeAbsoluteUrl(h) && !isAnchorLink(h) && !isMailOrTel(h))) {
              // 相対パス・bare filename・スラッシュ始まりの未知のパスは
              // すべて非リンクの <code> に倒す(404 / 誤クロール防止)
              return <code>{children}</code>;
            }
            if (isAnchorLink(h) || isMailOrTel(h)) {
              return (
                <a href={h} {...rest}>
                  {children}
                </a>
              );
            }
            // 外部 http(s) リンク: SKILL.md 本文は第三者由来コンテンツなので
            // PageRank を渡さず Googlebot のクロール対象から外す
            return (
              <a
                href={h}
                target="_blank"
                rel="nofollow noopener noreferrer"
                {...rest}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
