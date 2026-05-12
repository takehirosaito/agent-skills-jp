"""
パイプライン step 06: 日本語翻訳
================================
descriptionを日本語に翻訳する。
既に日本語のものはスキップ。

Anthropic Message Batches API を使用(50%割引)。
50,000件で約 $12 = 1,800円。

入力:  /home/claude/data/categorized_skills.jsonl
出力:  /home/claude/data/translated_skills.jsonl

注:
  実運用時はAnthropicの Batch API でjsonl投入する。
  ここでは簡略化のため逐次呼び出しでも動くサンプルを示す。
  本番は anthropic.batches.create() を使うこと。
"""

import json
import os
import time
from pathlib import Path

import anthropic

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "categorized_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "translated_skills.jsonl"
BATCH_REQUEST_FILE = DATA_DIR / "translation_batch_request.jsonl"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL = "claude-haiku-4-5-20251001"
USE_BATCH_API = True  # Trueで本番用 batch API、Falseで逐次

PROMPT_TEMPLATE = """あなたは技術翻訳の専門家です。以下のAgent Skillsの英語descriptionを、日本語のEC事業者・開発者・経営者にも分かるよう、自然な日本語に翻訳してください。

ルール:
- 専門用語(API、SDK、CLIなど)はカタカナで残してよい
- 「〜できます」「〜します」など丁寧な能動表現
- 長さは原文と同程度(150〜400字)
- 余計な説明や注釈は加えない
- 訳文のみを返す

英文:
{description}

日本語訳:"""


def needs_translation(skill: dict) -> bool:
    """日本語が必要か判定"""
    if skill.get("language_original") == "ja":
        return False
    return True


# ============================================================
# 方式1: バッチAPI(本番用、50%割引)
# ============================================================

def prepare_batch_requests(skills: list[dict]) -> list[dict]:
    """Batch API に投入する requests を組み立て"""
    requests_list = []
    for skill in skills:
        if not needs_translation(skill):
            continue
        requests_list.append({
            "custom_id": skill["id"],
            "params": {
                "model": MODEL,
                "max_tokens": 800,
                "messages": [{
                    "role": "user",
                    "content": PROMPT_TEMPLATE.format(
                        description=skill["description_original"][:2000]
                    ),
                }],
            },
        })
    return requests_list


def run_batch_translation(client, requests_list: list[dict]) -> dict[str, str]:
    """Batch API で翻訳実行。custom_id -> 訳文 の辞書を返す"""
    print(f"バッチAPI投入: {len(requests_list)}件")
    batch = client.messages.batches.create(requests=requests_list)
    print(f"バッチID: {batch.id}")
    # ポーリング
    while True:
        time.sleep(30)
        status = client.messages.batches.retrieve(batch.id)
        print(f"  状態: {status.processing_status}")
        if status.processing_status == "ended":
            break
    # 結果取得
    results = {}
    for result in client.messages.batches.results(batch.id):
        if result.result.type == "succeeded":
            text = result.result.message.content[0].text.strip()
            results[result.custom_id] = text
    return results


# ============================================================
# 方式2: 逐次(開発・少量用)
# ============================================================

def translate_one(client, description: str) -> str:
    """1件翻訳"""
    msg = client.messages.create(
        model=MODEL,
        max_tokens=800,
        messages=[{
            "role": "user",
            "content": PROMPT_TEMPLATE.format(description=description[:2000]),
        }],
    )
    return msg.content[0].text.strip()


def _load_translation_cache() -> dict[str, str]:
    """既存の翻訳結果を description_original -> description_ja で読み込む。
    増分翻訳で同一原文を再翻訳しないために使う。"""
    cache: dict[str, str] = {}
    candidates = [
        OUTPUT_FILE,
        DATA_DIR / "translated_skills.phase_a.jsonl",
    ]
    for path in candidates:
        if not path.exists():
            continue
        with path.open(encoding="utf-8") as f:
            for line in f:
                try:
                    s = json.loads(line)
                except json.JSONDecodeError:
                    continue
                orig = (s.get("description_original") or "").strip()
                ja = (s.get("description_ja") or "").strip()
                if not orig or not ja or orig == ja:
                    continue
                cache.setdefault(orig, ja)
    return cache


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    skills = []
    with INPUT_FILE.open(encoding="utf-8") as f:
        for line in f:
            try:
                skills.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    print(f"対象: {len(skills)}件")

    cache = _load_translation_cache()
    print(f"翻訳キャッシュ: {len(cache)}件 (前回までの結果を再利用)")

    # キャッシュ命中分をマーク
    translations: dict[str, str] = {}
    skills_to_translate = []
    for s in skills:
        if not needs_translation(s):
            continue
        orig = (s.get("description_original") or "").strip()
        if orig in cache:
            translations[s["id"]] = cache[orig]
        else:
            skills_to_translate.append(s)
    print(
        f"キャッシュ命中: {len(translations)}件 / 新規翻訳対象: {len(skills_to_translate)}件"
    )

    if skills_to_translate:
        if USE_BATCH_API:
            requests_list = prepare_batch_requests(skills_to_translate)
            new_translations = run_batch_translation(client, requests_list)
        else:
            new_translations = {}
            for s in skills_to_translate:
                try:
                    new_translations[s["id"]] = translate_one(
                        client, s["description_original"]
                    )
                except Exception as e:
                    print(f"  翻訳失敗 {s['id']}: {e}")
                time.sleep(0.1)
        translations.update(new_translations)
        print(f"新規翻訳: {len(new_translations)}件")

    # 書き出し
    with OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for skill in skills:
            if skill["id"] in translations:
                skill["description_ja"] = translations[skill["id"]]
            elif skill.get("language_original") == "ja":
                skill["description_ja"] = skill["description_original"]
            else:
                skill["description_ja"] = skill["description_original"]  # フォールバック
            f_out.write(json.dumps(skill, ensure_ascii=False) + "\n")

    print(f"翻訳完了: 合計{len(translations)}件 (キャッシュ含む) を日本語化")


if __name__ == "__main__":
    main()
