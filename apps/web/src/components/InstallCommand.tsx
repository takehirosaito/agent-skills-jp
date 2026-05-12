"use client";

import { useState } from "react";

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  }

  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 p-4 pr-24 rounded-lg overflow-x-auto text-sm">
        <code>{command}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition"
      >
        {copied ? "コピー済み" : "コピー"}
      </button>
    </div>
  );
}
