"""
ALSEL 独自スキルを本番 Meilisearch に upsert する（urllib 直叩き・依存なし）。

09_alsel_originals.py と同一スキーマでドキュメントを作り、
PROD_MEILI_HOST / PROD_MEILI_MASTER_KEY（無ければ MEILI_URL / MEILI_MASTER_KEY）へ投入する。

使い方:
  python scripts/ingest_originals.py <slug1> <slug2> ...
  python scripts/ingest_originals.py --all-batch   # 30本タスク全slug

入力: data/alsel_originals/_<slug>/<slug>/SKILL.md
id  : uuid5(NAMESPACE_URL, "https://agent-skills.jp/alsel/<slug>")  → 再投入で安全 upsert
"""
import json
import os
import re
import sys
import time
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS_DIR = ROOT / "data" / "alsel_originals"

HOST = os.environ.get("PROD_MEILI_HOST") or os.environ.get("MEILI_URL", "http://localhost:7700")
KEY = os.environ.get("PROD_MEILI_MASTER_KEY") or os.environ.get("MEILI_MASTER_KEY", "")
INDEX = "skills"

CREDIT_LINE = (
    "【ALSEL独自スキル】株式会社ALSEL が、19年・5,000社超の EC 支援で得た"
    "ノウハウをもとに開発したオリジナルスキルです。"
)

# 30本タスクの全 slug（バッチ順）
BATCH_SLUGS = [
    # Batch1 越境EC
    "amazon-global-selling-launch", "shopify-markets-cross-border-setup",
    "ebay-listing-optimization-jp", "cross-border-hs-code-duty-estimator",
    "taobao-tmall-entry-guide",
    # Batch2 Qoo10/モール拡張・海外SEO
    "qoo10-shop-opening-checklist", "qoo10-item-registration-guide",
    "qoo10-mega-wari-prep", "au-pay-market-item-setup",
    "multilingual-hreflang-planner",
    # Batch3 物流・在庫・通関
    "wms-requirements-definition", "multi-warehouse-allocation-planner",
    "import-customs-clearance-checklist", "shipping-carrier-rate-optimizer",
    "lead-time-reduction-planner",
    # Batch4 広告・大型セール・実験
    "tiktok-ads-ec-planner", "pinterest-shopping-ads-planner",
    "amazon-prime-day-prep", "amazon-dsp-audience-planner", "ab-test-design-ec",
    # Batch5 D2C・CRM・データ
    "d2c-subscription-design", "ltv-cohort-analysis-planner",
    "line-step-message-scenario", "crm-rfm-segmentation-planner",
    "refund-workflow-designer",
    # Batch6 ふるさと納税・B2B・ライブコマース
    "furusato-rakuten-listing", "furusato-satofuru-listing",
    "b2b-ec-quote-builder", "b2b-credit-screening-checklist",
    "live-commerce-script-planner",
]


def parse_skill_md(path: Path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not m:
        return {}, text
    fm_raw = m.group(1)
    fm = {}
    cur = None
    buf = []
    for line in fm_raw.split("\n"):
        if line.startswith("  ") and cur:
            buf.append(line.strip())
            continue
        if cur and buf:
            fm[cur] = (fm.get(cur, "") + " " + " ".join(buf)).strip()
            buf = []
        km = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if km:
            cur = km.group(1)
            v = km.group(2).strip()
            fm[cur] = "" if v in (">", "|") else v
    if cur and buf:
        fm[cur] = (fm.get(cur, "") + " " + " ".join(buf)).strip()
    return fm, text


def build_doc(slug: str) -> dict:
    p = ORIGINALS_DIR / f"_{slug}" / slug / "SKILL.md"
    fm, content_full = parse_skill_md(p)
    name = fm.get("name") or slug
    desc_ja_raw = fm.get("description", "")
    if not desc_ja_raw:
        raise ValueError(f"{slug}: description フロントマターが空")
    description_ja = desc_ja_raw.rstrip() + "\n\n" + CREDIT_LINE
    return {
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://agent-skills.jp/alsel/{slug}")),
        "slug": slug,
        "name": name,
        "description_original": desc_ja_raw,
        "description_ja": description_ja,
        "content_full": content_full,
        "content_full_ja": content_full,
        "language_original": "ja",
        "vendor": "claude",
        "category": "ecommerce-marketing",
        "category_confidence": 1.0,
        "author": "株式会社ALSEL",
        "repo_name": "alsel-jp/agent-skills",
        "repo_url": "https://agent-skills.jp",
        "repo_path": f"{slug}/SKILL.md",
        "raw_url": f"https://agent-skills.jp/skill/{slug}",
        "github_stars": 0,
        "license": "MIT",
        "quality_score": 100,
        "content_length": len(content_full),
        "last_updated": "2026-06-05T00:00:00Z",
        "source": "alsel_original",
        "is_featured": True,
        "is_original": True,
    }


def _req(method: str, path: str, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{HOST}{path}", data=data, method=method,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    return json.loads(urllib.request.urlopen(req).read())


def wait_task(task_uid: int, timeout=60):
    for _ in range(timeout):
        t = _req("GET", f"/tasks/{task_uid}")
        if t.get("status") in ("succeeded", "failed", "canceled"):
            return t
        time.sleep(1)
    return {"status": "timeout"}


def main():
    args = sys.argv[1:]
    if not args:
        print("usage: ingest_originals.py <slug...> | --all-batch")
        sys.exit(1)
    slugs = BATCH_SLUGS if args == ["--all-batch"] else args
    docs = [build_doc(s) for s in slugs]
    print(f"投入対象: {len(docs)} 件 → {HOST}")
    res = _req("POST", f"/indexes/{INDEX}/documents", docs)
    task_uid = res.get("taskUid", res.get("uid"))
    print(f"add_documents task: {task_uid}")
    t = wait_task(task_uid)
    print(f"task status: {t.get('status')}")
    if t.get("status") != "succeeded":
        print(json.dumps(t, ensure_ascii=False)[:800])
        sys.exit(2)
    # 検証: 各 slug が取得できるか
    ok = 0
    for s in slugs:
        r = _req("POST", f"/indexes/{INDEX}/search",
                 {"q": "", "filter": f'slug = "{s}" AND is_original = true', "limit": 1})
        if r.get("hits"):
            ok += 1
        else:
            print(f"  ✗ 未取得: {s}")
    print(f"検証: {ok}/{len(slugs)} slug が is_original=true で取得可能")
    sys.exit(0 if ok == len(slugs) else 3)


if __name__ == "__main__":
    main()
