import { stripe } from "@/lib/stripe";

export class StripeService {
	/**
	 * Cancels a Stripe subscription by ID.
	 * @param subscriptionId - The Stripe subscription ID to cancel.
	 * @returns The canceled subscription object.
	 */
	async cancelSubscription(subscriptionId: string) {
		try {
			const canceled = await stripe.subscriptions.cancel(subscriptionId);
			return canceled;
		} catch (error) {
			throw new Error(
				`Failed to cancel subscription: ${
					(error as Error).message || "Unknown error"
				}`
			);
		}
	}
}

export const stripeService = new StripeService();
