/**
 * ALSEL独自EC実務スキル100選 — カテゴリ分類
 *
 * 100スキルを10カテゴリに分類してトップページ特集セクションと
 * 特集ページ /alsel-ec-skills で表示する。
 */

export type AlselEcCategoryId =
  | "amazon"
  | "rakuten"
  | "shopify"
  | "yahoo"
  | "other-cart"
  | "legal"
  | "data"
  | "customer"
  | "ad"
  | "master";

export type AlselEcCategory = {
  id: AlselEcCategoryId;
  label: string;
  icon: string;
  desc: string;
  count: number;
};

export const ALSEL_EC_CATEGORIES: AlselEcCategory[] = [
  {
    id: "amazon",
    label: "Amazon",
    icon: "📦",
    desc: "A+コンテンツ・フラットファイル・SP広告・タイトル改善ほか",
    count: 15,
  },
  {
    id: "rakuten",
    label: "楽天市場",
    icon: "🛒",
    desc: "RMS日次パトロール・RPP・SS準備・商品名/キャッチコピーほか",
    count: 20,
  },
  {
    id: "shopify",
    label: "Shopify",
    icon: "🟢",
    desc: "Liquid/Metafields・CVR診断・SEO・放棄カートメールほか",
    count: 10,
  },
  {
    id: "yahoo",
    label: "Yahoo!ショッピング",
    icon: "🟣",
    desc: "PayPay施策・優良配送・CSV検証・アイテムマッチ広告ほか",
    count: 10,
  },
  {
    id: "other-cart",
    label: "他カート",
    icon: "🏪",
    desc: "BASE/STORES・futureshop・makeshop 商品ページ・メールほか",
    count: 5,
  },
  {
    id: "legal",
    label: "法務・規約",
    icon: "⚖️",
    desc: "薬機法・景表法・特商法・インボイス制度・返品ポリシーほか",
    count: 7,
  },
  {
    id: "data",
    label: "データ・CSV",
    icon: "📊",
    desc: "JANコード・Shift_JIS/UTF-8・ネクストエンジン・GMC連携ほか",
    count: 6,
  },
  {
    id: "customer",
    label: "顧客対応・メール",
    icon: "✉️",
    desc: "問合せ返信・配送遅延お詫び・FAQ作成・LINE/メルマガほか",
    count: 6,
  },
  {
    id: "ad",
    label: "広告・LP・SNS",
    icon: "📢",
    desc: "Meta広告・SNS投稿・LP診断・インフルエンサー依頼ほか",
    count: 8,
  },
  {
    id: "master",
    label: "商品マスタ・分析",
    icon: "🏷️",
    desc: "SKU命名・粗利計算・在庫・季節カレンダー・ベネフィット化ほか",
    count: 13,
  },
];

const LEGAL_SLUGS = new Set([
  "yakki-keihyo-expression-check",
  "tokutei-shotorihiki-page-checker",
  "return-policy-consistency-check",
  "google-merchant-center-policy-diagnosis",
  "invoice-receipt-mail-template",
  "complaint-root-cause-cluster",
  "review-reply-tone-controller",
]);

const DATA_SLUGS = new Set([
  "jan-code-checker",
  "csv-encoding-sjis-validator",
  "mall-to-mall-csv-mapper",
  "next-engine-product-master-cleaner",
  "crossmall-inventory-sync-checker",
  "merchant-center-feed-error-fixer",
]);

const CUSTOMER_SLUGS = new Set([
  "customer-inquiry-reply-ec",
  "delivery-delay-apology-builder",
  "faq-from-inquiries-builder",
  "line-official-message-ec",
  "mailmagazine-ec-campaign",
  "ec-monthly-management-report",
]);

const AD_SLUGS = new Set([
  "ec-ad-creative-brief",
  "ec-sns-post-generator",
  "influencer-brief-generator",
  "meta-ad-copy-ec-jp",
  "ec-landing-page-outline",
  "lp-firstview-diagnosis",
  "competitor-page-summary",
  "gift-demand-keyword-builder",
]);

const OTHER_CART_PREFIXES = ["base-", "futureshop-", "makeshop-"];

const LEGACY_SLUGS = new Set([
  "rakuten-seo",
  "amazon-seo-jp",
  "rakuten-bulk-control-csv",
]);

/**
 * ALSEL独自EC実務スキルのslugを10カテゴリに分類する。
 * 楽天SEO等のlegacy 3件は楽天/Amazonに振り分け。
 */
export function categorizeAlselEcSlug(slug: string): AlselEcCategoryId {
  if (slug.startsWith("amazon-") || slug === "amazon-seo-jp") return "amazon";
  if (slug.startsWith("rakuten-")) return "rakuten";
  if (slug.startsWith("shopify-")) return "shopify";
  if (slug.startsWith("yahoo-")) return "yahoo";
  if (OTHER_CART_PREFIXES.some((p) => slug.startsWith(p))) return "other-cart";
  if (LEGAL_SLUGS.has(slug)) return "legal";
  if (DATA_SLUGS.has(slug)) return "data";
  if (CUSTOMER_SLUGS.has(slug)) return "customer";
  if (AD_SLUGS.has(slug)) return "ad";
  return "master";
}

export function getCategoryById(id: AlselEcCategoryId): AlselEcCategory {
  return ALSEL_EC_CATEGORIES.find((c) => c.id === id) ?? ALSEL_EC_CATEGORIES[0];
}
