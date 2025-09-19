"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { fromSecondsToMilliseconds } from "@/utils/helper";
import type { Database } from "../../../database.types1";
import { createAdminClient } from "../supabase/admin";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];

export interface SessionResult {
	success: boolean;
	subscription?: {
		id: string;
		status: SubscriptionStatus;
		plan_name: string;
		company_name: string;
		trial_end: string | null;
		current_period_end: string | null;
	};
	error?: string;
}

export async function retrieveStripeSession(
	sessionId: string
): Promise<SessionResult> {
	try {
		// Retrieve the session from Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ["subscription", "customer"],
		});

		if (!session) {
			return {
				success: false,
				error: "Session not found",
			};
		}

		// Check if session was successful
		if (
			session.payment_status !== "paid" &&
			session.payment_status !== "no_payment_required"
		) {
			return {
				success: false,
				error: "Payment not completed",
			};
		}

		const supabase = await createClient();
		const adminSupabase = createAdminClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return {
				success: false,
				error: "User not authenticated",
			};
		}

		if (session.mode === "subscription" && session.subscription) {
			const stripeSubscription = await stripe.subscriptions.retrieve(
				(session.subscription as unknown as { id: string }).id as string
			);

			const companyId = stripeSubscription.metadata.company_id;
			const planId = stripeSubscription.metadata.plan_id;

			if (!(companyId && planId)) {
				return {
					success: false,
					error: "Missing subscription metadata",
				};
			}

			const { data: existingSubscription } = await supabase
				.from("subscriptions")
				.select("id")
				.eq("stripe_subscription_id", stripeSubscription.id)
				.single();

			if (!existingSubscription) {
				const trialStart = stripeSubscription.trial_start
					? new Date(
						fromSecondsToMilliseconds(stripeSubscription.trial_start)
					).toISOString()
					: null;
				const trialEnd = stripeSubscription.trial_end
					? new Date(
						fromSecondsToMilliseconds(stripeSubscription.trial_end)
					).toISOString()
					: null;

				const currentPeriodEnd = stripeSubscription.items.data[0]
					?.current_period_end
					? new Date(
						fromSecondsToMilliseconds(
							stripeSubscription.items.data[0]?.current_period_end
						)
					).toISOString()
					: null;

				const { error: insertError } = await adminSupabase
					.from("subscriptions")
					.insert({
						company_id: companyId,
						plan_id: planId,
						stripe_subscription_id: stripeSubscription.id,
						stripe_price_id: stripeSubscription.items.data[0]?.price.id,
						status: stripeSubscription.status as SubscriptionStatus,
						trial_start: trialStart,
						trial_end: trialEnd,
						cancel_at_period_end: stripeSubscription.cancel_at_period_end,
						canceled_at: stripeSubscription.canceled_at
							? new Date(
								fromSecondsToMilliseconds(stripeSubscription.canceled_at)
							).toISOString()
							: null,
						current_period_end: currentPeriodEnd,
					});

				if (insertError) {
					console.log("insertError", insertError);
					return {
						success: false,
						error: "Failed to create subscription record",
					};
				}
			}

			const { data: subscriptionData, error: fetchError } = await adminSupabase
				.from("subscriptions")
				.select(`
          id,
          status,
          trial_end,
          current_period_end,
          companies(name),
          plans(name)
        `)
				.eq("stripe_subscription_id", stripeSubscription.id)
				.single();

			if (fetchError || !subscriptionData) {
				return {
					success: false,
					error: "Failed to fetch subscription details",
				};
			}

			const companyData = subscriptionData.companies as unknown as {
				name: string;
			};
			const planData = subscriptionData.plans as unknown as { name: string };

			return {
				success: true,
				subscription: {
					id: subscriptionData.id,
					status: subscriptionData.status,
					plan_name: planData.name,
					company_name: companyData.name,
					trial_end: subscriptionData.trial_end,
					current_period_end: subscriptionData.current_period_end,
				},
			};
		}

		return {
			success: false,
			error: "Session is not a subscription session",
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: "Error retrieving Stripe session",
		};
	}
}
