"""
パイプライン step 08: SKILL.md 本文の日本語翻訳
==============================================
06 が短い description(frontmatter の1文)を翻訳するのに対し、
08 は本文(content_full)全体を Markdown 構造を保ったまま翻訳する。

入力:  data/translated_skills.jsonl  (06 の出力)
出力:  data/translated_body_skills.jsonl  (content_full_ja を追加)

Anthropic Messages Batches API。50% 割引適用。
6,600 件 × 平均 1,500 token 入力 + 2,000 token 出力 ≒ $15〜30 想定。
"""

import json
import os
import time
from pathlib import Path

import anthropic

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "translated_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "translated_body_skills.jsonl"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL = "claude-haiku-4-5-20251001"

MIN_CONTENT_LENGTH = 200    # これより短いものは description_ja で代替
MAX_CONTENT_LENGTH = 30000  # これより長いものはスキップ(コンテキスト/コスト)

PROMPT_TEMPLATE = """以下は AI エージェント向けスキルパッケージの SKILL.md (Markdown 形式) の本文です。原文の言語は英語・中国語・韓国語・ロシア語・ドイツ語・フランス語・ポルトガル語・アラビア語など何でも構いません。

タスク: 言語問わず、日本語に翻訳してください。

ルール:
- Markdown 構造を完全に保持 (見出し、リスト、コードブロック、リンク、表 等)
- frontmatter (--- で囲まれた YAML 部分) は翻訳せずそのまま残す
- コードブロック (``` で囲まれた部分) の中身は翻訳しない
- コマンド、ファイル名、変数名、API 名、URL はそのまま残す
- 専門用語は適切にカタカナ化 (API, SDK, CLI, エージェント, コンテキスト 等)
- 自然で丁寧な日本語 (「〜できます」「〜します」)
- 訳文の Markdown のみを返す。前置き・断り書き・質問返しは一切付けない

原文:
{content}

日本語訳:"""


def _load_body_cache() -> dict[str, str]:
    """既存の本文翻訳結果を content_full -> content_full_ja でキャッシュ"""
    cache: dict[str, str] = {}
    if OUTPUT_FILE.exists():
        with OUTPUT_FILE.open(encoding="utf-8") as f:
            for line in f:
                try:
                    s = json.loads(line)
                except json.JSONDecodeError:
                    continue
                orig = (s.get("content_full") or "").strip()
                ja = (s.get("content_full_ja") or "")
                if orig and ja and ja.strip():
                    cache.setdefault(orig, ja)
    return cache


def prepare_batch_requests(skills: list[dict]) -> list[dict]:
    requests_list = []
    for s in skills:
        content = s["content_full"]
        requests_list.append(
            {
                "custom_id": s["id"],
                "params": {
                    "model": MODEL,
                    "max_tokens": 8000,
                    "messages": [
                        {
                            "role": "user",
                            "content": PROMPT_TEMPLATE.format(content=content),
                        }
                    ],
                },
            }
        )
    return requests_list


def run_batch_translation(client, requests_list: list[dict]) -> dict[str, str]:
    print(f"バッチAPI投入: {len(requests_list)}件", flush=True)
    batch = client.messages.batches.create(requests=requests_list)
    print(f"バッチID: {batch.id}", flush=True)
    while True:
        time.sleep(60)
        status = client.messages.batches.retrieve(batch.id)
        rc = status.request_counts
        print(
            f"  状態: {status.processing_status} "
            f"(succeeded={rc.succeeded}, processing={rc.processing}, "
            f"errored={rc.errored}, expired={rc.expired})",
            flush=True,
        )
        if status.processing_status == "ended":
            break
    results: dict[str, str] = {}
    for result in client.messages.batches.results(batch.id):
        if result.result.type == "succeeded":
            text = result.result.message.content[0].text.strip()
            results[result.custom_id] = text
    return results


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    skills: list[dict] = []
    with INPUT_FILE.open(encoding="utf-8") as f:
        for line in f:
            try:
                skills.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    print(f"対象: {len(skills)}件", flush=True)

    cache = _load_body_cache()
    print(f"本文翻訳キャッシュ: {len(cache)}件", flush=True)

    translations: dict[str, str] = {}
    skills_to_translate: list[dict] = []
    skipped_short = skipped_long = skipped_ja = 0
    for s in skills:
        content = (s.get("content_full") or "").strip()
        if s.get("language_original") == "ja":
            skipped_ja += 1
            continue
        if len(content) < MIN_CONTENT_LENGTH:
            skipped_short += 1
            continue
        if len(content) > MAX_CONTENT_LENGTH:
            skipped_long += 1
            continue
        if content in cache:
            translations[s["id"]] = cache[content]
        else:
            skills_to_translate.append(s)
    print(
        f"スキップ: ja={skipped_ja}, 短すぎ={skipped_short}, 長すぎ={skipped_long}",
        flush=True,
    )
    print(
        f"キャッシュ命中: {len(translations)}件 / 新規翻訳対象: {len(skills_to_translate)}件",
        flush=True,
    )

    if skills_to_translate:
        requests_list = prepare_batch_requests(skills_to_translate)
        new_translations = run_batch_translation(client, requests_list)
        translations.update(new_translations)
        print(f"新規翻訳完了: {len(new_translations)}件", flush=True)

    # 書き出し
    written = 0
    translated_count = 0
    with OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for skill in skills:
            if skill["id"] in translations:
                skill["content_full_ja"] = translations[skill["id"]]
                translated_count += 1
            elif skill.get("language_original") == "ja":
                # 元から日本語なので原文をコピー
                skill["content_full_ja"] = skill.get("content_full", "")
            else:
                # 未翻訳(短すぎ/長すぎ)
                skill["content_full_ja"] = None
            f_out.write(json.dumps(skill, ensure_ascii=False) + "\n")
            written += 1
    print(
        f"本文翻訳完了: {translated_count}件を日本語化 / 合計 {written} 件を {OUTPUT_FILE} に保存",
        flush=True,
    )


if __name__ == "__main__":
    main()
