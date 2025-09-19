import { loadStripe, type Stripe as StripeJS } from "@stripe/stripe-js";
import Stripe from "stripe";
import { planService } from "../services/plan.service";
import { usePlanStore } from "../stores/plan-store";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is not set");
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
	throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2025-08-27.basil",
	typescript: true,
});

// Client-side Stripe promise
let stripePromise: Promise<StripeJS | null>;
export const getStripe = () => {
	if (!stripePromise) {
		stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
	}
	return stripePromise;
};

// Dynamic plan configurations from Supabase
let cachedPlans: Record<string, any> | null = null;

export const getStripePlans = async () => {
	if (cachedPlans) {
		return cachedPlans;
	}

	try {
		cachedPlans = await planService.getStripeFormattedPlans();
		return cachedPlans;
	} catch (error) {
		console.error(
			"Failed to load plans from database, falling back to defaults:",
			error
		);

		throw error;
	}
};

// Utility function to refresh plan cache
export const refreshPlanCache = () => {
	cachedPlans = null;
};

// Hook to get plans from Zustand store
export const usePlansFromStore = () => {
	const plans = usePlanStore((state) => state.plans);
	const isLoading = usePlanStore((state) => state.isLoading);
	const error = usePlanStore((state) => state.error);

	return { plans, isLoading, error };
};
