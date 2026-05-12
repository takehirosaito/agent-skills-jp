"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  initial = "",
  size = "lg",
}: {
  initial?: string;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  const inputCls =
    size === "lg"
      ? "w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-full focus:border-blue-500 focus:outline-none shadow-sm"
      : "w-full px-4 py-2 text-base border border-slate-200 rounded-full focus:border-blue-500 focus:outline-none";

  const btnCls =
    size === "lg"
      ? "absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
      : "absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 楽天SEO、PDF処理、データ分析..."
          className={inputCls}
        />
        <button type="submit" className={btnCls}>
          検索
        </button>
      </div>
    </form>
  );
}
