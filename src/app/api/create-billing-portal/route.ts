import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest) {
	try {
		// Get current user
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user's company and subscription
		const { data: userData } = await supabase
			.from("user_profiles")
			.select("company_id")
			.eq("id", user.id)
			.single();

		if (!userData?.company_id) {
			return NextResponse.json(
				{ error: "No company associated with user" },
				{ status: 400 }
			);
		}

		// Get subscription with Stripe customer ID
		const { data: company } = await supabase
			.from("companies")
			.select("stripe_customer_id")
			.eq("id", userData.company_id)
			.not("stripe_customer_id", "is", null)
			.single();

		if (!company?.stripe_customer_id) {
			return NextResponse.json(
				{ error: "No Stripe customer found" },
				{ status: 400 }
			);
		}

		// Create billing portal session
		const portalSession = await stripe.billingPortal.sessions.create({
			customer: company.stripe_customer_id,
			return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
		});

		return NextResponse.json({ url: portalSession.url });
	} catch (error) {
		console.error("Error creating billing portal session:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
