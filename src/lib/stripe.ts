import Stripe from "stripe";

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
