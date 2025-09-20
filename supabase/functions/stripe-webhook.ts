// LeadCore AI - Supabase Edge Function (Deno)
// Webhook handler: Save Stripe subscription events to subscriptions table
// File: supabase/functions/stripe-webhook.ts
import Stripe from 'https://esm.sh/stripe@14?target=denonext';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabase = createClient(supabaseUrl, supabaseKey);
Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret, undefined, cryptoProvider);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return new Response("Invalid JSON", {
      status: 400
    });
  }
  const type = event.type;
  const object = event.data?.object;
  if (!type || !object) {
    return new Response("Missing event data", {
      status: 400
    });
  }
  console.log("Webhook event", type);
  try {
    switch (type) {
      case "customer.subscription.created":
        {
          // Extract all relevant metadata fields from Stripe subscription
          const meta = object.metadata || {};
          const userId = meta.user_id;
          const source = meta.source;
          const priceId = object.items?.data[0]?.price?.id;
          if (!priceId) {
            return new Response("Missing priceId", {
              status: 400
            });
          }
          // Map priceId to pricingPlans
          const plan = pricingPlans.find((p) => p.priceId === priceId);
          if (!plan) {
            return new Response("Invalid priceId", {
              status: 400
            });
          }
          const { data: subscriptionExisting } = await supabase.from("subscriptions").select().eq("user_id", userId).eq("plan_tier", plan.tier).eq("subscription_status", 'active').maybeSingle();
          if (subscriptionExisting) throw new Error('User already has active subscription for this plan');
          // Create usage_limits for this plan_tier if not exists
          const usageLimit = await createUsageLimit({
            user_id: userId,
            plan_tier: plan.tier,
            sources: plan.limits.sources === "unlimited" ? [
              "etsy",
              "woocommerce",
              "shopify",
              "g2"
            ] : [
              source
            ],
            max_leads: plan.limits.leads_per_month === "unlimited" ? -1 : Number(plan.limits.leads_per_month),
            current_leads: 0,
            export_enabled: plan.limits.export_enabled,
            zapier_export: plan.limits.zapier_export,
            period_start: object.current_period_start ? new Date(object.current_period_start * 1000).toISOString() : null,
            period_end: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null
          });
          if (!usageLimit) throw new Error(`Create usage_limits for sub: ${object.id} error`);
          // Insert into subscriptions
          const subResult = await createSubscription({
            user_id: userId,
            usage_limit_id: usageLimit?.id ?? null,
            stripe_subscription_id: object.id,
            plan_tier: plan.tier,
            stripe_price_id: priceId,
            period_start: object.current_period_start ? new Date(object.current_period_start * 1000).toISOString() : new Date().toISOString(),
            period_end: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null
          });
          if (subResult.error) {
            return new Response(`DB error: ${subResult.error.message}`, {
              status: 500
            });
          }
          break;
        }
      case "customer.subscription.updated":
        {
          // Reset leads_per_month to plan value on renewal
          const leadsLimit = object.metadata?.leads_per_month ? Number(object.metadata.leads_per_month) : null;
          const { error } = await supabase.from("subscriptions").update({
            status: object.status,
            current_period_start: object.current_period_start ? new Date(object.current_period_start * 1000).toISOString() : null,
            current_period_end: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: object.cancel_at_period_end,
            canceled_at: object.canceled_at ? new Date(object.canceled_at * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
            leads_per_month: leadsLimit
          }).eq("stripe_subscription_id", object.id);
          if (error) {
            return new Response(`DB error: ${error.message}`, {
              status: 500
            });
          }
          break;
        }
      case "customer.subscription.deleted":
        {
          const { error } = await supabase.from("subscriptions").update({
            subscription_status: "canceled",
            updated_at: new Date().toISOString()
          }).eq("stripe_subscription_id", object.id);
          if (error) {
            return new Response(`DB error: ${error.message}`, {
              status: 500
            });
          }
          break;
        }
      case "customer.deleted":
        {
          // Mark all subscriptions for this customer as deleted/canceled
          const { error: subError } = await supabase.from("subscriptions").update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            event_type: type,
            updated_at: new Date().toISOString()
          }).eq("stripe_customer_id", object.id);
          if (subError) {
            return new Response(`DB error: ${subError.message}`, {
              status: 500
            });
          }
          // Mark stripe_customers as deleted
          const { error: custError } = await supabase.from("stripe_customers").update({
            status: "deleted",
            updated_at: new Date().toISOString()
          }).eq("stripe_customer_id", object.id);
          if (custError) {
            return new Response(`DB error: ${custError.message}`, {
              status: 500
            });
          }
          break;
        }
      default:
        break;
    }
    return new Response("Webhook processed", {
      status: 200
    });
  } catch (err) {
    const errorMessage = typeof err === "object" && err !== null && "message" in err ? err.message : String(err);
    return new Response(`Handler error: ${errorMessage}`, {
      status: 500
    });
  }
});
async function createUsageLimit({ user_id = "", plan_tier = "", sources = [], max_leads = 0, current_leads = 0, export_enabled = false, zapier_export = false, period_start = null, period_end = null }) {
  const { data, error } = await supabase.from("usage_limits").insert({
    plan_tier,
    sources,
    user_id,
    max_leads,
    current_leads,
    export_enabled,
    zapier_export,
    period_start,
    period_end
  }).select().single();
  if (error) {
    console.error("Error creating usage_limits:", error);
    return null;
  }
  return data;
}
async function createSubscription({ user_id = "", plan_tier = "", stripe_price_id = "", stripe_subscription_id = "", period_start = null, period_end = null, usage_limit_id = null }) {
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
const pricingPlans = [
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
