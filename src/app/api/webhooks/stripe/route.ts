/** biome-ignore-all lint/suspicious/noExplicitAny: any ok */

import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
	const body = await req.text();
	const headersList = await headers();
	const signature = headersList.get("stripe-signature")!;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err: any) {
		if ("message" in err) {
			console.error("Webhook signature verification failed:", err.message);
		}
		return NextResponse.json(
			{ error: "Webhook signature verification failed" },
			{ status: 400 }
		);
	}

	const supabase = createAdminClient();

	try {
		switch (event.type) {
			// case "checkout.session.completed": {
			// 	const session = event.data.object as Stripe.Checkout.Session;
			// 	await handleCheckoutCompleted(session, supabase);
			// 	break;
			// }

			// case "customer.subscription.created": {
			// 	const subscription = event.data.object as Stripe.Subscription;
			// 	await handleSubscriptionCreated(subscription, supabase);
			// 	break;
			// }

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionUpdated(subscription, supabase);
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				await handleSubscriptionDeleted(subscription, supabase);
				break;
			}

			case "invoice.payment_succeeded": {
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaymentSucceeded(invoice, supabase);
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				await handleInvoicePaymentFailed(invoice, supabase);
				break;
			}

			default:
			// console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Error handling webhook:", error);
		return NextResponse.json(
			{ error: "Webhook handler failed" },
			{ status: 500 }
		);
	}
}

async function _handleCheckoutCompleted(
	session: Stripe.Checkout.Session,
	supabase: any
) {
	console.log("Checkout completed:", session.id);

	if (session.mode === "subscription" && session.subscription) {
		const subscription = await stripe.subscriptions.retrieve(
			session.subscription as string
		);
		await handleSubscriptionCreated(subscription, supabase);
	}
}

async function handleSubscriptionCreated(
	subscription: Stripe.Subscription,
	supabase: any
) {
	console.log("Subscription created:", subscription.id);

	const companyId = subscription.metadata.company_id;
	const planId = subscription.metadata.plan_id;

	if (!(companyId && planId)) {
		console.error("Missing metadata in subscription:", subscription.id);
		return;
	}

	// Calculate trial dates
	const trialStart = subscription.trial_start
		? new Date(subscription.trial_start * 1000).toISOString()
		: null;
	const trialEnd = subscription.trial_end
		? new Date(subscription.trial_end * 1000).toISOString()
		: null;

	// Create subscription record
	const { error } = await supabase.from("subscriptions").insert({
		company_id: companyId,
		plan_id: planId,
		stripe_customer_id: subscription.customer as string,
		stripe_subscription_id: subscription.id,
		stripe_price_id: subscription.items.data[0]?.price.id,
		status: subscription.status,
		trial_start: trialStart,
		trial_end: trialEnd,
		current_period_start: new Date(
			(subscription as any).current_period_start * 1000
		).toISOString(),
		current_period_end: new Date(
			(subscription as any).current_period_end * 1000
		).toISOString(),
		cancel_at_period_end: (subscription as any).cancel_at_period_end,
		canceled_at: (subscription as any).canceled_at
			? new Date((subscription as any).canceled_at * 1000).toISOString()
			: null,
	});

	if (error) {
		console.error("Error creating subscription:", error);
		throw error;
	}
}

async function handleSubscriptionUpdated(
	subscription: Stripe.Subscription,
	supabase: any
) {
	console.log("Subscription updated:", subscription.id);

	const { error } = await supabase
		.from("subscriptions")
		.update({
			status: subscription.status,
			current_period_start: new Date(
				(subscription as any).current_period_start * 1000
			).toISOString(),
			current_period_end: new Date(
				(subscription as any).current_period_end * 1000
			).toISOString(),
			cancel_at_period_end: (subscription as any).cancel_at_period_end,
			canceled_at: (subscription as any).canceled_at
				? new Date((subscription as any).canceled_at * 1000).toISOString()
				: null,
			updated_at: new Date().toISOString(),
		})
		.eq("stripe_subscription_id", subscription.id);

	if (error) {
		console.error("Error updating subscription:", error);
		throw error;
	}
}

async function handleSubscriptionDeleted(
	subscription: Stripe.Subscription,
	supabase: any
) {
	const { error } = await supabase
		.from("subscriptions")
		.update({
			status: "canceled",
			canceled_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.eq("stripe_subscription_id", subscription.id);

	if (error) {
		console.error("Error deleting subscription:", error);
		throw error;
	}
	console.log("Subscription deleted:", subscription.id);
}

async function handleInvoicePaymentSucceeded(
	invoice: Stripe.Invoice,
	supabase: any
) {
	console.log("Invoice payment succeeded:", invoice.id);

	if (!(invoice as any).subscription) {
		return;
	}

	// Get subscription
	const { data: subscription } = await supabase
		.from("subscriptions")
		.select("id")
		.eq("stripe_subscription_id", (invoice as any).subscription)
		.single();

	if (!subscription) {
		console.error("Subscription not found for invoice:", invoice.id);
		return;
	}

	// Create billing history record
	const { error } = await supabase.from("billing_history").insert({
		subscription_id: subscription.id,
		stripe_invoice_id: invoice.id,
		stripe_payment_intent_id: (invoice as any).payment_intent as string,
		amount_due: invoice.amount_due,
		amount_paid: invoice.amount_paid,
		currency: invoice.currency,
		status: invoice.status,
		invoice_date: new Date(invoice.created * 1000).toISOString(),
		due_date: invoice.due_date
			? new Date(invoice.due_date * 1000).toISOString()
			: null,
		paid_at: new Date().toISOString(),
		line_items: invoice.lines.data.map((item) => ({
			description: item.description,
			amount: item.amount,
			currency: item.currency,
			period_start: item.period?.start
				? new Date(item.period.start * 1000).toISOString()
				: null,
			period_end: item.period?.end
				? new Date(item.period.end * 1000).toISOString()
				: null,
		})),
	});

	if (error) {
		console.error("Error creating billing history:", error);
		throw error;
	}
}

async function handleInvoicePaymentFailed(
	invoice: Stripe.Invoice,
	supabase: any
) {
	console.log("Invoice payment failed:", invoice.id);

	if (!(invoice as any).subscription) {
		return;
	}

	// Update subscription status
	const { error } = await supabase
		.from("subscriptions")
		.update({
			status: "past_due",
			updated_at: new Date().toISOString(),
		})
		.eq("stripe_subscription_id", (invoice as any).subscription);

	if (error) {
		console.error("Error updating subscription status:", error);
		throw error;
	}
}
