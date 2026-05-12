"""
パイプライン step 04: 品質スコアリング
======================================
GitHub starsや内容の充実度から品質スコア(0-100)を算出し、
低品質スキルを除外する。

入力:  /home/claude/data/deduped_skills.jsonl
出力:  /home/claude/data/scored_skills.jsonl

スターやライセンス取得のためにGitHub APIを叩く。
"""

import json
import math
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "deduped_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "scored_skills.jsonl"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
MIN_SCORE = 30  # この点数未満は除外


def fetch_repo_metadata(repo_name: str) -> dict:
    """GitHub APIで stars/license/最終更新 を取得"""
    if not GITHUB_TOKEN:
        return {}
    url = f"https://api.github.com/repos/{repo_name}"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }
    try:
        r = requests.get(url, headers=headers, timeout=20)
        if r.status_code == 403:
            reset = int(r.headers.get("X-RateLimit-Reset", time.time() + 60))
            time.sleep(max(reset - int(time.time()), 1))
            r = requests.get(url, headers=headers, timeout=20)
        if r.status_code != 200:
            return {}
        data = r.json()
        return {
            "stars": data.get("stargazers_count", 0),
            "license": (data.get("license") or {}).get("spdx_id"),
            "last_updated": data.get("pushed_at"),
            "description": data.get("description"),
            "language": data.get("language"),
        }
    except Exception:
        return {}


def days_since(iso_string: str | None) -> int:
    """ISO日付文字列から現在までの日数"""
    if not iso_string:
        return 9999
    try:
        dt = datetime.fromisoformat(iso_string.replace("Z", "+00:00"))
        return (datetime.now(timezone.utc) - dt).days
    except Exception:
        return 9999


def compute_score(skill: dict, meta: dict) -> int:
    """0-100 のスコアを計算"""
    score = 0
    # GitHub stars: 最大30点
    stars = meta.get("stars", 0)
    score += min(int(math.log10(stars + 1) * 10), 30)
    # 最終更新: 最大20点
    days = days_since(meta.get("last_updated"))
    if days <= 90:
        score += 20
    elif days <= 180:
        score += 15
    elif days <= 365:
        score += 10
    elif days <= 730:
        score += 5
    # description長: 最大20点
    desc_len = len(skill.get("description_original", ""))
    if desc_len >= 300:
        score += 20
    elif desc_len >= 150:
        score += 15
    elif desc_len >= 50:
        score += 10
    # name妥当性: 最大10点
    name = skill.get("name", "")
    if 3 <= len(name) <= 60 and not name.isupper():
        score += 10
    # ライセンス: 最大10点
    if meta.get("license"):
        score += 10
    # 本文サイズ: 最大10点
    content_len = skill.get("content_length", 0)
    if content_len >= 2000:
        score += 10
    elif content_len >= 500:
        score += 5
    return min(score, 100)


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    # repo_name -> meta のキャッシュ
    meta_cache: dict[str, dict] = {}
    kept = excluded = 0
    with INPUT_FILE.open(encoding="utf-8") as f_in, OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for line in f_in:
            try:
                skill = json.loads(line)
            except json.JSONDecodeError:
                continue
            repo = skill["repo_name"]
            if repo not in meta_cache:
                meta_cache[repo] = fetch_repo_metadata(repo)
                time.sleep(0.5)  # レート制限避け
            meta = meta_cache[repo]
            skill["github_stars"] = meta.get("stars", 0)
            skill["license"] = meta.get("license")
            skill["last_updated"] = meta.get("last_updated")
            skill["quality_score"] = compute_score(skill, meta)
            if skill["quality_score"] < MIN_SCORE:
                excluded += 1
                continue
            f_out.write(json.dumps(skill, ensure_ascii=False) + "\n")
            kept += 1
    print(f"スコアリング完了: 保持{kept}件 / 除外{excluded}件")


if __name__ == "__main__":
    main()
