import { createClient } from "@/lib/supabase/server";
import type { AffiliateReferral } from "@/types/affiliate";

export class AffiliateService {
    private async getSupabaseClient() {
        return await createClient();
    }

    /**
     * Get affiliate data for a user
     */
    async getAffiliateData(userId: string): Promise<AffiliateReferral | null> {
        const supabase = await this.getSupabaseClient();

        const { data, error } = await supabase
            .from("affiliate_referrals")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // No rows returned
                return null;
            }
            throw error;
        }

        return data;
    }

    /**
     * Get all affiliate referrals (for admin or stats)
     */
    async getAllAffiliateReferrals(): Promise<AffiliateReferral[]> {
        const supabase = await this.getSupabaseClient();

        const { data, error } = await supabase
            .from("affiliate_referrals")
            .select("*")
            .order("joined_at", { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    }
}

export const affiliateService = new AffiliateService();

