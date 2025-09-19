import { type NextRequest, NextResponse } from "next/server";
import { getStripePlans, stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	try {
		const { planId } = await req.json();

		// Load dynamic plans from database
		const stripePlans = await getStripePlans();

		if (!(planId && stripePlans[planId as keyof typeof stripePlans])) {
			return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
		}

		// Get current user
		const supabase = await createClient();
		const adminSupabase = createAdminClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user's company and profile
		const { data: userData } = await supabase
			.from("users_view")
			.select("company_id, email, first_name, last_name")
			.eq("id", user.id)
			.single();

		if (!userData?.company_id) {
			return NextResponse.json(
				{ error: "No company associated with user" },
				{ status: 400 }
			);
		}

		// Get company info
		const { data: company } = await supabase
			.from("companies")
			.select("id, name, email, stripe_customer_id")
			.eq("id", userData.company_id)
			.single();

		if (!company) {
			return NextResponse.json({ error: "Company not found" }, { status: 400 });
		}

		// Check if company already has an active subscription
		const { data: existingSubscription } = await supabase
			.from("subscriptions")
			.select("*")
			.eq("company_id", company.id)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (["trialing", "active"].includes(existingSubscription?.status)) {
			return NextResponse.json(
				{ error: "Company already has an active subscription" },
				{ status: 400 }
			);
		}

		// Get plan from database
		const { data: plan } = await supabase
			.from("plans")
			.select("*")
			.eq("tier", planId)
			.single();

		if (!plan) {
			return NextResponse.json(
				{ error: "Plan not found in database" },
				{ status: 400 }
			);
		}

		const planConfig = stripePlans[planId as keyof typeof stripePlans];

		// Create or get Stripe customer
		let customerId: string;

		if (company.stripe_customer_id) {
			customerId = company.stripe_customer_id;
		} else {
			// Create new Stripe customer
			const customer = await stripe.customers.create({
				email: userData.email,
				name: `${userData.first_name} ${userData.last_name}`,
				metadata: {
					company_id: company.id,
					company_name: company.name,
					user_id: user.id,
				},
			});

			await adminSupabase
				.from("companies")
				.update({ stripe_customer_id: customer.id })
				.eq("id", company.id);

			customerId = customer.id;
		}

		// Create Stripe checkout session with trial if user haven't trial before
		const isTrialedBefore = !!existingSubscription;

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			payment_method_types: ["card"],
			line_items: [
				{
					price: planConfig.priceId,
					quantity: 1,
				},
			],
			mode: "subscription",
			subscription_data: {
				...(isTrialedBefore ? {} : { trial_period_days: 7 }),
				metadata: {
					company_id: company.id,
					plan_id: plan.id,
					user_id: user.id,
				},
			},
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
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
