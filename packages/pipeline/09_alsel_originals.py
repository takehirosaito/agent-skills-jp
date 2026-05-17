"""
パイプライン step 09: ALSEL 独自スキルを登録
============================================
3 件の SKILL.md (rakuten-seo, amazon-seo-jp, rakuten-bulk-control-csv) を
ALSEL 独自スキルとして data/alsel_originals.jsonl に書き出し、Meilisearch に追加投入する。

これらはサイト限定スキル(GitHub 非公開)で、is_original=true / is_featured=true で
UI 上の優先表示と「ALSEL独自」バッジ表示を制御する。

入力:  data/alsel_originals/_<slug>/<slug>/SKILL.md
出力:  data/alsel_originals.jsonl  +  Meilisearch
"""

import json
import os
import re
import uuid
from pathlib import Path

import meilisearch

from config import DATA_DIR

ORIGINALS_DIR = DATA_DIR / "alsel_originals"
OUTPUT_FILE = DATA_DIR / "alsel_originals.jsonl"

MEILI_URL = os.environ.get("MEILI_URL", "http://localhost:7700")
MEILI_KEY = os.environ.get("MEILI_MASTER_KEY", "")
INDEX_NAME = "skills"

CREDIT_LINE = (
    "【ALSEL独自スキル】株式会社ALSEL が、19年・5,000社超の EC 支援で得た"
    "ノウハウをもとに開発したオリジナルスキルです。"
)

# 既存3件（v0.1.0〜v0.1.7）
_LEGACY_SLUGS = ["rakuten-seo", "amazon-seo-jp", "rakuten-bulk-control-csv"]

# 2026-05 追加：EC実務向け100スキル（v3強化版）
_EC_100_SLUGS = [
    "amazon-a-plus-content-brief",
    "amazon-brand-store-planner",
    "amazon-bullet-attribute-benefit",
    "amazon-catalog-conflict-ticket-builder",
    "amazon-flat-file-validator-jp",
    "amazon-main-image-checker",
    "amazon-profit-fee-checker",
    "amazon-review-qa-mining",
    "amazon-search-term-builder-jp",
    "amazon-sp-keyword-harvester",
    "amazon-sponsored-products-rebuilder",
    "amazon-suppressed-listing-recovery",
    "amazon-title-bullet-rewriter-jp",
    "amazon-us-localization-jp-brand",
    "amazon-variation-parent-child-audit",
    "base-stores-product-registration",
    "bundle-set-product-planner",
    "competitor-page-summary",
    "complaint-root-cause-cluster",
    "crossmall-inventory-sync-checker",
    "csv-encoding-sjis-validator",
    "customer-inquiry-reply-ec",
    "deadstock-clearance-planner",
    "delivery-delay-apology-builder",
    "ec-ad-creative-brief",
    "ec-landing-page-outline",
    "ec-monthly-management-report",
    "ec-product-master-cleaner-jp",
    "ec-sns-post-generator",
    "faq-from-inquiries-builder",
    "free-shipping-threshold-calculator",
    "futureshop-mailmagazine-builder",
    "futureshop-product-page-seo",
    "gift-demand-keyword-builder",
    "google-merchant-center-policy-diagnosis",
    "influencer-brief-generator",
    "inventory-alert-action-list",
    "invoice-receipt-mail-template",
    "jan-code-checker",
    "line-official-message-ec",
    "lp-firstview-diagnosis",
    "mailmagazine-ec-campaign",
    "makeshop-product-csv-validator",
    "makeshop-product-page-copy",
    "mall-to-mall-csv-mapper",
    "merchant-center-feed-error-fixer",
    "meta-ad-copy-ec-jp",
    "next-engine-product-master-cleaner",
    "price-margin-simulator",
    "product-attribute-normalizer",
    "product-benefit-copywriter",
    "rakuten-category-page-copy",
    "rakuten-coupon-planner",
    "rakuten-genre-id-selector",
    "rakuten-gift-demand-keywords",
    "rakuten-image-text-checker",
    "rakuten-keyword-map-builder",
    "rakuten-mailmagazine-builder",
    "rakuten-pc-description-html",
    "rakuten-price-compare-audit",
    "rakuten-product-image-brief",
    "rakuten-review-mining",
    "rakuten-review-reply-generator",
    "rakuten-rms-daily-patrol",
    "rakuten-rpp-exclusion-csv-builder",
    "rakuten-rpp-keyword-audit",
    "rakuten-sales-copy-audit",
    "rakuten-sku-variation-checker",
    "rakuten-smartphone-description-html",
    "rakuten-suggest-keyword-expander",
    "rakuten-super-sale-prep",
    "reorder-point-forecast-lite",
    "return-policy-consistency-check",
    "review-analysis-copy-angles",
    "review-reply-tone-controller",
    "seasonal-sales-calendar-jp",
    "shopify-abandoned-cart-mail",
    "shopify-blog-content-planner",
    "shopify-collection-seo-builder",
    "shopify-cvr-diagnosis",
    "shopify-ga4-search-console-report",
    "shopify-liquid-section-brief",
    "shopify-lp-from-image-brief",
    "shopify-metafields-structure",
    "shopify-product-page-seo-jp",
    "shopify-section-idea-generator-jp",
    "sku-naming-rule-generator",
    "tokutei-shotorihiki-page-checker",
    "variation-builder-jp",
    "yahoo-ad-keyword-planner",
    "yahoo-category-path-selector",
    "yahoo-coupon-copy-builder",
    "yahoo-item-image-audit",
    "yahoo-paypay-campaign-planner",
    "yahoo-product-csv-validator",
    "yahoo-review-reply-generator",
    "yahoo-search-suggest-builder",
    "yahoo-shipping-policy-checker",
    "yahoo-shopping-seo-title",
    "yakki-keihyo-expression-check",
]

SLUGS = _LEGACY_SLUGS + _EC_100_SLUGS


def parse_skill_md(path: Path) -> tuple[dict, str]:
    """SKILL.md をフロントマター + 本文に分解(YAML パーサーは使わず簡易版)"""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), m.group(2)
    fm: dict[str, str] = {}
    current_key: str | None = None
    multiline_buf: list[str] = []
    for line in fm_raw.split("\n"):
        # 行頭インデント = multiline 継続
        if line.startswith("  ") and current_key:
            multiline_buf.append(line.strip())
            continue
        # 既存 multiline を flush
        if current_key and multiline_buf:
            fm[current_key] = (fm.get(current_key, "") + " " + " ".join(multiline_buf)).strip()
            multiline_buf = []
        # key: value 行
        km = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if km:
            current_key = km.group(1)
            value = km.group(2).strip()
            if value == ">" or value == "|":
                fm[current_key] = ""
            else:
                fm[current_key] = value
    if current_key and multiline_buf:
        fm[current_key] = (fm.get(current_key, "") + " " + " ".join(multiline_buf)).strip()
    return fm, text  # text 全体を content_full として返す(frontmatter 含む)


def build_doc(slug: str) -> dict:
    skill_md_path = ORIGINALS_DIR / f"_{slug}" / slug / "SKILL.md"
    fm, content_full = parse_skill_md(skill_md_path)

    name = fm.get("name") or slug
    desc_ja_raw = fm.get("description", "")
    # description の末尾にクレジットを付与
    description_ja = desc_ja_raw.rstrip() + "\n\n" + CREDIT_LINE

    return {
        # スラッグから決定的 UUID(再投入時に同じ id で upsert される)
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://agent-skills.jp/alsel/{slug}")),
        "slug": slug,
        "name": name,
        "description_original": desc_ja_raw,
        "description_ja": description_ja,
        "content_full": content_full,
        "content_full_ja": content_full,  # 元から日本語
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
        "last_updated": "2026-05-13T00:00:00Z",
        "source": "alsel_original",
        "is_featured": True,
        "is_original": True,
    }


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    docs = [build_doc(s) for s in SLUGS]

    # 永続化(再投入用)
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        for d in docs:
            f.write(json.dumps(d, ensure_ascii=False) + "\n")
    print(f"書き出し: {len(docs)} 件 -> {OUTPUT_FILE}")

    # Meilisearch に投入(既存の他スキルとマージ。primary key id で upsert)
    client = meilisearch.Client(MEILI_URL, MEILI_KEY)
    index = client.index(INDEX_NAME)

    # is_original / is_featured を filterable に追加
    existing_filterable = index.get_filterable_attributes()
    new_filterable = sorted(set(existing_filterable) | {"is_original", "is_featured"})
    if new_filterable != existing_filterable:
        task = index.update_filterable_attributes(new_filterable)
        print(f"filterable 更新 (task: {task.task_uid}): {new_filterable}")

    # displayable に is_original / is_featured を含める
    existing_displayed = index.get_displayed_attributes()
    if "is_original" not in existing_displayed:
        new_displayed = list(existing_displayed) + ["is_original", "is_featured"]
        index.update_displayed_attributes(new_displayed)
        print(f"displayed 更新: + is_original, is_featured")

    task = index.add_documents(docs)
    print(f"Meilisearch 投入 (task: {task.task_uid})")
    print("完了: 3 件の ALSEL 独自スキルを登録")


if __name__ == "__main__":
    main()
