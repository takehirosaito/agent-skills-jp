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
import json
import os
import re
import subprocess
import time
from pathlib import Path
from typing import Iterator

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


def detect_vendor(path: str) -> str:
    """パスからベンダーを推定"""
    p = path.lower()
    if ".claude/skills/" in p:
        return "claude"
    if ".agents/skills/" in p:
        return "openai"
    if "opencode/skills/" in p:
        return "opencode"
    if ".gemini/skills/" in p:
        return "gemini"
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
                "vendor": detect_vendor(str(rel_path)),
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


def collect_from_search(queries: list[str]) -> Iterator[dict]:
    """Phase B: GitHub Search API から収集"""
    seen = set()  # 重複排除用
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
                "vendor": detect_vendor(item["path"]),
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
    args = parser.parse_args()

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    with OUTPUT_FILE.open("w", encoding="utf-8") as out:
        if args.phase in ("a", "all"):
            for skill in collect_from_clones(KNOWN_REPOS):
                out.write(json.dumps(skill, ensure_ascii=False) + "\n")
                count += 1
        if args.phase in ("b", "all"):
            for skill in collect_from_search(SEARCH_QUERIES):
                out.write(json.dumps(skill, ensure_ascii=False) + "\n")
                count += 1

    print(f"完了: {count} 件を {OUTPUT_FILE} に保存")


if __name__ == "__main__":
    main()
