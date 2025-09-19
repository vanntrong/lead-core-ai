export type PlanTier = "basic" | "pro" | "unlimited";

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_id: string; // Stripe product price id
  tier: PlanTier;
  features: string[];
  description: string;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price_monthly: 9700,
    price_id: "price_basic_123", // Thay bằng Stripe price id thực tế
    tier: "basic",
    features: [
      "Scraping from 1 source (Shopify/Etsy/G2/Woocommerce)",
      "100 leads/month"
    ],
    description: "Basic plan for individuals or small teams starting out.",
  },
  {
    id: "pro",
    name: "Pro",
    price_monthly: 29700,
    price_id: "price_pro_456", // Thay bằng Stripe price id thực tế
    tier: "pro",
    features: [
      "Scraping from all sources",
      "500 leads/month",
      "Data export (CSV, Sheets)",
    ],
    description: "Professional plan for growing businesses, includes data export.",
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price_monthly: 49700,
    price_id: "price_unlimited_789", // Thay bằng Stripe price id thực tế
    tier: "unlimited",
    features: [
      "Unlimited source scraping",
      "Unlimited leads/month",
      "Unlimited AI enrichments",
      "Export to Zapier, Sheets, CSV",
    ],
    description: "Premium plan for large businesses, unlimited scraping and enrichment.",
  },
];
