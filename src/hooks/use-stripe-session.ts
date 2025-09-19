import { useMutation } from "@tanstack/react-query";
import {
	retrieveStripeSession,
	type SessionResult,
} from "@/lib/actions/stripe-session";

export function useRetrieveStripeSession() {
	return useMutation<SessionResult, Error, string>({
		mutationFn: async (sessionId: string) => {
			return await retrieveStripeSession(sessionId);
		},
		onSuccess: (result) => {
			if (result.success) {
				console.log("Session retrieved successfully:", result.subscription);
			} else {
				console.error("Session retrieval failed:", result.error);
			}
		},
		onError: (error) => {
			console.error("Error retrieving session:", error);
		},
	});
}
