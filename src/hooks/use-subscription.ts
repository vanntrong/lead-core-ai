
import { TWO_MINUTES } from "@/constants";
import { cancelSubscriptionAction, getActiveSubscriptionAction, getSubscriptionsAction } from "@/lib/actions/subscription.actions";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to get user's active subscription
 */
export function useUserSubscription() {
	return useQuery({
		queryKey: ["subscription", "user"],
		queryFn: () => {
			return getSubscriptionsAction();
		},
		staleTime: TWO_MINUTES,
		placeholderData: keepPreviousData,
	});
}

export function useUserActiveSubscription() {
	return useQuery({
		queryKey: ["subscription", "user", "active"],
		queryFn: () => {
			return getActiveSubscriptionAction();
		},
		staleTime: TWO_MINUTES,
		placeholderData: keepPreviousData,
	});
}


/**
 * Hook to cancel user's active subscription
 */

export function useCancelSubscription() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return await cancelSubscriptionAction();
		},
		onSuccess: () => {
			// Invalidate and reset active subscription query
			queryClient.invalidateQueries({ queryKey: ["subscription", "user", "active"] });
			queryClient.resetQueries({ queryKey: ["subscription", "user", "active"] });
		},
		onError: (error) => {
			console.error("Failed to cancel subscription:", error);
		},
	});
}

