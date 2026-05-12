#!/usr/bin/env bash
# Phase B 完了後に実行するスクリプト
# 1. raw_skills.jsonl と raw_skills.phase_a.jsonl を結合
# 2. 02 parse → 03 dedup → 04 score → 05 categorize → 06 translate (incremental) → 07 index

set -e
cd "$(dirname "$0")/.."

ROOT=$(pwd)
DATA=$ROOT/data
PY=$ROOT/.venv/bin/python

# .env を読み込み
set -a
source .env
set +a

echo "===== Phase B 完了。後続処理開始 ====="

# 1. Phase A + Phase B 結合
echo "[1/7] raw_skills.jsonl を結合"
PHASE_B_COUNT=$(wc -l < "$DATA/raw_skills.jsonl")
PHASE_A_COUNT=$(wc -l < "$DATA/raw_skills.phase_a.jsonl")
cat "$DATA/raw_skills.phase_a.jsonl" "$DATA/raw_skills.jsonl" > "$DATA/raw_skills.combined.jsonl"
mv "$DATA/raw_skills.combined.jsonl" "$DATA/raw_skills.jsonl"
echo "    Phase A: $PHASE_A_COUNT 件 + Phase B: $PHASE_B_COUNT 件 = $(wc -l < $DATA/raw_skills.jsonl) 件"

cd "$ROOT/packages/pipeline"

echo "[2/7] 02_parse"
$PY 02_parse.py

echo "[3/7] 03_dedup"
$PY 03_dedup.py

echo "[4/7] 04_score (GitHub API)"
$PY 04_score.py

echo "[5/7] 05_categorize (OpenAI Embedding)"
$PY 05_categorize.py

echo "[6/7] 06_translate (Anthropic Batch API, incremental)"
$PY 06_translate.py

echo "[7/7] 07_index (Meilisearch)"
$PY 07_index.py

echo "===== 完了 ====="
echo "最終件数:"
wc -l "$DATA/translated_skills.jsonl"
