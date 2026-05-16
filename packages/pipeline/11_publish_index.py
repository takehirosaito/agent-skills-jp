"""
パイプライン step 11: GitHub raw 公開用スキル一覧 JSON を生成
==============================================================
prod Meilisearch から「サイトで表示している非テンプレ・非内部・非off-topic」な
全スキルを抽出し、リポジトリ root に skills-index.json として書き出す。

これは find-skills スキルが claude.ai サンドボックス等の制限環境からも
fetch できるよう、raw.githubusercontent.com 経由で配信するためのデータソース。
git に commit して push すると GitHub raw URL でアクセス可能になる:

  https://raw.githubusercontent.com/takehirosaito/agent-skills-jp/main/skills-index.json

入力:  Meilisearch (PROD)
出力:  <repo-root>/skills-index.json (~3 MB)
"""
import datetime
import json
import os
import pathlib
import urllib.request


MEILI_URL = os.environ.get("PROD_MEILI_HOST") or os.environ.get("MEILI_URL", "http://localhost:7700")
MEILI_KEY = os.environ.get("PROD_MEILI_MASTER_KEY") or os.environ.get("MEILI_MASTER_KEY", "")

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
OUT = REPO_ROOT / "skills-index.json"


def _trim(s: str | None, n: int) -> str:
    s = (s or "").strip().replace("\n", " ")
    return s if len(s) <= n else s[:n] + "…"


def fetch_all():
    out = []
    # Meilisearch 側 pagination.maxTotalHits は 50000 まで開放済み
    for off in range(0, 50000, 500):
        body = json.dumps({
            "q": "",
            "limit": 500,
            "offset": off,
            "filter": "is_template != true AND is_internal != true AND is_off_topic != true AND is_duplicate != true",
            "attributesToRetrieve": [
                "slug", "name", "description_ja", "category", "vendor",
                "quality_score", "license", "is_original", "repo_url", "raw_url",
            ],
        }).encode()
        req = urllib.request.Request(
            f"{MEILI_URL}/indexes/skills/search",
            data=body,
            headers={
                "Authorization": f"Bearer {MEILI_KEY}",
                "Content-Type": "application/json",
            },
        )
        hits = json.loads(urllib.request.urlopen(req).read())["hits"]
        if not hits:
            break
        out += hits
    return out


def main():
    hits = fetch_all()
    print(f"対象: {len(hits)} 件")

    items = []
    for h in hits:
        items.append({
            "slug": h["slug"],
            "name": h.get("name", h["slug"]),
            "desc": _trim(h.get("description_ja"), 300),
            "category": h.get("category", "misc"),
            "vendor": h.get("vendor", "generic"),
            "quality": h.get("quality_score", 0),
            "license": h.get("license") or "",
            "alsel": bool(h.get("is_original")),
            "url": f"https://agent-skills.jp/skill/{h['slug']}",
            "repo": h.get("repo_url") or "",
            "raw": h.get("raw_url") or "",
        })
    items.sort(key=lambda x: (not x["alsel"], -x["quality"]))

    payload = {
        "version": 1,
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "count": len(items),
        "source": "https://agent-skills.jp",
        "license": "Index metadata: MIT. Individual skills retain their original licenses.",
        "skills": items,
    }
    with OUT.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = OUT.stat().st_size / 1024
    print(f"書き出し: {OUT} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
