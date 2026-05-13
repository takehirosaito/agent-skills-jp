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


_RX_HIRAGANA = re.compile(r"[\u3040-\u309f]")
_RX_KATAKANA = re.compile(r"[\u30a0-\u30ff]")
_RX_CJK = re.compile(r"[\u4e00-\u9faf]")
_RX_HANGUL = re.compile(r"[\uac00-\ud7af]")
_RX_ASCII_ALPHA = re.compile(r"[A-Za-z]")


def detect_language(text: str) -> str:
    """description の言語を文字種比率で判定。

    旧版は「ひらがな/カナが1文字でもあれば ja」だったため、英語 description に
    "俳句" の説明等で混入したカナ数文字で誤って ja 判定 → 翻訳スキップ →
    サイト上で原文ママ表示、という事故が起きていた (haiku-style 等 24 件)。
    総文字数に対するひらがな+カタカナ比 15% 以上なら ja、という比率判定に変更。
    """
    if not text:
        return "en"
    hi = len(_RX_HIRAGANA.findall(text))
    ka = len(_RX_KATAKANA.findall(text))
    cjk = len(_RX_CJK.findall(text))
    ko = len(_RX_HANGUL.findall(text))
    en = len(_RX_ASCII_ALPHA.findall(text))
    total = hi + ka + cjk + ko + en
    if total < 10:
        return "ja" if (hi + ka) else "en"
    ja_ratio = (hi + ka) / total
    if ja_ratio >= 0.15:
        return "ja"
    if ko / total >= 0.30:
        return "ko"
    if cjk / total >= 0.40:
        return "zh"
    return "en"


def _as_str(v) -> str:
    """YAML frontmatter は int/list 等にもなり得るので、安全に文字列化"""
    if v is None:
        return ""
    if isinstance(v, str):
        return v
    if isinstance(v, (int, float, bool)):
        return str(v)
    if isinstance(v, list):
        return ", ".join(_as_str(x) for x in v)
    return str(v)


def normalize(raw: dict) -> dict | None:
    """1件を正規化"""
    name = _as_str(raw.get("name")).strip()
    desc = _as_str(raw.get("description")).strip()
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
