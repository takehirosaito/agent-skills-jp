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
  /** タイル左上に表示する短いマーク（ロゴ代わりの文字/記号） */
  mark: string;
  /** ブランドを連想させるアクセントカラー（Tailwind hex） */
  color: string;
  /** タイル背景の淡い色 */
  bg: string;
  desc: string;
  count: number;
};

/**
 * 各カテゴリのカラーは主要モール/業界のブランドカラーを参考にした
 * 「それっぽい色」を採用。商標ロゴは使わず、頭文字または記号でロゴ風に表示。
 */
export const ALSEL_EC_CATEGORIES: AlselEcCategory[] = [
  {
    id: "amazon",
    label: "Amazon",
    mark: "a.",
    color: "#FF9900",
    bg: "#FFF7ED",
    desc: "A+コンテンツ・フラットファイル・SP広告・タイトル改善ほか",
    count: 15,
  },
  {
    id: "rakuten",
    label: "楽天市場",
    mark: "R",
    color: "#BF0000",
    bg: "#FEF2F2",
    desc: "RMS日次パトロール・RPP・SS準備・商品名/キャッチコピーほか",
    count: 20,
  },
  {
    id: "shopify",
    label: "Shopify",
    mark: "S",
    color: "#5E8E3E",
    bg: "#F0FDF4",
    desc: "Liquid/Metafields・CVR診断・SEO・放棄カートメールほか",
    count: 10,
  },
  {
    id: "yahoo",
    label: "Yahoo!ショッピング",
    mark: "Y!",
    color: "#7C3AED",
    bg: "#F5F3FF",
    desc: "PayPay施策・優良配送・CSV検証・アイテムマッチ広告ほか",
    count: 10,
  },
  {
    id: "other-cart",
    label: "他カート",
    mark: "○",
    color: "#475569",
    bg: "#F8FAFC",
    desc: "BASE/STORES・futureshop・makeshop 商品ページ・メールほか",
    count: 5,
  },
  {
    id: "legal",
    label: "法務・規約",
    mark: "§",
    color: "#1E40AF",
    bg: "#EFF6FF",
    desc: "薬機法・景表法・特商法・インボイス制度・返品ポリシーほか",
    count: 7,
  },
  {
    id: "data",
    label: "データ・CSV",
    mark: "{ }",
    color: "#0E7490",
    bg: "#ECFEFF",
    desc: "JANコード・Shift_JIS/UTF-8・ネクストエンジン・GMC連携ほか",
    count: 6,
  },
  {
    id: "customer",
    label: "顧客対応・メール",
    mark: "@",
    color: "#047857",
    bg: "#ECFDF5",
    desc: "問合せ返信・配送遅延お詫び・FAQ作成・LINE/メルマガほか",
    count: 6,
  },
  {
    id: "ad",
    label: "広告・LP・SNS",
    mark: "Ad",
    color: "#DB2777",
    bg: "#FDF2F8",
    desc: "Meta広告・SNS投稿・LP診断・インフルエンサー依頼ほか",
    count: 8,
  },
  {
    id: "master",
    label: "商品マスタ・分析",
    mark: "▦",
    color: "#B45309",
    bg: "#FFFBEB",
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
