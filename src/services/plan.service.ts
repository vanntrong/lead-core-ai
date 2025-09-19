import { ONE_HOUR } from "@/constants";
import { createClient } from "../lib/supabase-old";
import type {
	Plan,
	PlanFeature,
	PlanFeatureMapping,
} from "../stores/plan-store";
import { usePlanStore } from "../stores/plan-store";

export class PlanService {
	private initializationPromise: Promise<void> | null = null;

	/**
	 * Fetch all active plans from Supabase
	 */
	async getPlans(): Promise<Plan[]> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("plans")
			.select("*")
			.eq("is_active", true)
			.order("price_monthly", { ascending: true });

		if (error) {
			throw new Error(`Failed to fetch plans: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Fetch all active plan features from Supabase
	 */
	async getPlanFeatures(): Promise<PlanFeature[]> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("plan_features")
			.select("*")
			.eq("is_active", true)
			.order("category", { ascending: true });

		if (error) {
			throw new Error(`Failed to fetch plan features: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Fetch all plan feature mappings from Supabase
	 */
	async getPlanFeatureMappings(): Promise<PlanFeatureMapping[]> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("plan_feature_mappings")
			.select("*");

		if (error) {
			throw new Error(
				`Failed to fetch plan feature mappings: ${error.message}`
			);
		}

		return data || [];
	}

	/**
	 * Fetch plan with its features
	 */
	async getPlanWithFeatures(planId: string) {
		const supabase = createClient();
		const { data: plan, error: planError } = await supabase
			.from("plans")
			.select(`
        *,
        plan_feature_mappings (
          is_included,
          limit_value,
          plan_features (
            id,
            name,
            description,
            category,
            is_active
          )
        )
      `)
			.eq("id", planId)
			.eq("is_active", true)
			.single();

		if (planError) {
			throw new Error(
				`Failed to fetch plan with features: ${planError.message}`
			);
		}

		return plan;
	}

	/**
	 * Get plan by tier
	 */
	async getPlanByTier(
		tier: "basic" | "pro" | "white_label"
	): Promise<Plan | null> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("plans")
			.select("*")
			.eq("tier", tier)
			.eq("is_active", true)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return null;
			}
			throw new Error(`Failed to fetch plan by tier: ${error.message}`);
		}

		return data;
	}

	/**
	 * Check if a plan includes a specific feature
	 */
	async isPlanFeatureIncluded(
		planId: string,
		featureName: string
	): Promise<boolean> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("plan_feature_mappings")
			.select(`
        is_included,
        plan_features!inner (
          name
        )
      `)
			.eq("plan_id", planId)
			.eq("plan_features.name", featureName)
			.eq("is_included", true)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned - feature not included
				return false;
			}
			throw new Error(`Failed to check plan feature: ${error.message}`);
		}

		return data?.is_included ?? false;
	}

	/**
	 * Get feature limit for a plan
	 */
	async getFeatureLimit(
		planId: string,
		featureName: string
	): Promise<number | null> {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("plan_feature_mappings")
			.select(`
        limit_value,
        plan_features!inner (
          name
        )
      `)
			.eq("plan_id", planId)
			.eq("plan_features.name", featureName)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return null;
			}
			throw new Error(`Failed to get feature limit: ${error.message}`);
		}

		return data?.limit_value ?? null;
	}

	/**
	 * Load all plan data into the store
	 */
	async loadPlansIntoStore(): Promise<void> {
		const store = usePlanStore.getState();

		try {
			store.setLoading(true);
			store.setError(null);

			// Fetch all data in parallel
			const [plans, features, mappings] = await Promise.all([
				this.getPlans(),
				this.getPlanFeatures(),
				this.getPlanFeatureMappings(),
			]);

			// Update store
			store.setPlans(plans);
			store.setFeatures(features);
			store.setFeatureMappings(mappings);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to load plans";
			store.setError(errorMessage);
			throw error;
		} finally {
			store.setLoading(false);
		}
	}

	/**
	 * Refresh plan data (used by store)
	 */
	async refreshPlansData(): Promise<void> {
		await this.loadPlansIntoStore();
	}

	/**
	 * Get plans formatted for Stripe integration
	 */
	async getStripeFormattedPlans() {
		const plans = await this.getPlans();

		return plans.reduce(
			(acc, plan) => {
				acc[plan.tier] = {
					id: plan.id,
					name: plan.name,
					tier: plan.tier,
					price: plan.price_monthly,
					priceId: plan.stripe_price_id,
					maxVehicles: plan.max_vehicles,
					maxDrivers: plan.max_drivers,
					maxLoadsPerMonth: plan.max_loads_per_month,
					features: plan.features as Record<string, any>,
				};

				return acc;
			},
			{} as Record<string, any>
		);
	}

	/**
	 * Initialize plans on app startup (prevents multiple simultaneous calls)
	 */
	initializePlans(): Promise<void> {
		// If initialization is already in progress, return the same promise
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		const store = usePlanStore.getState();

		// Check if data is already loaded and fresh (less than 1 hour old)
		const isDataFresh =
			store.lastUpdated &&
			Date.now() - new Date(store.lastUpdated).getTime() < ONE_HOUR;

		if (store.plans.length > 0 && isDataFresh) {
			// Data is already loaded and fresh
			return Promise.resolve();
		}

		// Create initialization promise
		this.initializationPromise = this.loadPlansIntoStore().finally(() => {
			// Clear the promise when done (success or failure)
			this.initializationPromise = null;
		});

		return this.initializationPromise;
	}
}

export const planService = new PlanService();
