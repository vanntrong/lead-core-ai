import type { CompanyWithSubscription, Plan, Subscription } from "@/lib/subscription-old";
import { createClient } from "@/lib/supabase-old";

export class SubscriptionService {
	/**
	 * Get the current user's active subscription
	 * Returns the latest active subscription record for the user's company
	 */
	async getCurrentSubscription(): Promise<Subscription | null> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			return null;
		}

		const { data: subscription } = await this.supabase
			.from("subscriptions")
			.select("*")
			.eq("user_id", user.id)
			.eq("status", "active")
			.order("started_at", { ascending: false })
			.limit(1)
			.single();

		return subscription ?? null;
	}

	private readonly supabase = createClient();

	async getCurrentCompanySubscription(): Promise<CompanyWithSubscription | null> {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();

		if (!user) {
			return null;
		}

		const { data: userData } = await this.supabase
			.from("user_profiles")
			.select("company_id")
			.eq("id", user.id)
			.single();

		if (!userData?.company_id) {
			return null;
		}

		const { data: company } = await this.supabase
			.from("companies")
			.select("*")
			.eq("id", userData.company_id)
			.single();

		if (!company) {
			return null;
		}

		const { data: subscription } = await this.supabase
			.from("subscriptions")
			.select("*, plan:plans(*)")
			.eq("company_id", userData.company_id)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		return {
			...company,
			subscription: subscription ? subscription : undefined,
		} as CompanyWithSubscription;
	}

	async getPlans(): Promise<Plan[]> {
		const { data: plans } = await this.supabase
			.from("plans")
			.select("*")
			.eq("is_active", true)
			.order("price_monthly", { ascending: true });

		return plans || [];
	}

	async createCheckoutSession(planId: string) {
		const response = await fetch("/api/checkout", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ planId }),
		});

		if (!response.ok) {
			throw new Error("Failed to create checkout session");
		}

		return response.json();
	}

	async createBillingPortalSession() {
		const response = await fetch("/api/create-billing-portal", {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("Failed to create billing portal session");
		}

		return response.json();
	}
}

export const subscriptionService = new SubscriptionService();
