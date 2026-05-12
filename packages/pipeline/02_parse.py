"""
パイプライン step 02: パース・正規化
====================================
01で集めた raw_skills.jsonl を読んで、構造化データに整える。

入力:  /home/claude/data/raw_skills.jsonl
出力:  /home/claude/data/parsed_skills.jsonl
"""

import json
import re
import uuid
from pathlib import Path

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "raw_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "parsed_skills.jsonl"


def slugify(name: str) -> str:
    """name から URL スラッグを生成"""
    s = name.lower()
    s = re.sub(r"[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+", "-", s)
    s = s.strip("-")
    return s[:80] or "untitled"


def detect_vendor(path: str, repo: str = "") -> str:
    """パスとリポ名からベンダーを推定(01と同じロジック・再判定用)"""
    p = (path or "").lower()
    r = (repo or "").lower()
    if ".claude/skills/" in p or ".claude/agents/" in p or ".claude/commands/" in p:
        return "claude"
    if ".agents/skills/" in p:
        return "openai"
    if "opencode/skills/" in p:
        return "opencode"
    if ".gemini/skills/" in p:
        return "gemini"
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


def detect_language(text: str) -> str:
    """description の言語を簡易判定"""
    if re.search(r"[\u3040-\u309f\u30a0-\u30ff]", text):
        return "ja"
    if re.search(r"[\u4e00-\u9faf]", text):
        if re.search(r"[\u3040-\u309f\u30a0-\u30ff]", text):
            return "ja"
        return "zh"
    if re.search(r"[\uac00-\ud7af]", text):
        return "ko"
    return "en"


def normalize(raw: dict) -> dict | None:
    """1件を正規化"""
    name = (raw.get("name") or "").strip()
    desc = (raw.get("description") or "").strip()
    if not name or not desc:
        return None
    if len(desc) < 20:
        return None

    repo_name = raw["repo_name"]
    path = raw["path"]
    author = repo_name.split("/")[0]

    return {
        "id": str(uuid.uuid4()),
        "slug": slugify(name),
        "name": name,
        "description_original": desc,
        "language_original": detect_language(desc),
        # 01 が付けた vendor を採用しつつ、generic の場合はリポ名から再推定
        "vendor": (
            raw.get("vendor", "generic")
            if raw.get("vendor", "generic") != "generic"
            else detect_vendor(path, repo_name)
        ),
        "repo_name": repo_name,
        "repo_url": f"https://github.com/{repo_name}",
        "repo_path": path,
        "raw_url": f"https://raw.githubusercontent.com/{repo_name}/main/{path}",
        "author": author,
        "content_length": raw.get("content_length", 0),
        "frontmatter": raw.get("frontmatter", {}),
        "content_full": raw.get("content", ""),
        "source": raw.get("source", "unknown"),
    }


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    count_in = count_out = 0
    with INPUT_FILE.open(encoding="utf-8") as f_in, OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for line in f_in:
            count_in += 1
            try:
                raw = json.loads(line)
            except json.JSONDecodeError:
                continue
            normalized = normalize(raw)
            if not normalized:
                continue
            f_out.write(json.dumps(normalized, ensure_ascii=False) + "\n")
            count_out += 1
    print(f"パース完了: 入力{count_in}件 -> 出力{count_out}件")


if __name__ == "__main__":
    main()
