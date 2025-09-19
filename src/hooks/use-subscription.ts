
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription.service";
import { pricingService } from "@/services/pricing.service";

/**
 * Hook to get user's active subscription
 */
export function useUserSubscription(userId?: string) {
	return useQuery({
		queryKey: ["subscription", "user", userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return subscriptionService.getUserActiveSubscription(userId);
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to check if user's subscription is active
 */
export function useIsSubscriptionActive(userId?: string) {
	return useQuery({
		queryKey: ["subscription", "active", userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return subscriptionService.isSubscriptionActive(userId);
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to get all available pricing plans
 */
export function usePricingPlans() {
	return useQuery({
		queryKey: ["pricing", "plans"],
		queryFn: () => pricingService.getPricingPlans(),
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Hook to get user's subscription limits
 */
export function useUserSubscriptionLimits(userId?: string) {
	return useQuery({
		queryKey: ["subscription", "limits", userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return pricingService.getUserSubscriptionLimits(userId);
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to create a trial subscription
 */
export function useCreateTrialSubscription() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userId,
			pricingPlanId,
			trialDays = 14,
		}: {
			userId: string;
			pricingPlanId: string;
			trialDays?: number;
		}) =>
			subscriptionService.createTrialSubscription(userId, pricingPlanId, trialDays),
		onSuccess: (data, variables) => {
			// Invalidate subscription queries for this user
			queryClient.invalidateQueries({
				queryKey: ["subscription", "user", variables.userId],
			});
			queryClient.invalidateQueries({
				queryKey: ["subscription", "active", variables.userId],
			});
			queryClient.invalidateQueries({
				queryKey: ["subscription", "limits", variables.userId],
			});
		},
	});
}

// Legacy hook for backwards compatibility
export const useCurrentSubscription = () => {
	return useQuery({
		queryKey: ["subscription", "user", "current"],
		queryFn: () => {
			// This is a legacy method - you should migrate to useUserSubscription
			console.warn("useCurrentSubscription is deprecated, use useUserSubscription instead");
			return null;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

