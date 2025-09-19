import { supabase } from "@/lib/supabase";
import type { Database } from "../../database.types";
import type { PlanTier, PlanLimits } from "@/types/pricing";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type PricingPlan = Database["public"]["Tables"]["pricing_plans"]["Row"];

export interface UserSubscriptionDetails {
	subscription: Subscription;
	pricing_plan: PricingPlan | null;
	is_active: boolean;
	limits: PlanLimits;
}

export class SubscriptionService {
	/**
	 * Get user's active subscription with full details
	 */
	async getUserActiveSubscription(userId: string): Promise<UserSubscriptionDetails | null> {
		const { data, error } = await supabase
			.rpc('get_user_active_subscription', {
				user_id_param: userId
			});

		if (error) {
			console.error('Error fetching user subscription:', error);
			return null;
		}

		if (!data || data.length === 0) {
			return null;
		}

		const result = data[0];
		return {
			subscription: {
				id: result.subscription_id,
				user_id: userId,
				pricing_plan_id: null, // Will be populated separately if needed
				plan_tier: result.plan_tier as PlanTier,
				price_monthly: result.price_monthly,
				status: result.status as any,
				leads_per_month: null,
				sources: null,
				features: null,
				stripe_subscription_id: null,
				stripe_price_id: null,
				stripe_customer_id: null,
				started_at: '',
				trial_end: result.trial_end,
				current_period_start: null,
				current_period_end: result.current_period_end,
				canceled_at: null,
				metadata: {},
				created_at: '',
				updated_at: ''
			},
			pricing_plan: null, // Plan details are in limits and features
			is_active: ['active', 'trialing'].includes(result.status),
			limits: result.limits as unknown as PlanLimits
		};
	}

	/**
	 * Check if user has an active subscription
	 */
	async isSubscriptionActive(userId: string): Promise<boolean> {
		const { data, error } = await supabase
			.rpc('is_subscription_active', {
				user_id_param: userId
			});

		if (error) {
			console.error('Error checking subscription status:', error);
			return false;
		}

		return data || false;
	}

	/**
	 * Create a new subscription from a pricing plan
	 */
	async createSubscriptionFromPlan(
		userId: string,
		pricingPlanId: string,
		stripeSubscriptionId?: string,
		trialDays?: number
	): Promise<string | null> {
		const { data, error } = await supabase
			.rpc('create_subscription_from_plan', {
				user_id_param: userId,
				pricing_plan_id_param: pricingPlanId,
				stripe_subscription_id_param: stripeSubscriptionId,
				trial_days: trialDays
			});

		if (error) {
			console.error('Error creating subscription:', error);
			throw new Error(`Failed to create subscription: ${error.message}`);
		}

		return data;
	}

	/**
	 * Update subscription status (for Stripe webhooks)
	 */
	async updateSubscriptionStatus(
		stripeSubscriptionId: string,
		status: 'active' | 'canceled' | 'unpaid' | 'trialing' | 'past_due',
		currentPeriodStart?: string,
		currentPeriodEnd?: string
	): Promise<boolean> {
		const { data, error } = await supabase
			.rpc('update_subscription_status', {
				stripe_subscription_id_param: stripeSubscriptionId,
				new_status: status,
				current_period_start_param: currentPeriodStart,
				current_period_end_param: currentPeriodEnd
			});

		if (error) {
			console.error('Error updating subscription status:', error);
			return false;
		}

		return data || false;
	}

	/**
	 * Cancel user's active subscription
	 */
	async cancelSubscription(userId: string): Promise<boolean> {
		const { error } = await supabase
			.from('subscriptions')
			.update({
				status: 'canceled',
				canceled_at: new Date().toISOString()
			})
			.eq('user_id', userId)
			.eq('status', 'active');

		if (error) {
			console.error('Error canceling subscription:', error);
			return false;
		}

		return true;
	}

	/**
	 * Get user's subscription history
	 */
	async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
		const { data, error } = await supabase
			.from('subscriptions')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching subscription history:', error);
			return [];
		}

		return data || [];
	}

	/**
	 * Create a trial subscription
	 */
	async createTrialSubscription(
		userId: string,
		pricingPlanId: string,
		trialDays: number = 14
	): Promise<string | null> {
		return this.createSubscriptionFromPlan(userId, pricingPlanId, undefined, trialDays);
	}
}

export const subscriptionService = new SubscriptionService();
