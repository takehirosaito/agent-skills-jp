"""
パイプライン step 10: find-skills スキル本体を Meilisearch に登録
================================================================
skills/find-skills/SKILL.md を読み取り、ALSEL 独自スキルと同じ仕組みで投入する。
カテゴリは productivity(個人生産性)。
"""

import json
import os
import re
import uuid
from pathlib import Path

import meilisearch

from config import DATA_DIR

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SKILL_MD = REPO_ROOT / "skills" / "find-skills" / "SKILL.md"
OUTPUT_FILE = DATA_DIR / "find_skills_doc.jsonl"

MEILI_URL = os.environ.get("MEILI_URL", "http://localhost:7700")
MEILI_KEY = os.environ.get("MEILI_MASTER_KEY", "")
INDEX_NAME = "skills"


def parse(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not m:
        return {}, text
    fm_raw, _ = m.group(1), m.group(2)
    fm: dict[str, str] = {}
    current = None
    for line in fm_raw.split("\n"):
        if line.startswith("  ") and current:
            fm[current] = (fm.get(current, "") + " " + line.strip()).strip()
            continue
        km = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if km:
            current = km.group(1)
            fm[current] = km.group(2).strip()
    return fm, text


def main():
    content_full = SKILL_MD.read_text(encoding="utf-8")
    fm, _ = parse(content_full)

    desc = fm.get("description", "")

    doc = {
        "id": str(uuid.uuid4()),
        "slug": "find-skills",
        "name": "find-skills",
        "description_original": desc,
        "description_ja": desc,
        "content_full": content_full,
        "content_full_ja": content_full,
        "language_original": "ja",
        "vendor": "claude",
        "category": "productivity",
        "category_confidence": 1.0,
        "author": "株式会社ALSEL",
        "repo_name": "alsel-jp/agent-skills",
        "repo_url": "https://agent-skills.jp/find-skills",
        "repo_path": "skills/find-skills/SKILL.md",
        "raw_url": "https://agent-skills.jp/api/skill/find-skills/download",
        "github_stars": 0,
        "license": "MIT",
        "quality_score": 100,
        "content_length": len(content_full),
        "last_updated": "2026-05-13T00:00:00Z",
        "source": "alsel_original",
        "is_featured": True,
        "is_original": True,
    }

    # 永続化
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        f.write(json.dumps(doc, ensure_ascii=False) + "\n")
    print(f"書き出し: {OUTPUT_FILE}")

    client = meilisearch.Client(MEILI_URL, MEILI_KEY)
    index = client.index(INDEX_NAME)
    task = index.add_documents([doc])
    print(f"Meilisearch 投入 (task: {task.task_uid}): slug=find-skills")


if __name__ == "__main__":
    main()
