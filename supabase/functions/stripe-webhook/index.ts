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
import { handleInvoicePaymentSucceeded } from "./invoice.ts";
import { handleSubscriptionCreated, handleSubscriptionUpdated, handleSubscriptionDeleted } from "./subscription.ts";
Deno.serve(async (req)=>{
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
    switch(type){
      case "invoice.payment_succeeded":
        {
          // Stripe Invoice object
          const invoice = object;
          // Fetch subscription from Stripe
          return handleInvoicePaymentSucceeded({
            invoice,
            supabase,
            stripe,
            pricingPlans
          });
        }
      case "customer.subscription.created":
        {
          // Extract all relevant metadata fields from Stripe subscription
          const subscription = object;
          return handleSubscriptionCreated({
            subscription
          });
        }
      case "customer.subscription.updated":
        {
          // Extract all relevant metadata fields from Stripe subscription
          const subscription = object;
          return handleSubscriptionUpdated({
            subscription
          });
        }
      case "customer.subscription.deleted":
        {
          const subscription = object;
          return handleSubscriptionDeleted({
            subscription
          });
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
