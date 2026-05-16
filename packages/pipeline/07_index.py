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
import re
from pathlib import Path

import meilisearch

from config import DATA_DIR

# 量産テンプレ description のパターン (Auto-activating skill for ... / Triggers on: ... 系)。
# 該当する skill は is_template=True に分類し、Web 側でデフォルト除外する。
_TPL_AUTO_ACT = re.compile(r"Auto-activating skill")
_TPL_TRIGGERS = re.compile(r"Triggers on:")
_TPL_PART_OF = re.compile(r"Part of the .+ skill category")


def is_template_description(desc: str | None) -> bool:
    if not desc:
        return False
    if _TPL_AUTO_ACT.search(desc) and _TPL_TRIGGERS.search(desc):
        return True
    if _TPL_PART_OF.search(desc):
        return True
    return False

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
        "is_original",
        "is_featured",
        "is_template",
        "is_internal",
        "is_off_topic",
        "is_duplicate",
        "is_chinese_leak",
    ],
    "sortableAttributes": [
        "quality_score",
        "github_stars",
        "last_updated",
        "content_length",
    ],
    # ranking 順を「精度優先」に再構成
    #   words → exactness → attribute を先に評価することで、
    #   synonym/トークナイズ展開で広く拾われた中から、
    #   完全一致 + name 一致のスキルが上位に来る。
    "rankingRules": [
        "words",
        "exactness",
        "attribute",
        "typo",
        "proximity",
        "sort",
        "quality_score:desc",
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
        "is_original",
        "is_featured",
        "is_template",
        "is_internal",
        "is_off_topic",
        "is_duplicate",
        "is_chinese_leak",
    ],
    "stopWords": [],
    # 日本語複合語(やる気・会計 等)は lindera が形態素分解するため、
    # dictionary に登録して1単語化したいフレーズを明示する。
    # これによりトークナイズ後の AND マッチで他の語との誤マッチが減る。
    "dictionary": [
        # 業務系よく検索される複合語
        "やる気", "会計", "経理", "簿記", "財務", "売上", "売り上げ", "収益",
        "顧客", "カスタマー", "クライアント", "経営", "マネジメント",
        "マーケティング", "販促", "営業", "広告",
        # AI / dev 系
        "エージェント", "プロンプト", "ワークフロー", "自動化",
        "翻訳", "要約", "校正", "校閲", "編集",
        "テスト", "デプロイ", "リファクタ", "リファクタリング",
        "ドキュメント", "ドキュメンテーション", "コードレビュー",
        "セキュリティ", "認証", "暗号化",
        "デザイン", "ユーザー体験", "アクセシビリティ",
        "画像", "動画", "音声", "音楽",
        # JP固有 EC
        "楽天市場", "楽天SEO", "Amazon.co.jp", "ヤフオク",
        # その他カタカナ複合
        "モチベーション", "アナリティクス",
    ],
    "synonyms": {
        # Core abbreviations / Latin <-> JP
        "ai": ["artificial intelligence", "人工知能", "AI"],
        "ec": ["e-commerce", "ecommerce", "イーコマース"],
        "llm": ["language model", "大規模言語モデル"],
        "rakuten": ["楽天", "楽天市場", "Rakuten"],
        "楽天": ["楽天市場", "rakuten", "Rakuten"],
        "楽天市場": ["楽天", "rakuten"],
        "amazon": ["アマゾン", "Amazon.co.jp"],
        "アマゾン": ["amazon"],
        "seo": ["SEO", "検索最適化"],

        # Motivation
        "やる気": ["モチベーション", "motivation", "モチベ"],
        "モチベーション": ["やる気", "motivation", "モチベ"],
        "motivation": ["やる気", "モチベーション"],

        # Accounting / Finance
        "会計": ["accounting", "経理", "簿記"],
        "accounting": ["会計", "経理", "簿記"],
        "経理": ["accounting", "会計", "簿記"],
        "簿記": ["accounting", "会計", "bookkeeping"],
        "財務": ["finance"],
        "finance": ["財務"],

        # Customer
        "顧客": ["customer", "カスタマー"],
        "customer": ["顧客", "カスタマー"],
        "カスタマー": ["customer", "顧客"],

        # Sales
        "売上": ["売り上げ", "revenue", "sales"],
        "売り上げ": ["売上"],
        "revenue": ["売上", "sales"],
        "sales": ["売上"],

        # Management
        "マネジメント": ["management"],
        "management": ["マネジメント"],

        # Marketing
        "マーケティング": ["marketing"],
        "marketing": ["マーケティング"],

        # Dev
        "開発": ["development"],
        "development": ["開発"],

        # Testing
        "テスト": ["test", "testing"],
        "testing": ["テスト"],

        # Deploy
        "デプロイ": ["deploy", "deployment"],
        "deployment": ["デプロイ", "deploy"],

        # Docs
        "ドキュメント": ["docs", "documentation"],
        "documentation": ["docs", "ドキュメント"],

        # Agent
        "エージェント": ["agent"],
        "プロンプト": ["prompt"],

        # Workflow / Automation
        "ワークフロー": ["workflow"],
        "workflow": ["ワークフロー"],
        "自動化": ["automation"],
        "automation": ["自動化"],

        # Design
        "デザイン": ["design"],
        "design": ["デザイン"],

        # Security
        "セキュリティ": ["security"],
        "security": ["セキュリティ"],

        # Excel
        "エクセル": ["excel", "xlsx"],
        "excel": ["エクセル", "xlsx"],

        # Translation
        "翻訳": ["translation"],
        "translation": ["翻訳"],

        # File formats
        "csv": ["CSV"],
    },
    "typoTolerance": {
        "enabled": True,
        "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 8},
    },
    # Meilisearch の estimatedTotalHits は maxTotalHits でキャップされる。
    # デフォルト 1000 だとトップ/ディレクトリの件数表示が頭打ちになるため
    # 想定スキル数(MVP 1万、最終 5万)を見据えて 50000 まで開放する。
    "pagination": {
        "maxTotalHits": 50000,
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
            # 量産テンプレ description は is_template=True で表示除外
            if is_template_description(skill.get("description_original")):
                skill["is_template"] = True
            docs.append(skill)

    # ALSEL 独自スキルがあれば追加
    alsel_file = DATA_DIR / "alsel_originals.jsonl"
    if alsel_file.exists():
        added = 0
        with alsel_file.open(encoding="utf-8") as f:
            for line in f:
                try:
                    docs.append(json.loads(line))
                    added += 1
                except json.JSONDecodeError:
                    continue
        print(f"ALSEL 独自スキル: {added}件 を追加")

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
