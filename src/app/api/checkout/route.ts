import pricingPlans from '@/config/pricing-plans.json';
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { planId, source, referral } = await req.json();

		// Check if planId matches any priceId in pricing-plans.json
		const matchedPlan = pricingPlans.find(plan => plan.priceId === planId);
		if (!matchedPlan) {
			return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
		}

		// Get current user
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if company already has an active subscription
		const { data: existingSubscription } = await supabase
			.from("subscriptions")
			.select("*")
			.eq("user_id", user.id)
			.eq("status", "active")
			.single();

		if (existingSubscription && existingSubscription.plan_tier === matchedPlan.tier) {
			return NextResponse.json(
				{ error: "You are already subscribed to this plan" },
				{ status: 400 }
			);
		}

		const { data: existingCustomer } = await supabase
			.from("stripe_customers")
			.select("*")
			.eq("user_id", user.id)
			.eq("status", "active")
			.single();

		let customerId: string = "";

		if (existingCustomer) {
			customerId = existingCustomer.stripe_customer_id;
		}

		if (!existingCustomer) {
			// Create or get Stripe customer
			const customer = await stripe.customers.create({
				email: user.email,
				name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
				metadata: {
					user_id: user.id,
					referral: referral,
					app: "leadcoreai",
				},
			});
			customerId = customer.id;

			// Insert new Stripe customer into supabase
			await supabase.from("stripe_customers").insert({
				user_id: user.id,
				stripe_customer_id: customer.id,
				status: "active",
			});
		}

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			payment_method_types: ["card"],
			line_items: [
				{
					price: planId,
					quantity: 1,
				},
			],
			mode: "subscription",
			subscription_data: {
				metadata: {
					user_id: user.id,
					source,
					plan_id: planId
				},
			},
			...(referral ? { client_reference_id: referral } : {}),
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?plan=${matchedPlan.tier}`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
