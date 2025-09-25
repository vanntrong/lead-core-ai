import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
import { pricingPlans } from "./utils.js";
export async function handleSubscriptionUpdated({ subscription }) {
  try {
    const meta = subscription.metadata || {};
    const userId = meta.user_id;
    const source = meta.source;
    const priceId = subscription.items?.data[0]?.price?.id;
    if (!priceId) {
      console.error("Missing priceId");
      return new Response("Missing priceId", {
        status: 200
      });
    }
    const plan = pricingPlans.find((p) => p.priceId === priceId);
    if (!plan) {
      console.error("Invalid priceId:", priceId);
      return new Response("Invalid priceId", {
        status: 200
      });
    }
    const { data: subscriptionExisting } = await supabase.from("subscriptions").select().eq("stripe_subscription_id", subscription.id).maybeSingle();
    if (!subscriptionExisting) {
      console.error("Subscription not found:", subscription.id);
      return new Response("Subscription not found", {
        status: 200
      });
    }
    const isNewPeriod = subscription.current_period_start && (!subscriptionExisting.period_start || subscription.current_period_start * 1000 !== new Date(subscriptionExisting.period_start).getTime());
    let usageLimitId = subscriptionExisting.usage_limit_id;
    if (subscription.status === "active" && isNewPeriod) {
      const usageLimit = await createUsageLimit({
        user_id: userId,
        plan_tier: plan.tier,
        sources: plan.limits.sources === "unlimited" ? [
          "etsy",
          "woocommerce",
          "shopify",
          "g2"
        ] : source ? [
          source
        ] : [],
        max_leads: plan.limits.leads_per_month === "unlimited" ? 9999999 : Number(plan.limits.leads_per_month),
        current_leads: 0,
        export_enabled: plan.limits.export_enabled,
        zapier_export: plan.limits.zapier_export,
        period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
        period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
      });
      if (!usageLimit) {
        console.error(`Failed to create usage_limits for sub: ${subscription.id}`);
        return new Response("Usage limit creation error", {
          status: 200
        });
      }
      usageLimitId = usageLimit.id;
    }
    const subscriptionUpdated = await updateSubscription({
      id: subscriptionExisting.id,
      period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      usage_limit_id: usageLimitId,
      subscription_status: subscription.status
    });
    if (!subscriptionUpdated) {
      console.error(`Failed to update subscription: ${subscription.id}`);
      return new Response("Subscription update error", {
        status: 200
      });
    }
    return new Response("Webhook processed", {
      status: 200
    });
  } catch (err) {
    console.error("handleSubscriptionUpdated error:", err);
    // Stripe không cần biết chi tiết → luôn trả 200
    return new Response("Webhook error", {
      status: 200
    });
  }
}
export async function handleSubscriptionCreated({ subscription }) {
  try {
    if (subscription.status !== "active") {
      return new Response("Subscription not active", {
        status: 200
      });
    }
    const meta = subscription.metadata || {};
    const userId = meta.user_id;
    const source = meta.source;
    if (!userId) {
      console.error("Missing user_id in subscription metadata");
      return new Response("Missing user_id", {
        status: 200
      });
    }
    const priceId = subscription.items?.data[0]?.price?.id;
    if (!priceId) {
      console.error("Missing priceId");
      return new Response("Missing priceId", {
        status: 200
      });
    }
    const plan = pricingPlans.find((p) => p.priceId === priceId);
    if (!plan) {
      console.error("Invalid priceId", priceId);
      return new Response("Invalid priceId", {
        status: 200
      });
    }
    // Kiểm tra đã có active subscription chưa
    const { data: subscriptionExisting } = await supabase.from("subscriptions").select().eq("user_id", userId).eq("plan_tier", plan.tier).eq("subscription_status", "active").maybeSingle();
    if (subscriptionExisting) {
      console.warn(`User ${userId} already has active subscription for plan ${plan.tier}`);
      return new Response("Already subscribed", {
        status: 200
      });
    }
    // Tạo usage_limit
    const usageLimit = await createUsageLimit({
      user_id: userId,
      plan_tier: plan.tier,
      sources: plan.limits.sources === "unlimited" ? [
        "etsy",
        "woocommerce",
        "shopify",
        "g2"
      ] : source ? [
        source
      ] : [],
      max_leads: plan.limits.leads_per_month === "unlimited" ? 9999999 : Number(plan.limits.leads_per_month),
      current_leads: 0,
      export_enabled: plan.limits.export_enabled,
      zapier_export: plan.limits.zapier_export,
      period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
    });
    if (!usageLimit) throw new Error(`Create usage_limits for sub: ${subscription.id} error`);
    // Insert subscription record
    const subResult = await createSubscription({
      user_id: userId,
      usage_limit_id: usageLimit?.id ?? null,
      stripe_subscription_id: subscription.id,
      plan_tier: plan.tier,
      stripe_price_id: priceId,
      subscription_status: subscription.status,
      period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : new Date().toISOString(),
      period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null
    });
    if (subResult.error) {
      console.error("DB error:", subResult.error);
      return new Response("DB insert error", {
        status: 200
      });
    }
    return new Response("Webhook processed", {
      status: 200
    });
  } catch (err) {
    console.error("handleSubscriptionCreated error:", err);
    return new Response("Webhook error", {
      status: 200
    });
  }
}
export async function handleSubscriptionDeleted({ subscription }) {
  try {
    const { error } = await supabase.from("subscriptions").update({
      subscription_status: "canceled",
      updated_at: new Date().toISOString()
    }).eq("stripe_subscription_id", subscription.id);
    if (error) {
      console.error("handleSubscriptionDeleted DB error:", subscription.id, error);
      // Stripe không cần retry, log để xử lý sau
      return new Response("DB error", {
        status: 200
      });
    }
    return new Response("Webhook processed", {
      status: 200
    });
  } catch (err) {
    console.error("handleSubscriptionDeleted error:", subscription.id, err);
    return new Response("Webhook error", {
      status: 200
    });
  }
}
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
async function createSubscription({ user_id = "", plan_tier = "", subscription_status, stripe_price_id = "", stripe_subscription_id = "", period_start = null, period_end = null, usage_limit_id = null }) {
  const sub = await supabase.from("subscriptions").insert({
    user_id,
    usage_limit_id,
    plan_tier,
    subscription_status: subscription_status,
    stripe_subscription_id,
    stripe_price_id,
    period_start,
    period_end
  });
  return sub;
}
