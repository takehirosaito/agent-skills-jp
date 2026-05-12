"""
agent-skills.jp データ収集パイプライン step 01
===============================================
SKILL.md ファイルを世界中のGitHubリポジトリから収集する。

戦略:
  Phase A: 既知の公式・有名リポジトリを git clone (確実な数千件)
  Phase B: GitHub Search API でロングテール収集 (~10,000件)
  Phase C: 日次更新は GHArchive で差分取得 (運用後)

実行:
  python 01_collect_skills.py --phase a    # 公式リポクローン
  python 01_collect_skills.py --phase b    # GitHub Search API
  python 01_collect_skills.py --phase all  # 両方

出力: /home/claude/data/raw_skills.jsonl
"""

import argparse
import datetime as _dt
import json
import os
import re
import subprocess
import time
from pathlib import Path
from typing import Iterator


def _json_default(o):
    """YAML フロントマターの date/datetime を文字列化"""
    if isinstance(o, (_dt.date, _dt.datetime)):
        return o.isoformat()
    if isinstance(o, bytes):
        return o.decode("utf-8", errors="replace")
    raise TypeError(f"Object of type {o.__class__.__name__} is not JSON serializable")


def _dump(skill: dict) -> str:
    """JSON 化。surrogate 文字は \\uXXXX エスケープして安全に書く"""
    s = json.dumps(skill, ensure_ascii=False, default=_json_default)
    # lone surrogate を含む文字列を UTF-8 安全にする
    return s.encode("utf-8", errors="replace").decode("utf-8")

import requests
import yaml

from config import CLONE_DIR, DATA_DIR

# ============================================================
# 設定
# ============================================================

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")  # PAT、5,000 req/h制限
OUTPUT_FILE = DATA_DIR / "raw_skills.jsonl"

# Phase A: クローン対象の既知リポジトリ
KNOWN_REPOS = [
    # 公式
    "anthropics/skills",
    "anthropics/claude-cookbooks",
    "openai/skills",
    "openai/openai-cookbook",
    # 有名コミュニティ
    "vercel-labs/agent-skills",
    "addyosmani/agent-skills",
    "GuDaStudio/skills",
    "BMPixel/awesome-claude-skills",
    "huggingface/agent-skills",
    "opencodeco/skills",
    # 日本人開発者 (要追加調査・手動キュレーション)
    "narun/skill-creator-ja",
    "SingularitySociety/mulmocast-claude-plugin",
    # ...
]

# Phase B: GitHub Search API のクエリパターン
# 1クエリ最大1,000件、ファセットを変えて網羅
SEARCH_QUERIES = [
    "filename:SKILL.md size:>500 size:<5000",
    "filename:SKILL.md size:>5000 size:<20000",
    "filename:SKILL.md size:>20000",
    "filename:SKILL.md language:Markdown",
    "filename:SKILL.md path:.claude/skills",
    "filename:SKILL.md path:.agents/skills",
    "filename:SKILL.md path:skills",
    "filename:SKILL.md created:>2025-10-01",
    "filename:SKILL.md created:<2025-10-01",
    # 拡張クエリ(キーワード・パス指定)
    "filename:SKILL.md anthropic",
    "filename:SKILL.md claude",
    "filename:SKILL.md sonnet",
    "filename:SKILL.md haiku",
    "filename:SKILL.md opus",
    "filename:SKILL.md mcp",
    "filename:SKILL.md agent",
    "path:.claude/agents filename:SKILL.md",
    "path:claude-skills filename:SKILL.md",
    "path:.claude/commands filename:SKILL.md",
]

# ============================================================
# YAMLフロントマターパース
# ============================================================

FRONTMATTER_PATTERN = re.compile(r"^---\n(.*?)\n---", re.DOTALL)


def parse_frontmatter(content: str) -> dict | None:
    """SKILL.md の冒頭YAMLフロントマターを抽出"""
    match = FRONTMATTER_PATTERN.match(content)
    if not match:
        return None
    try:
        data = yaml.safe_load(match.group(1))
        if not isinstance(data, dict):
            return None
        # 必須フィールドチェック
        if "name" not in data or "description" not in data:
            return None
        return data
    except yaml.YAMLError:
        return None


def detect_vendor(path: str, repo: str = "") -> str:
    """パスとリポ名からベンダーを推定"""
    p = path.lower()
    r = repo.lower()
    # パスベース判定(最優先)
    if ".claude/skills/" in p or ".claude/agents/" in p or ".claude/commands/" in p:
        return "claude"
    if ".agents/skills/" in p:
        return "openai"
    if "opencode/skills/" in p:
        return "opencode"
    if ".gemini/skills/" in p:
        return "gemini"
    # リポ名・所有者ベース判定
    owner = r.split("/")[0] if "/" in r else r
    if owner in {"anthropics", "anthropic-experimental"}:
        return "claude"
    if "claude" in r:
        return "claude"
    if owner in {"openai", "openai-cookbook"}:
        return "openai"
    if owner in {"google", "google-deepmind", "googleapis"}:
        return "gemini"
    if "gemini" in r:
        return "gemini"
    if "opencode" in r:
        return "opencode"
    return "generic"


# ============================================================
# Phase A: git clone ベースの収集
# ============================================================


def clone_repo(repo: str) -> Path | None:
    """リポジトリをshallow clone"""
    target = CLONE_DIR / repo.replace("/", "__")
    if target.exists():
        return target
    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", f"https://github.com/{repo}.git", str(target)],
            check=True,
            capture_output=True,
            timeout=120,
        )
        return target
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        print(f"clone失敗: {repo} ({e})")
        return None


def find_skill_files(root: Path) -> Iterator[Path]:
    """ディレクトリツリーから SKILL.md を全部探す"""
    for p in root.rglob("SKILL.md"):
        # ノイズ除外
        if any(part in {"node_modules", "vendor", "dist", "build", ".git"} for part in p.parts):
            continue
        yield p
    # 大文字小文字違いもケア
    for p in root.rglob("Skill.md"):
        yield p
    for p in root.rglob("skill.md"):
        yield p


def collect_from_clones(repos: list[str]) -> Iterator[dict]:
    """Phase A: 既知リポジトリから収集"""
    CLONE_DIR.mkdir(parents=True, exist_ok=True)
    for repo in repos:
        print(f"処理中: {repo}")
        root = clone_repo(repo)
        if not root:
            continue
        for skill_path in find_skill_files(root):
            try:
                content = skill_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            fm = parse_frontmatter(content)
            if not fm:
                continue
            rel_path = skill_path.relative_to(root)
            yield {
                "repo_name": repo,
                "path": str(rel_path),
                "vendor": detect_vendor(str(rel_path), repo),
                "name": fm.get("name", ""),
                "description": fm.get("description", ""),
                "frontmatter": fm,
                "content": content,
                "content_length": len(content),
                "source": "clone",
            }


# ============================================================
# Phase B: GitHub Search API ベースの収集
# ============================================================


def search_github_code(query: str, per_page: int = 100) -> Iterator[dict]:
    """GitHub Search API でコード検索。1クエリ最大1,000件"""
    if not GITHUB_TOKEN:
        raise RuntimeError("GITHUB_TOKEN環境変数が必要")
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }
    for page in range(1, 11):  # 1,000件 / 100件/page = 10ページ
        url = "https://api.github.com/search/code"
        params = {"q": query, "per_page": per_page, "page": page}
        r = requests.get(url, headers=headers, params=params, timeout=30)
        if r.status_code == 403:
            # レート制限
            reset = int(r.headers.get("X-RateLimit-Reset", time.time() + 60))
            wait = max(reset - int(time.time()), 1)
            print(f"レート制限。{wait}秒待機")
            time.sleep(wait)
            continue
        r.raise_for_status()
        items = r.json().get("items", [])
        if not items:
            return
        yield from items
        time.sleep(2)  # 礼儀


def fetch_raw_content(item: dict) -> str | None:
    """GitHub APIから生コンテンツを取得"""
    raw_url = item.get("html_url", "").replace(
        "github.com", "raw.githubusercontent.com"
    ).replace("/blob/", "/")
    try:
        r = requests.get(raw_url, timeout=30)
        r.raise_for_status()
        return r.text
    except Exception:
        return None


def collect_from_search(queries: list[str], seen: set | None = None) -> Iterator[dict]:
    """Phase B: GitHub Search API から収集
    seen: 既に取得済みの (repo_name, path) 集合(レジューム用)"""
    if seen is None:
        seen = set()
    for query in queries:
        print(f"検索中: {query}")
        for item in search_github_code(query):
            key = (item["repository"]["full_name"], item["path"])
            if key in seen:
                continue
            seen.add(key)
            content = fetch_raw_content(item)
            if not content:
                continue
            fm = parse_frontmatter(content)
            if not fm:
                continue
            yield {
                "repo_name": item["repository"]["full_name"],
                "path": item["path"],
                "vendor": detect_vendor(
                    item["path"], item["repository"]["full_name"]
                ),
                "name": fm.get("name", ""),
                "description": fm.get("description", ""),
                "frontmatter": fm,
                "content": content,
                "content_length": len(content),
                "source": "search_api",
            }


# ============================================================
# メイン
# ============================================================


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=["a", "b", "all"], default="all")
    parser.add_argument(
        "--resume",
        action="store_true",
        help="OUTPUT_FILE が既に存在する場合に追記モードで継続。重複は (repo, path) でスキップ",
    )
    args = parser.parse_args()

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # レジューム時は既存ファイルから seen を再構築
    seen: set[tuple[str, str]] = set()
    open_mode = "w"
    initial_count = 0
    if args.resume and OUTPUT_FILE.exists():
        open_mode = "a"
        with OUTPUT_FILE.open(encoding="utf-8") as f:
            for line in f:
                try:
                    d = json.loads(line)
                    seen.add((d.get("repo_name", ""), d.get("path", "")))
                    initial_count += 1
                except json.JSONDecodeError:
                    continue
        print(f"レジューム: 既存 {initial_count} 件を seen に登録")

    count = initial_count
    with OUTPUT_FILE.open(open_mode, encoding="utf-8") as out:
        if args.phase in ("a", "all"):
            for skill in collect_from_clones(KNOWN_REPOS):
                out.write(_dump(skill) + "\n")
                count += 1
        if args.phase in ("b", "all"):
            for skill in collect_from_search(SEARCH_QUERIES, seen=seen):
                # collect_from_search 側でも seen に追加されるが、念のため
                key = (skill.get("repo_name", ""), skill.get("path", ""))
                if key in seen and args.resume:
                    # レジューム時は既出をスキップ(本来は collect_from_search 内で済むが二重防御)
                    pass
                out.write(_dump(skill) + "\n")
                count += 1

    print(f"完了: {count} 件を {OUTPUT_FILE} に保存")


if __name__ == "__main__":
    main()
