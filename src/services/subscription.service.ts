import { createClient } from "@/lib/supabase/server";
import type {
	Subscription,
	SubscriptionInsert,
	SubscriptionUpdate,
} from "@/types/subscription";
import { stripeService } from "./stripe.service";

export class SubscriptionService {
	private async getSupabaseClient() {
		return await createClient();
	}
	/**
	 * Get all subscriptions for a user
	 */
	async getUserSubscriptions(): Promise<Subscription[]> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("subscriptions")
			.select("*")
			.order("created_at", { ascending: false });
		if (error) { throw error; }
		return (data as Subscription[]) || [];
	}

	/**
	 * Get active subscription for a user
	 */
	async getUserActiveSubscription(): Promise<Subscription | null> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("subscriptions")
			.select("*, usage_limits(*)")
			.eq("subscription_status", "active")
			.single();
		if (error) { return null; }
		return data || null;
	}

	/**
	 * Create a new subscription
	 */
	async createSubscription(sub: SubscriptionInsert): Promise<string | null> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("subscriptions")
			.insert([sub])
			.select("id")
			.single();
		if (error) { throw error; }
		return data?.id || null;
	}

	/**
	 * Update subscription status
	 */
	async updateSubscriptionStatus(
		id: string,
		sub: SubscriptionUpdate
	): Promise<boolean> {
		const supabase = await this.getSupabaseClient();
		const { error } = await supabase
			.from("subscriptions")
			.update(sub)
			.eq("id", id);
		return !error;
	}

	/**
	 * Cancel a subscription
	 */
	async cancelSubscription(): Promise<boolean> {
		const supabase = await this.getSupabaseClient();
		const currentSub = await this.getUserActiveSubscription();
		if (!currentSub?.stripe_subscription_id) {
			throw new Error("No active subscription found");
		}
		await stripeService.cancelSubscription(currentSub?.stripe_subscription_id);
		const { error } = await supabase
			.from("subscriptions")
			.update({ subscription_status: "canceled" })
			.eq("id", currentSub?.id);
		return !error;
	}

	/**
	 * Delete a subscription
	 */
	async deleteSubscription(id: string): Promise<boolean> {
		const supabase = await this.getSupabaseClient();
		const { error } = await supabase
			.from("subscriptions")
			.delete()
			.eq("id", id);
		return !error;
	}
}

export const subscriptionService = new SubscriptionService();
