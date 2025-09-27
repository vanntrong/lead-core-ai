// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
export async function createSubscription({ user_id = "", plan_tier = "", stripe_price_id = "", stripe_subscription_id = "", period_start = null, period_end = null, usage_limit_id = null }) {
  const sub = await supabase.from("subscriptions").insert({
    user_id,
    usage_limit_id,
    plan_tier,
    subscription_status: 'active',
    stripe_subscription_id,
    stripe_price_id,
    period_start,
    period_end
  });
  return sub;
}
export const pricingPlans = [
  {
    tier: "basic",
    priceId: "price_1S9FJBG2cJrqXSBvC5Oyd5Km",
    limits: {
      sources: 1,
      leads_per_month: 100,
      export_enabled: false,
      zapier_export: false
    }
  },
  {
    tier: "pro",
    priceId: "price_1S9FJbG2cJrqXSBvQhFaDnAi",
    limits: {
      sources: "unlimited",
      leads_per_month: 500,
      export_enabled: true,
      zapier_export: false
    }
  },
  {
    tier: "unlimited",
    priceId: "price_1S9FK0G2cJrqXSBvluk26Kw0",
    limits: {
      sources: "unlimited",
      leads_per_month: "unlimited",
      export_enabled: true,
      zapier_export: true
    }
  }
];
