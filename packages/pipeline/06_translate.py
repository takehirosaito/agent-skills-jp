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

PROMPT_TEMPLATE = """以下は AI エージェント向けスキルパッケージ "Agent Skill" の説明文です。原文の言語は英語・中国語・韓国語・ロシア語・ドイツ語・フランス語・ポルトガル語・アラビア語など何でも構いません。

タスク: 言語問わず、自然な日本語に翻訳してください。

ルール:
- 専門用語(API, SDK, CLI, MCP, LLM など)はそのまま英語で残してよい
- 「〜できます」「〜します」のような丁寧な能動表現
- 長さは原文と同程度、最長でも 400 字以内
- 余計な説明・前置き・注釈・断り書きを一切付けない
- 翻訳結果のみを 1 段落で返す (見出しや箇条書きは作らない)
- 原文が不完全・短文・記号のみであっても、可能な範囲で日本語化する。質問や保留の返答は一切しない

原文:
{description}

日本語訳:"""

# 翻訳器が原文を拒否したり質問返ししたときの定型句。これを含む応答は失敗扱い。
LEAK_MARKERS = (
    "申し訳ありません",
    "申し訳ございません",
    "翻訳できません",
    "翻訳することができません",
    "ご提供いただ",
    "ご提示いた",
    "I'm sorry",
    "I apologize",
    "Please provide",
)


def looks_like_leak(text: str) -> bool:
    """翻訳結果が拒否文・質問返しになっていないか判定"""
    return any(m in text for m in LEAK_MARKERS)


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
    # 結果取得。拒否文・質問返しは弾く(後段で description_original にフォールバック)
    results = {}
    leak_count = 0
    for result in client.messages.batches.results(batch.id):
        if result.result.type == "succeeded":
            text = result.result.message.content[0].text.strip()
            if looks_like_leak(text):
                leak_count += 1
                continue
            results[result.custom_id] = text
    if leak_count:
        print(f"  拒否文を含む応答を {leak_count} 件破棄 (description_original にフォールバック)")
    return results


# ============================================================
# 方式2: 逐次(開発・少量用)
# ============================================================

def translate_one(client, description: str) -> str | None:
    """1件翻訳。拒否文・質問返しが返ったら None"""
    msg = client.messages.create(
        model=MODEL,
        max_tokens=800,
        messages=[{
            "role": "user",
            "content": PROMPT_TEMPLATE.format(description=description[:2000]),
        }],
    )
    text = msg.content[0].text.strip()
    return None if looks_like_leak(text) else text


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
                    ja = translate_one(client, s["description_original"])
                    if ja is not None:
                        new_translations[s["id"]] = ja
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
