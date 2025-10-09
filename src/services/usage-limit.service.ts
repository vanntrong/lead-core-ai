import { createClient } from "@/lib/supabase/server";
import { subscriptionService } from "./subscription.service";
import type { UsageLimit } from "@/types/usage_limit";

export class UsageLimitService {
	private async getSupabaseClient() {
		return await createClient();
	}

	/**
	 * Get all usage limits
	 */
	async increCurrentLeads(): Promise<UsageLimit> {
		const supabase = await this.getSupabaseClient();
		const activeSub = await subscriptionService.getUserActiveSubscription();
		if (!activeSub?.usage_limits) {
			throw new Error("No active subscription or usage limits found");
		}
		const usageLimitId = activeSub.usage_limit_id;
		const usageLimits = activeSub.usage_limits;
		const currentLeads = usageLimits.current_leads ?? 0;
		const maxLeads = usageLimits.max_leads ?? null;
		if (maxLeads !== null && currentLeads >= maxLeads) {
			throw new Error("Lead quota reached for this plan tier.");
		}
		const { data, error } = await supabase
			.from("usage_limits")
			.update({ current_leads: currentLeads + 1 })
			.eq("id", usageLimitId)
			.select("*")
			.maybeSingle();
		if (error) { throw error; }
		if (!data) {
			throw new Error(
				"No usage limit row was updated. Check if the id exists and matches a row."
			);
		}
		return data as UsageLimit;
	}
}
export const usageLimitService = new UsageLimitService();
