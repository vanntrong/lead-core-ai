import type { Database } from "../../database.types2";

// Use Supabase generated types
export type Tables = Database["public"]["Tables"];
export type Views = Database["public"]["Views"];
export type Subscription = Tables["subscriptions"]["Row"];

/**
 * Get the current user's company and subscription (SERVER-SIDE ONLY)
 * For client-side usage, use the client-side supabase client directly
 * This function is commented out to avoid next/headers issues in client components
 */
/*

/**
 * Check if subscription is active (trialing or active)
 */
export function isSubscriptionActive(
	subscription: Subscription | null
): boolean {
	if (!subscription) {
		return false;
	}

	if (subscription.status === "active") {
		return true;
	}

	return false;
}

/**
 * Format price in dollars
 */
export function formatPrice(priceInCents: number): string {
	return `$${(priceInCents / 100).toFixed(0)}`;
}

/**
 * Get plan tier from plan name
 */
export function getPlanTier(planName: string): string {
	const lowerName = planName.toLowerCase();
	if (lowerName.includes("basic")) {
		return "basic";
	}
	if (lowerName.includes("pro")) {
		return "pro";
	}
	if (lowerName.includes("unlimited")) {
		return "unlimited";
	}
	return "basic";
}
