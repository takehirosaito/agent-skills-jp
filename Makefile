# ============================================================
# agent-skills.jp 構築・運用用 Makefile
# ============================================================
# 使い方:
#   make help          ヘルプ
#   make setup         venv + pip install
#   make collect       Phase A クローン収集
#   make pipeline      02-05 一括実行
#   make translate     翻訳 (Batch API)
#   make index         Meilisearch 投入
#   make meili-up      Meilisearch 起動
#   make meili-down    Meilisearch 停止
#   make web-dev       Next.js dev server
#   make all           collect -> pipeline -> translate -> index
# ============================================================

SHELL := /bin/bash
VENV  := .venv
PY    := $(VENV)/bin/python
PIP   := $(VENV)/bin/pip
PIPE  := packages/pipeline

# .env を読み込む(存在すれば)
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: help setup collect parse dedup score categorize translate index pipeline meili-up meili-down meili-logs web-install web-dev all clean

help:
	@echo "agent-skills.jp Make ターゲット一覧:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' || \
	echo "  setup / collect / parse / dedup / score / categorize / translate / index / meili-up / web-dev / all"

setup: ## Python venv 作成 & 依存インストール
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

collect: ## 01: GitHub から SKILL.md 収集 (Phase A: clone)
	cd $(PIPE) && ../../$(PY) 01_collect_skills.py --phase a

collect-all: ## 01: Phase A + B (Search API も含む)
	cd $(PIPE) && ../../$(PY) 01_collect_skills.py --phase all

parse: ## 02: YAML パース & 正規化
	cd $(PIPE) && ../../$(PY) 02_parse.py

dedup: ## 03: 重複排除
	cd $(PIPE) && ../../$(PY) 03_dedup.py

score: ## 04: 品質スコアリング (GitHub API 使用)
	cd $(PIPE) && ../../$(PY) 04_score.py

categorize: ## 05: カテゴリ自動分類 (OpenAI embedding)
	cd $(PIPE) && ../../$(PY) 05_categorize.py

translate: ## 06: 日本語翻訳 (Anthropic Batch API)
	cd $(PIPE) && ../../$(PY) 06_translate.py

index: ## 07: Meilisearch に投入
	cd $(PIPE) && ../../$(PY) 07_index.py

pipeline: parse dedup score categorize ## 02-05 をまとめて実行

meili-up: ## Meilisearch を起動 (docker compose)
	cd infra/meilisearch && docker compose up -d

meili-down: ## Meilisearch を停止
	cd infra/meilisearch && docker compose down

meili-logs: ## Meilisearch のログ
	cd infra/meilisearch && docker compose logs -f

web-install: ## Next.js の依存インストール
	cd apps/web && npm install

web-dev: ## Next.js dev server 起動
	cd apps/web && npm run dev

all: collect pipeline translate index ## フルパイプライン(翻訳・投入まで)

clean: ## data/, .clones/ を削除
	rm -rf data .clones
