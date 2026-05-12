"""
パイプライン step 05: カテゴリ自動分類
======================================
各スキルのdescriptionをembedding化し、
12カテゴリのアンカー文との類似度で自動分類する。

入力:  /home/claude/data/scored_skills.jsonl
出力:  /home/claude/data/categorized_skills.jsonl

OpenAI text-embedding-3-small を使用(コスト最安)。
50,000件 × 平均200tokens = 1000万tokens = $0.20
"""

import json
import os
import time
from pathlib import Path

import numpy as np
import requests

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "scored_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "categorized_skills.jsonl"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# カテゴリと、それを表すアンカー文(英語)
CATEGORIES = {
    "development": "Software development, coding, programming languages, frameworks, version control, debugging, code review, refactoring, software architecture",
    "data-analysis": "Data analysis, statistics, machine learning, data visualization, SQL, pandas, business intelligence, reporting, charts",
    "documentation": "Writing documentation, technical writing, README, API documentation, user manuals, knowledge base",
    "ecommerce-marketing": "E-commerce, online shopping, Rakuten, Amazon, Shopify, SEO, marketing, advertising, product listings, conversion optimization",
    "design-creative": "Graphic design, UI design, UX design, illustration, image generation, creative writing, video editing, presentations",
    "devops": "DevOps, CI/CD, deployment, Kubernetes, Docker, cloud infrastructure, AWS, Azure, monitoring, observability",
    "business": "Business operations, sales, customer support, finance, accounting, HR, project management, strategy",
    "education": "Teaching, learning, tutorials, courses, training, education, study materials, lesson plans",
    "language": "Translation, language learning, linguistics, multilingual content, internationalization, localization",
    "security": "Security, cybersecurity, vulnerability, penetration testing, authentication, encryption, privacy",
    "productivity": "Personal productivity, task management, notes, calendar, email, time tracking, habit tracking",
    "misc": "General utilities, miscellaneous tools, experimental features, one-off scripts",
}


def embed_batch(texts: list[str]) -> np.ndarray:
    """OpenAI Embedding APIで一括埋め込み"""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY環境変数が必要")
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "text-embedding-3-small",
        "input": texts,
    }
    for attempt in range(5):
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        if r.status_code == 200:
            data = r.json()["data"]
            return np.array([d["embedding"] for d in data])
        if r.status_code == 429:
            time.sleep(2 ** attempt)
            continue
        r.raise_for_status()
    raise RuntimeError("Embedding APIで失敗")


def cosine_sim(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """cosine類似度行列を返す"""
    a_norm = a / np.linalg.norm(a, axis=1, keepdims=True)
    b_norm = b / np.linalg.norm(b, axis=1, keepdims=True)
    return a_norm @ b_norm.T


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # アンカー文を先に埋め込み
    print("カテゴリアンカーを埋め込み中")
    category_keys = list(CATEGORIES.keys())
    anchor_texts = list(CATEGORIES.values())
    anchor_emb = embed_batch(anchor_texts)

    # スキルを読み込み
    skills = []
    with INPUT_FILE.open(encoding="utf-8") as f:
        for line in f:
            try:
                skills.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    print(f"対象スキル: {len(skills)}件")

    # バッチで埋め込み(100件ずつ)
    BATCH = 100
    with OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for i in range(0, len(skills), BATCH):
            batch = skills[i:i + BATCH]
            texts = [f"{s['name']}. {s['description_original'][:1000]}" for s in batch]
            emb = embed_batch(texts)
            sims = cosine_sim(emb, anchor_emb)
            for j, skill in enumerate(batch):
                best_idx = int(np.argmax(sims[j]))
                skill["category"] = category_keys[best_idx]
                skill["category_confidence"] = float(sims[j][best_idx])
                f_out.write(json.dumps(skill, ensure_ascii=False) + "\n")
            print(f"  分類済み: {min(i + BATCH, len(skills))}/{len(skills)}")
            time.sleep(0.3)

    print("カテゴリ分類完了")


if __name__ == "__main__":
    main()
