// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
export async function createSubscription({
	user_id = "",
	plan_tier = "",
	stripe_price_id = "",
	stripe_subscription_id = "",
	period_start = null,
	period_end = null,
	usage_limit_id = null,
}) {
	const sub = await supabase.from("subscriptions").insert({
		user_id,
		usage_limit_id,
		plan_tier,
		subscription_status: "active",
		stripe_subscription_id,
		stripe_price_id,
		period_start,
		period_end,
	});
	return sub;
}
export const pricingPlans = [
	{
		tier: "trial",
		priceId: "price_1SGt6qRdJrlbSvYQNec1r3yK",
		limits: {
			sources: 1,
			leads_per_month: 25,
			csv_export: true,
			sheets_export: false,
			zapier_export: false,
		},
	},
	{
		tier: "basic",
		priceId: "price_1SGt7CRdJrlbSvYQTcHIljq9",
		limits: {
			sources: 1,
			leads_per_month: 100,
			csv_export: true,
			sheets_export: false,
			zapier_export: false,
		},
	},
	{
		tier: "pro",
		priceId: "price_1SGt7XRdJrlbSvYQjyhR1eAy",
		limits: {
			sources: "unlimited",
			leads_per_month: 500,
			csv_export: true,
			sheets_export: true,
			zapier_export: false,
		},
	},
	{
		tier: "unlimited",
		priceId: "price_1SGt7yRdJrlbSvYQD7PuqeZJ",
		limits: {
			sources: "unlimited",
			leads_per_month: "unlimited",
			csv_export: true,
			sheets_export: true,
			zapier_export: true,
		},
	},
];
