"""
パイプライン step 07: Meilisearch にバルク投入
==============================================
最終データを Meilisearch のインデックスに投入し、
検索設定を反映する。

入力:  /home/claude/data/translated_skills.jsonl
出力:  Meilisearchの "skills" インデックス
"""

import json
import os
from pathlib import Path

import meilisearch

from config import DATA_DIR

# 08 (本文翻訳) の出力があればそれを優先、無ければ 06 の出力
_FULL = DATA_DIR / "translated_body_skills.jsonl"
INPUT_FILE = _FULL if _FULL.exists() else DATA_DIR / "translated_skills.jsonl"
MEILI_URL = os.environ.get("MEILI_URL", "http://localhost:7700")
MEILI_KEY = os.environ.get("MEILI_MASTER_KEY", "")
INDEX_NAME = "skills"

# 検索設定
SETTINGS = {
    "searchableAttributes": [
        "name",
        "description_ja",
        "description_original",
        "category",
        "vendor",
        "author",
    ],
    "filterableAttributes": [
        "vendor",
        "category",
        "language_original",
        "license",
        "quality_score",
        "github_stars",
        "slug",
    ],
    "sortableAttributes": [
        "quality_score",
        "github_stars",
        "last_updated",
        "content_length",
    ],
    "rankingRules": [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "quality_score:desc",
        "exactness",
    ],
    "displayedAttributes": [
        "id",
        "slug",
        "name",
        "description_ja",
        "description_original",
        "category",
        "vendor",
        "author",
        "repo_name",
        "repo_url",
        "raw_url",
        "github_stars",
        "quality_score",
        "last_updated",
        "language_original",
        "license",
        "content_full",
        "content_full_ja",
    ],
    "stopWords": [],
    "synonyms": {
        "ec": ["e-commerce", "ecommerce"],
        "ai": ["artificial intelligence"],
        "llm": ["language model"],
    },
    "typoTolerance": {
        "enabled": True,
        "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 8},
    },
}


def main():
    client = meilisearch.Client(MEILI_URL, MEILI_KEY)

    # インデックス作成 or 取得
    try:
        client.create_index(INDEX_NAME, {"primaryKey": "id"})
    except Exception:
        pass
    index = client.index(INDEX_NAME)

    # 設定反映
    print("検索設定を反映中")
    index.update_settings(SETTINGS)

    # データ読み込み
    docs = []
    with INPUT_FILE.open(encoding="utf-8") as f:
        for line in f:
            try:
                skill = json.loads(line)
            except json.JSONDecodeError:
                continue
            # Meilisearchに不要なフィールドを削除(content_full は displayedAttributes として残す)
            skill.pop("frontmatter", None)
            skill.pop("mirrors", None)
            docs.append(skill)

    print(f"投入対象: {len(docs)}件")

    # バッチ投入(1000件ずつ)
    BATCH = 1000
    for i in range(0, len(docs), BATCH):
        batch = docs[i:i + BATCH]
        task = index.add_documents(batch)
        print(f"  投入: {i + len(batch)}/{len(docs)} (task uid: {task.task_uid})")

    print("Meilisearch投入完了")


if __name__ == "__main__":
    main()
