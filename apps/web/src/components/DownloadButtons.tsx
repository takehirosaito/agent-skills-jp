"use client";

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DownloadButtons({
  slug,
  contentEn,
  contentJa,
}: {
  slug: string;
  contentEn: string;
  contentJa: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {contentJa && (
        <button
          type="button"
          onClick={() => download(`${slug}.ja.SKILL.md`, contentJa)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📥 日本語訳版 SKILL.md
        </button>
      )}
      <button
        type="button"
        onClick={() => download(`${slug}.SKILL.md`, contentEn)}
        className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800"
      >
        📥 英語原本 SKILL.md
      </button>
    </div>
  );
}
