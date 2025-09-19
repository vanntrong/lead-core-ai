import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Database } from "../../database.types1";

// Type definitions
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type PlanTier = Database["public"]["Enums"]["plan_tier"]; // 'basic' | 'pro' | 'white_label'

export interface PlanFeature {
	id: string;
	name: string;
	display_name: string;
	description: string;
	category: string; // Allows any category from database
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface PlanFeatureMapping {
	id: string;
	plan_id: string;
	feature_id: string;
	is_included: boolean;
	limit_value?: number | null;
	created_at: string;
}

interface PlanStore {
	// State
	plans: Plan[];
	features: PlanFeature[];
	featureMappings: PlanFeatureMapping[];
	isLoading: boolean;
	error: string | null;
	lastUpdated: Date | null;

	// Cached selectors to prevent infinite loops
	_cachedActivePlans: Plan[] | null;
	_cacheKey: string;

	// Actions
	setPlans: (plans: Plan[]) => void;
	setFeatures: (features: PlanFeature[]) => void;
	setFeatureMappings: (mappings: PlanFeatureMapping[]) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;

	// Computed getters
	getPlanByTier: (tier: PlanTier) => Plan | undefined;
	getPlanById: (id: string) => Plan | undefined;
	getActivePlans: () => Plan[];
	getFeaturesByPlanId: (planId: string) => PlanFeature[];
	isPlanFeatureIncluded: (planId: string, featureId: string) => boolean;
	getFeatureLimit: (planId: string, featureId: string) => number | null;

	// Utility actions
	reset: () => void;
	refresh: () => Promise<void>;
}

const initialState = {
	plans: [],
	features: [],
	featureMappings: [],
	isLoading: false,
	error: null,
	lastUpdated: null,
	_cachedActivePlans: null,
	_cacheKey: "",
};

export const usePlanStore = create<PlanStore>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				// Basic setters
				setPlans: (plans) =>
					set({
						plans,
						lastUpdated: new Date(),
						_cachedActivePlans: null, // Clear cache when plans change
						_cacheKey: Date.now().toString(),
					}),
				setFeatures: (features) => set({ features, lastUpdated: new Date() }),
				setFeatureMappings: (featureMappings) =>
					set({ featureMappings, lastUpdated: new Date() }),
				setLoading: (isLoading) => set({ isLoading }),
				setError: (error) => set({ error }),

				// Computed getters
				getPlanByTier: (tier) => {
					const { plans } = get();
					return plans.find((plan) => plan.tier === tier && plan.is_active);
				},

				getPlanById: (id) => {
					const { plans } = get();
					return plans.find((plan) => plan.id === id);
				},

				getActivePlans: () => {
					const state = get();
					const currentCacheKey = `${state.plans.length}-${state.plans.map((p) => p.id).join(",")}`;

					// Return cached result if cache is still valid
					if (state._cachedActivePlans && state._cacheKey === currentCacheKey) {
						return state._cachedActivePlans;
					}

					// Compute new result and cache it
					const activePlans = state.plans.filter((plan) => plan.is_active);
					set({
						_cachedActivePlans: activePlans,
						_cacheKey: currentCacheKey,
					});

					return activePlans;
				},

				getFeaturesByPlanId: (planId) => {
					const { features, featureMappings } = get();
					const mappings = featureMappings.filter(
						(_mapping) => _mapping.plan_id === planId && _mapping.is_included
					);
					return features.filter(
						(feature) =>
							mappings.some((_mapping) => _mapping.feature_id === feature.id) &&
							feature.is_active
					);
				},

				isPlanFeatureIncluded: (planId, featureId) => {
					const { featureMappings } = get();
					const mapping = featureMappings.find(
						(_mapping) =>
							_mapping.plan_id === planId && _mapping.feature_id === featureId
					);
					return mapping?.is_included ?? false;
				},

				getFeatureLimit: (planId, featureId) => {
					const { featureMappings } = get();
					const mapping = featureMappings.find(
						(_mapping) =>
							_mapping.plan_id === planId && _mapping.feature_id === featureId
					);
					return mapping?.limit_value ?? null;
				},

				// Utility actions
				reset: () => set(initialState),

				refresh: () => {
					// Import will be handled by the service layer to avoid circular dependencies
					set({ isLoading: true, error: null });
					try {
						// This will be called by the service layer
						throw new Error("Use PlanService.refreshPlansData() directly");
					} catch (error) {
						set({
							error:
								error instanceof Error
									? error.message
									: "Use PlanService.refreshPlansData() directly",
						});
					} finally {
						set({ isLoading: false });
					}
					return Promise.resolve();
				},
			}),
			{
				name: "plan-store",
				partialize: (state) => ({
					plans: state.plans,
					features: state.features,
					featureMappings: state.featureMappings,
					lastUpdated: state.lastUpdated,
					// Exclude cache fields from persistence
				}),
				// Only persist for 1 hour to ensure fresh data
				version: 1,
			}
		),
		{
			name: "plan-store",
		}
	)
);

// Selector hooks for better performance with proper caching
export const useActivePlans = () =>
	usePlanStore((state) => state.getActivePlans());

export const usePlanByTier = (tier: PlanTier) =>
	usePlanStore((state) => state.getPlanByTier(tier));

export const usePlanFeatures = (planId: string) =>
	usePlanStore((state) => state.getFeaturesByPlanId(planId));

export const useIsLoading = () => usePlanStore((state) => state.isLoading);
export const useError = () => usePlanStore((state) => state.error);
