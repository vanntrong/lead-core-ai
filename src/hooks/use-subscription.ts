
import { TWO_MINUTES } from "@/constants";
import { getActiveSubscriptionAction, getSubscriptionsAction } from "@/lib/actions/subscription.actions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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

