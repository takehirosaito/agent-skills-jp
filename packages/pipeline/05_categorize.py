"""
パイプライン step 05: カテゴリ自動分類 (Claude 版)
=================================================
スキル名 + description を Claude Haiku 4.5 に渡し、13 カテゴリのいずれかに分類する。
プロンプトキャッシュ + Batch API (50% 割引) を使い、6,000 件で ~$4 程度。

旧版は OpenAI text-embedding-3-small + cosine argmax だったが、
- LLM 系スキルが "language" アンカーに引っ張られて翻訳カテゴリに大量流入
- 専用カテゴリ不在で misc が肥大化 (1,000 件超)
の構造的問題があったため、定義テキストと判定基準を明示できる LLM 分類に置き換えた。

入力:  data/scored_skills.jsonl
出力:  data/categorized_skills.jsonl
"""

import json
import os
import re
import time

import anthropic

from config import DATA_DIR

INPUT_FILE = DATA_DIR / "scored_skills.jsonl"
OUTPUT_FILE = DATA_DIR / "categorized_skills.jsonl"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
MODEL = "claude-haiku-4-5-20251001"

CATEGORIES = {
    "ai-development": "LLM・AI開発: LLM API利用、プロンプトエンジニアリング、RAG、エージェント設計、モデル選択・評価器(LLM-as-Judge)・コスト最適化、MCP/エージェント基盤、ファインチューニング、トークン最適化、ルーティング、マルチモーダル、AIエージェントワークフロー",
    "development": "ソフトウェア開発: 一般プログラミング、コーディング、フレームワーク利用、デバッグ、リファクタリング、テスト、Git/バージョン管理、IDE、コードレビュー。LLM API 直接利用は ai-development",
    "data-analysis": "データ・分析: SQL、dbt、データ可視化、BI、ML(モデル訓練)、データパイプライン、統計分析、ETL、データ品質、Pine Script",
    "devops": "DevOps・インフラ: CI/CD、Kubernetes/Docker、クラウド(AWS/GCP/Azure)、IaC(Terraform/Pulumi)、監視、デプロイ自動化、ネットワーク。MCPサーバー実装は ai-development",
    "security": "セキュリティ: 認証認可、暗号化、脆弱性診断、OWASP、ペンテスト、SBOM、コンプライアンス監査、シークレット管理",
    "ecommerce-marketing": "EC・マーケティング: 楽天/Amazon/Shopify、SEO/GEO、広告運用、SNSマーケティング(Instagram/TikTok)、CRM、コンバージョン最適化、商品ページ最適化、メルマガ",
    "design-creative": "デザイン・クリエイティブ: UI/UXデザイン、画像生成(Midjourney/DALL-E)、グラフィックデザイン、プレゼン資料、ロゴ、Figma、Canva。動画/音声編集は media-audio",
    "media-audio": "音声・動画・メディア: TTS、ASR(文字起こし/Whisper)、ポッドキャスト、動画編集、ナレーション、字幕生成、ストリーム配信、音声合成、画像処理(編集)",
    "business": "ビジネス・経営: 経営戦略、財務会計、HR、PM、法務、業界特化(医療/不動産/金融)、CRM、組織マネジメント、品質管理、見積もり",
    "productivity": "個人生産性: タスク管理(Todoist/Notion)、メール、カレンダー、ノート、習慣化、Pomodoro、個人ナレッジ管理",
    "documentation": "ドキュメント: 技術文書執筆、API doc、README、changelog、リリースノート、用語集、Wiki",
    "education": "教育・学習: チュートリアル、コース、教材、研究学習ガイド、コーチング、学術的学習、語学学習",
    "misc": "その他: どの主カテゴリにも明確に当てはまらないもののみ。ゲーム、エンタメ、占い、Web3予測市場、ジョーク、極めて特殊な実験ツール等。これはフォールバックなので極力使わない",
}
CATEGORY_KEYS = set(CATEGORIES.keys())
_CAT_BLOCK = "\n".join(f"- {k}: {v}" for k, v in CATEGORIES.items())

SYSTEM_PROMPT = f"""あなたは Agent Skills (AI エージェント用スキルパッケージ) のカテゴリ分類専門家です。

スキル名と description を読んで、最も適切なカテゴリ 1 つを次の中から選んでください。複数当てはまる場合は、スキルの主たる目的・用途を最も的確に表すものを優先します。

カテゴリ定義:
{_CAT_BLOCK}

特に注意すべき判定基準:
- 「LLM」「prompt」「LangChain」「LangGraph」「agent」「MCP」「RAG」「evaluation」「token」が中心テーマなら ai-development。「language」という単語があってもそれが「LLM = Large Language Model」由来なら ai-development であり language ではない
- 一般的なコーディング/Git/テスト改善ワークフローは development (AI コーディング支援を題材にしていても、本質が開発作業なら development)
- データの分析・可視化・ML 訓練は data-analysis。エージェント評価器は ai-development
- TTS、ASR、動画編集、音声処理、画像加工は media-audio
- ゲーム、エンタメ、Web3、占い、ジョークは misc

純粋な「翻訳・i18n・ローカライゼーション」スキルは business か development に分類してください (language カテゴリは廃止)。

出力は次の JSON 1 行のみ。説明文・前置き・コードフェンスは一切不要:
{{"category": "<slug>", "confidence": <0.0-1.0>, "second": "<slug or null>"}}
"""

_JSON_RX = re.compile(r"\{[^{}]*\}", re.DOTALL)


def _parse(text: str) -> tuple[str, float] | None:
    m = _JSON_RX.search(text)
    if not m:
        return None
    try:
        obj = json.loads(m.group(0))
    except json.JSONDecodeError:
        return None
    cat = obj.get("category")
    if cat not in CATEGORY_KEYS:
        return None
    try:
        conf = float(obj.get("confidence", 0.5))
    except (TypeError, ValueError):
        conf = 0.5
    return cat, conf


def _build_user_msg(skill: dict) -> str:
    desc = (skill.get("description_original") or "")[:1500]
    name = skill.get("name") or skill.get("slug") or ""
    return f"スキル名: {name}\n\ndescription:\n{desc}"


def _build_batch_requests(skills: list[dict]) -> list[dict]:
    reqs = []
    for s in skills:
        reqs.append({
            "custom_id": s["id"],
            "params": {
                "model": MODEL,
                "max_tokens": 120,
                "system": [{
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }],
                "messages": [{"role": "user", "content": _build_user_msg(s)}],
            },
        })
    return reqs


def classify_via_batch(skills: list[dict]) -> dict[str, tuple[str, float]]:
    """Batch API で全件分類。未パース・拒否は misc / 0.0 にフォールバック"""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    reqs = _build_batch_requests(skills)
    batch = client.messages.batches.create(requests=reqs)
    print(f"Batch ID: {batch.id}")
    while True:
        time.sleep(20)
        b = client.messages.batches.retrieve(batch.id)
        print(f"  status: {b.processing_status}  counts: {b.request_counts}")
        if b.processing_status == "ended":
            break

    results: dict[str, tuple[str, float]] = {}
    for r in client.messages.batches.results(batch.id):
        if r.result.type != "succeeded":
            continue
        parsed = _parse(r.result.message.content[0].text)
        if parsed is None:
            continue
        results[r.custom_id] = parsed
    return results


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    skills = []
    with INPUT_FILE.open(encoding="utf-8") as f:
        for line in f:
            try:
                skills.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    print(f"対象: {len(skills)}件")

    results = classify_via_batch(skills)
    print(f"分類成功: {len(results)} / {len(skills)} 件")

    with OUTPUT_FILE.open("w", encoding="utf-8") as f_out:
        for skill in skills:
            cat, conf = results.get(skill["id"], ("misc", 0.0))
            skill["category"] = cat
            skill["category_confidence"] = conf
            f_out.write(json.dumps(skill, ensure_ascii=False) + "\n")

    print(f"出力: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
