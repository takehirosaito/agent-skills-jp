"use client";

import { useState } from "react";

type Target = "claude" | "codex" | "gemini";

const COMMANDS: Record<Target, { label: string; command: string }[]> = {
  claude: [
    {
      label: "ZIPで一発インストール",
      command: `curl -L https://agent-skills.jp/api/skill/find-skills/zip -o /tmp/find-skills.zip \\
  && unzip -o /tmp/find-skills.zip -d ~/.claude/skills/`,
    },
    {
      label: "SKILL.md だけ取得",
      command: `mkdir -p ~/.claude/skills/find-skills \\
  && curl -L https://agent-skills.jp/api/skill/find-skills/download \\
       -o ~/.claude/skills/find-skills/SKILL.md`,
    },
  ],
  codex: [
    {
      label: "ZIPで一発インストール",
      command: `curl -L https://agent-skills.jp/api/skill/find-skills/zip -o /tmp/find-skills.zip \\
  && unzip -o /tmp/find-skills.zip -d ~/.agents/skills/`,
    },
    {
      label: "SKILL.md だけ取得",
      command: `mkdir -p ~/.agents/skills/find-skills \\
  && curl -L https://agent-skills.jp/api/skill/find-skills/download \\
       -o ~/.agents/skills/find-skills/SKILL.md`,
    },
  ],
  gemini: [
    {
      label: "ZIPで一発インストール",
      command: `curl -L https://agent-skills.jp/api/skill/find-skills/zip -o /tmp/find-skills.zip \\
  && unzip -o /tmp/find-skills.zip -d ~/.gemini/skills/`,
    },
    {
      label: "SKILL.md だけ取得",
      command: `mkdir -p ~/.gemini/skills/find-skills \\
  && curl -L https://agent-skills.jp/api/skill/find-skills/download \\
       -o ~/.gemini/skills/find-skills/SKILL.md`,
    },
  ],
};

const TAB_LABELS: Record<Target, string> = {
  claude: "Claude Code",
  codex: "Codex",
  gemini: "Gemini CLI",
};

function CopyableCommand({ command }: { command: string }) {
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
        className="absolute top-2 right-2 px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
      >
        {copied ? "コピー済み" : "コピー"}
      </button>
    </div>
  );
}

export function FindSkillsInstallTabs() {
  const [target, setTarget] = useState<Target>("claude");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(COMMANDS) as Target[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTarget(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              target === k
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {TAB_LABELS[k]}
          </button>
        ))}
      </div>
      <div className="space-y-5">
        {COMMANDS[target].map((c, i) => (
          <div key={i}>
            <div className="text-sm font-medium text-slate-700 mb-2">
              {c.label}
            </div>
            <CopyableCommand command={c.command} />
          </div>
        ))}
        <p className="text-xs text-slate-500">
          インストール後、{TAB_LABELS[target]} で
          「楽天SEO のスキル探して」「PDF を処理したい」など日本語で頼むと、
          裏で agent-skills.jp の検索 API が叩かれ、最適なスキルが推薦されます。
        </p>
      </div>
    </div>
  );
}
