// LeadCore AI - Supabase Edge Function (Deno)
// Webhook handler: Save Stripe subscription events to subscriptions table
// File: supabase/functions/stripe-webhook.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let event;
  try {
    event = await req.json();
  } catch (err) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const type = event.type;
  const object = event.data?.object;

  if (!type || !object) {
    return new Response("Missing event data", { status: 400 });
  }

  try {
  switch (type) {
      case "customer.subscription.created": {
        const planId = object.metadata?.plan_id;
        if (!planId) {
          return new Response("Missing metadata", { status: 400 });
        }
        // Insert with structure inspired by leadcore_enrich_jobs.sql
        // Insert according to subscriptions table schema
        const { error } = await supabase.from("subscriptions").insert({
          user_id: object.metadata?.user_id,
          plan_tier: object.metadata?.plan_tier,
          price_monthly: object.items?.data[0]?.price?.unit_amount ?? null,
          status: object.status ?? "active",
          leads_per_month: object.metadata?.leads_per_month ? Number(object.metadata.leads_per_month) : null,
          sources: object.metadata?.sources ? JSON.parse(object.metadata.sources) : null,
          features: object.metadata?.features ? JSON.parse(object.metadata.features) : null,
          stripe_price_id: object.items?.data[0]?.price?.id,
          started_at: object.start_date ? new Date(object.start_date * 1000).toISOString() : new Date().toISOString(),
          trial_end: object.trial_end ? new Date(object.trial_end * 1000).toISOString() : null,
          canceled_at: object.canceled_at ? new Date(object.canceled_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        });
        if (error) {
          return new Response(`DB error: ${error.message}`, { status: 500 });
        }
        break;
      }
      case "customer.subscription.updated": {
        // Reset leads_per_month to plan value on renewal
        const leadsLimit = object.metadata?.leads_per_month ? Number(object.metadata.leads_per_month) : null;
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: object.status,
            current_period_start: object.current_period_start
              ? new Date(object.current_period_start * 1000).toISOString()
              : null,
            current_period_end: object.current_period_end
              ? new Date(object.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: object.cancel_at_period_end,
            canceled_at: object.canceled_at
              ? new Date(object.canceled_at * 1000).toISOString()
              : null,
            event_type: type,
            updated_at: new Date().toISOString(),
            leads_per_month: leadsLimit,
          })
          .eq("stripe_subscription_id", object.id);
        if (error) {
          return new Response(`DB error: ${error.message}`, { status: 500 });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            event_type: type,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", object.id);
        if (error) {
          return new Response(`DB error: ${error.message}`, { status: 500 });
        }
        break;
      }
      case "customer.deleted": {
        // Mark all subscriptions for this customer as deleted/canceled
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            event_type: type,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", object.id);
        if (subError) {
          return new Response(`DB error: ${subError.message}`, { status: 500 });
        }

        // Mark stripe_customers as deleted
        const { error: custError } = await supabase
          .from("stripe_customers")
          .update({
            status: "deleted",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", object.id);
        if (custError) {
          return new Response(`DB error: ${custError.message}`, { status: 500 });
        }
        break;
      }
      default:
        // Unhandled event type
        break;
    }
    return new Response("Webhook processed", { status: 200 });
  } catch (err) {
    return new Response(`Handler error: ${err.message}`, { status: 500 });
  }
});
