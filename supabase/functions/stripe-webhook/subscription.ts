// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const stripeKey = Deno.env.get("STRIPE_API_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
import { pricingPlans } from "./utils.ts";
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
        csv_export: plan.limits.csv_export,
        sheets_export: plan.limits.sheets_export,
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
    const upgrade = meta.upgrade === "true";
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

    // Get existing active subscription
    const { data: subscriptionExisting } = await supabase.from("subscriptions").select().eq("user_id", userId).eq("subscription_status", "active").maybeSingle();

    // Create usage_limit record
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
      csv_export: plan.limits.csv_export,
      sheets_export: plan.limits.sheets_export,
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
    if (subscriptionExisting) {
      // Cancel existing subscription in Stripe first
      if (subscriptionExisting.stripe_subscription_id) {
        try {
          const stripe = Stripe(stripeKey);
          await stripe.subscriptions.cancel(subscriptionExisting.stripe_subscription_id);
          console.log("Canceled Stripe subscription:", subscriptionExisting.stripe_subscription_id);
        } catch (stripeError) {
          console.error("Failed to cancel Stripe subscription:", subscriptionExisting.stripe_subscription_id, stripeError);
        }
      }

      // Update subscription status in database
      const { error } = await supabase.from("subscriptions").update({
        subscription_status: "canceled",
        updated_at: new Date().toISOString()
      }).eq("id", subscriptionExisting.id);
      if (error) {
        console.error("Failed to cancel existing subscription:", subscriptionExisting.id, error);
      }
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
async function createUsageLimit({ user_id = "", plan_tier = "", sources = [], max_leads = 0, current_leads = 0, csv_export = false, sheets_export = false, zapier_export = false, period_start = null, period_end = null }) {
  const { data, error } = await supabase.from("usage_limits").insert({
    plan_tier,
    sources,
    user_id,
    max_leads,
    current_leads,
    csv_export,
    sheets_export,
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
export async function handleCheckoutSessionCompleted({ session }) {
  try {
    const mode = session.mode; // "subscription" hoặc "payment"
    const meta = session.metadata || {};
    const userId = meta.user_id;
    const source = meta.source;
    const priceId = session.line_items?.[0]?.price?.id || session.metadata?.plan_id;

    if (!userId) {
      console.error("Missing user_id in session metadata");
      return new Response("Missing user_id", { status: 200 });
    }
    if (!priceId) {
      console.error("Missing priceId");
      return new Response("Missing priceId", { status: 200 });
    }
    const plan = pricingPlans.find((p) => p.priceId === priceId);
    if (!plan) {
      console.error("Invalid priceId", priceId);
      return new Response("Invalid priceId", { status: 200 });
    }

    // Nếu là subscription, tạo như cũ
    if (mode === "subscription" && session.subscription) {
      return await handleSubscriptionCreated({ subscription: session.subscription });
    }

    // Nếu là trial (one-time payment)
    if (mode === "payment") {
      // Kiểm tra đã có trial chưa
      const { data: trialExisting } = await supabase
        .from("subscriptions")
        .select()
        .eq("user_id", userId)
        .eq("plan_tier", plan.tier)
        .eq("subscription_status", "active")
        .maybeSingle();
      if (trialExisting) {
        console.warn(`User ${userId} already has active trial for plan ${plan.tier}`);
        return new Response("Already trialed", { status: 200 });
      }
      // Tạo usage_limit cho trial
      const usageLimit = await createUsageLimit({
        user_id: userId,
        plan_tier: plan.tier,
        sources: plan.limits.sources === "unlimited"
          ? ["etsy", "woocommerce", "shopify", "g2"]
          : source ? [source] : [],
        max_leads: plan.limits.leads_per_month === "unlimited"
          ? 9999999
          : Number(plan.limits.leads_per_month),
        current_leads: 0,
        csv_export: plan.limits.csv_export,
        sheets_export: plan.limits.sheets_export,
        zapier_export: plan.limits.zapier_export,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString()
      });
      if (!usageLimit) throw new Error(`Create usage_limits for trial error`);
      // Insert trial record
      const subResult = await createSubscription({
        user_id: userId,
        usage_limit_id: usageLimit?.id ?? null,
        stripe_subscription_id: null,
        plan_tier: plan.tier,
        stripe_price_id: priceId,
        subscription_status: "active",
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString()
      });
      if (subResult.error) {
        console.error("DB error:", subResult.error);
        return new Response("DB insert error", { status: 200 });
      }
      return new Response("Trial processed", { status: 200 });
    }

    return new Response("Session processed", { status: 200 });
  } catch (err) {
    console.error("handleCheckoutSessionCompleted error:", err);
    return new Response("Webhook error", { status: 200 });
  }
}
