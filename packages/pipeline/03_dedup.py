"""
パイプライン step 03: 重複排除
================================
同じスキルが複数リポジトリに存在するケースが多いため、
内容のハッシュとname類似度で重複を排除する。

入力:  /home/claude/data/parsed_skills.jsonl
出力:  /home/claude/data/deduped_skills.jsonl
"""

import hashlib
import json
from collections import defaultdict
from pathlib import Path

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "parsed_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "deduped_skills.jsonl"


def content_hash(text: str) -> str:
    """SKILL.md本文のSHA256(改行・空白ノーマライズ後)"""
    normalized = " ".join(text.split()).lower()
    return hashlib.sha256(normalized.encode()).hexdigest()


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    # ハッシュ別にまとめる
    groups: dict[str, list[dict]] = defaultdict(list)
    with INPUT_FILE.open(encoding="utf-8") as f:
        for line in f:
            try:
                skill = json.loads(line)
            except json.JSONDecodeError:
                continue
            h = content_hash(skill["content_full"])
            groups[h].append(skill)

    # 各グループから「代表」を1つ選ぶ
    # 優先順位: 公式org > スター数(後で結合) > 短いパス
    OFFICIAL_ORGS = {
        "anthropics", "openai", "google", "microsoft",
        "vercel-labs", "huggingface", "opencodeco", "meta",
    }

    kept = 0
    duplicates = 0
    with OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for h, items in groups.items():
            if len(items) == 1:
                rep = items[0]
            else:
                # 公式優先 -> パス短い順
                items.sort(key=lambda s: (
                    0 if s["author"].lower() in OFFICIAL_ORGS else 1,
                    len(s["repo_path"]),
                ))
                rep = items[0]
                # 元の他リポジトリ情報を残す
                rep["mirrors"] = [
                    {"repo_name": x["repo_name"], "repo_path": x["repo_path"]}
                    for x in items[1:]
                ]
            f_out.write(json.dumps(rep, ensure_ascii=False) + "\n")
            kept += 1
            duplicates += len(items) - 1
    print(f"重複排除完了: 保持{kept}件 / 重複{duplicates}件")


if __name__ == "__main__":
    main()
