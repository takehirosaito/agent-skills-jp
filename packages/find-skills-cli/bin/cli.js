#!/usr/bin/env node
"use strict";

/**
 * alsel-find-skills <query> [--category=<slug>] [--limit=<n>] [--json]
 *
 * Agent Skills by ALSEL の内蔵インデックス (skills-index.json) から
 * 日本語クエリに合致するスキルを返す。Claude / Codex / Gemini CLI /
 * claude.ai いずれのエージェントからでも `npx alsel-find-skills <query>`
 * で呼び出せる。
 *
 * 出力はデフォルトで人間可読、--json で JSON 配列。
 * トークン分解: 「楽天SEO」→ ["楽天","SEO"]、AND マッチ。
 * ALSEL 独自 (alsel:true) を先頭ピン、続いて品質スコア降順。
 */

const fs = require("fs");
const path = require("path");

const VALID_CATEGORIES = new Set([
  "ai-development",
  "development",
  "data-analysis",
  "devops",
  "security",
  "ecommerce-marketing",
  "design-creative",
  "media-audio",
  "business",
  "productivity",
  "documentation",
  "education",
  "misc",
]);

function parseArgs(argv) {
  const out = { tokens: [], limit: 5, category: null, json: false, help: false };
  for (const a of argv) {
    if (a === "-h" || a === "--help") out.help = true;
    else if (a === "--json") out.json = true;
    else if (a.startsWith("--limit=")) out.limit = Math.max(1, parseInt(a.slice(8), 10) || 5);
    else if (a.startsWith("--category=")) out.category = a.slice(11);
    else if (a.startsWith("--")) {
      process.stderr.write(`unknown option: ${a}\n`);
      process.exit(2);
    } else {
      out.tokens.push(a);
    }
  }
  return out;
}

function showHelp() {
  process.stderr.write(
    [
      "alsel-find-skills <query> [options]",
      "",
      "Agent Skills by ALSEL の約 4,000 件インデックスから日本語クエリで",
      "スキルを検索する。ALSEL 独自スキルを先頭にピン留めし、続いて",
      "品質スコア降順で表示。",
      "",
      "options:",
      "  --category=<slug>  カテゴリで絞り込み (ai-development 等)",
      "  --limit=<n>        上位 n 件まで表示 (デフォルト 5)",
      "  --json             機械可読の JSON 配列で出力",
      "  -h, --help         このヘルプを表示",
      "",
      "examples:",
      "  alsel-find-skills 楽天SEO",
      "  alsel-find-skills 楽天 SEO --limit=10",
      "  alsel-find-skills PDF 処理 --category=ai-development --json",
      "",
    ].join("\n")
  );
}

/**
 * 日本語/英数字混在のクエリをトークン化する。
 * 「楽天SEO」→ ["楽天","SEO"]
 * 「PDF処理」→ ["PDF","処理"]
 * すでに空白区切りなら各空白要素もさらに細分化する。
 */
function tokenize(parts) {
  const joined = parts.join(" ");
  const m = joined.match(
    /[一-鿿぀-ゟ゠-ヿ]+|[A-Za-z0-9_-]+/gu
  );
  return m ? m.filter((t) => t.length > 0) : [];
}

function loadIndex() {
  const p = path.join(__dirname, "..", "skills-index.json");
  if (!fs.existsSync(p)) {
    process.stderr.write(
      `skills-index.json not found at ${p}.\n` +
        `If running from source, run: node scripts/sync-index.js\n`
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function search(index, tokens, category) {
  const rxs = tokens.map((t) => new RegExp(escapeRe(t), "i"));
  let hits = index.skills.filter((s) => {
    if (category && s.category !== category) return false;
    const blob = `${s.name} ${s.desc}`;
    return rxs.every((r) => r.test(blob));
  });
  hits.sort((a, b) => {
    if (a.alsel !== b.alsel) return a.alsel ? -1 : 1;
    return b.quality - a.quality;
  });
  return hits;
}

function renderHuman(hits, totalCount, query) {
  if (hits.length === 0) {
    return [
      `「${query}」に該当するスキルは見つかりませんでした (全 ${totalCount} 件中)。`,
      `キーワードを変えて再検索するか、ブラウザで https://agent-skills.jp/ を直接ご確認ください。`,
    ].join("\n");
  }
  const lines = [`「${query}」の検索結果 (上位 ${hits.length} 件 / 全 ${totalCount} 件)`, ""];
  hits.forEach((s, i) => {
    const badge = s.alsel ? " 【ALSEL独自】" : "";
    lines.push(`${i + 1}. ${s.name}${badge}`);
    lines.push(`   ${s.desc}`);
    lines.push(
      `   カテゴリ: ${s.category} / 対応 AI: ${s.vendor} / 品質スコア: ${s.quality} / ライセンス: ${s.license || "不明"}`
    );
    lines.push(`   URL: ${s.url}`);
    if (s.repo) lines.push(`   原本リポジトリ: ${s.repo}`);
    lines.push("");
  });
  return lines.join("\n");
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || opts.tokens.length === 0) {
    showHelp();
    process.exit(opts.help ? 0 : 2);
  }
  if (opts.category && !VALID_CATEGORIES.has(opts.category)) {
    process.stderr.write(
      `unknown category: ${opts.category}\n` +
        `valid: ${Array.from(VALID_CATEGORIES).join(", ")}\n`
    );
    process.exit(2);
  }
  const tokens = tokenize(opts.tokens);
  if (tokens.length === 0) {
    process.stderr.write(`could not extract tokens from query.\n`);
    process.exit(2);
  }
  const index = loadIndex();
  const hits = search(index, tokens, opts.category).slice(0, opts.limit);
  const query = opts.tokens.join(" ");
  if (opts.json) {
    process.stdout.write(
      JSON.stringify(
        {
          query,
          tokens,
          category: opts.category,
          total_in_index: index.count,
          generated_at: index.generated_at,
          hits,
        },
        null,
        2
      ) + "\n"
    );
  } else {
    process.stdout.write(renderHuman(hits, index.count, query) + "\n");
  }
}

main();
