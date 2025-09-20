
import { subscriptionService } from "@/services/subscription.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to get user's active subscription
 */
export function useUserSubscription(userId?: string) {
	return useQuery({
		queryKey: ["subscription", "user", userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID is required");
			return subscriptionService.getActiveSubscription(userId);
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

