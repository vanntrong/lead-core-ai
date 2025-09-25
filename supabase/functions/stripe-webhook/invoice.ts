import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from 'https://esm.sh/stripe@14?target=denonext';
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));
import { pricingPlans } from "./utils.js";
export async function handleInvoicePaymentSucceeded({ invoice }) {
  try {
    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    if (!subscription) {
      console.error("InvoicePaymentSucceeded: subscription not found", invoice.id);
      return new Response("Subscription not found", {
        status: 200
      });
    }
    const userId = subscription.metadata?.user_id;
    const priceId = subscription.items?.data[0]?.price?.id;
    const plan = pricingPlans.find((p) => p.priceId === priceId);
    if (!userId || !plan) {
      console.error("InvoicePaymentSucceeded: missing userId or plan", invoice.id);
      return new Response("Invalid subscription metadata", {
        status: 200
      });
    }
    // Insert invoice into invoices table
    const { error } = await supabase.from("invoices").insert({
      id: invoice.id,
      user_id: userId,
      customer_id: invoice.customer,
      subscription_id: invoice.subscription,
      payment_intent_id: invoice.payment_intent,
      charge_id: invoice.charge,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      billing_reason: invoice.billing_reason,
      period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      created_at: invoice.created ? new Date(invoice.created * 1000).toISOString() : new Date().toISOString(),
      plan_tier: plan.tier
    });
    if (error) {
      console.error("InvoicePaymentSucceeded DB error:", invoice.id, error);
      return new Response("DB error", {
        status: 200
      });
    }
    return new Response("Webhook processed", {
      status: 200
    });
  } catch (err) {
    console.error("handleInvoicePaymentSucceeded error:", invoice.id, err);
    return new Response("Webhook error", {
      status: 200
    });
  }
}
