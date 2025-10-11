
const pricingPlans = [
    {
        name: "Trial Plan",
        tier: "trial",
        priceId: process.env.NEXT_PUBLIC_TRIAL_PLAN_ID,
        priceMonthly: 700,
        features: [
            "Scrape & enrich up to 25 leads",
            "Choose Shopify, G2, Woo, or Etsy",
            "Real-time enrichment + verification",
            "CSV Export",
            "Empty-2",
        ],
        limits: {
            sources: 1,
            leads_per_month: 25,
            csv_export: true,
            sheets_export: false,
            zapier_export: false,
        },
    },
    {
        name: "Basic Plan",
        tier: "basic",
        priceId: process.env.NEXT_PUBLIC_BASIC_PLAN_ID,
        priceMonthly: 9700,
        features: [
            "Choose Shopify, G2, Woo, or Etsy",
            "Real-time enrichment + verification",
            "CSV Export",
            "Up to 100 qualified leads/month",
            "Basic support",
        ],
        limits: {
            sources: 1,
            leads_per_month: 100,
            csv_export: true,
            sheets_export: false,
            zapier_export: false,
        },
    },
    {
        name: "Pro Plan",
        tier: "pro",
        priceId: process.env.NEXT_PUBLIC_PRO_PLAN_ID,
        priceMonthly: 29_700,
        features: [
            "Unlimited data sources",
            "Advanced lead enrichment",
            "Export to CSV + Sheets",
            "Up to 500 qualified leads/month",
            "Advanced support",
        ],
        limits: {
            sources: "unlimited",
            leads_per_month: 500,
            csv_export: true,
            sheets_export: true,
            zapier_export: false,
        },
    },
    {
        name: "Unlimited Plan",
        tier: "unlimited",
        priceId: process.env.NEXT_PUBLIC_UNLIMITED_PLAN_ID,
        priceMonthly: 49_700,
        features: [
            "Unlimited data sources",
            "Advanced lead enrichment",
            "Unlimited leads per month",
            "Zapier & Webhooks",
            "Priority support",
        ],
        limits: {
            sources: "unlimited",
            leads_per_month: "unlimited",
            csv_export: true,
            sheets_export: true,
            zapier_export: true,
        },
    },
];

export default pricingPlans;
