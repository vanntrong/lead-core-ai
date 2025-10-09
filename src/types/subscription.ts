import type { Database } from "../../database.types";

export type SubscriptionStatus =
	Database["public"]["Enums"]["subscription_status"];
export type PlanTier = Database["public"]["Enums"]["plan_tier"];

export type SubscriptionRow =
	Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert =
	Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate =
	Database["public"]["Tables"]["subscriptions"]["Update"];

export interface Subscription extends SubscriptionRow {
	// Extend here if you want to add UI-only fields
	usage_limits?: Database["public"]["Tables"]["usage_limits"]["Row"] | null;
}

export interface CreateSubscriptionData
	extends Omit<SubscriptionInsert, "id" | "created_at" | "updated_at"> {}

export interface UpdateSubscriptionData extends Partial<SubscriptionUpdate> {
	id: string;
}

export interface SubscriptionFilters {
	status?: SubscriptionStatus;
	plan_tier?: PlanTier;
	user_id?: string;
	search?: string;
	date_range?: {
		start: string;
		end: string;
	};
	page?: number;
	limit?: number;
}
