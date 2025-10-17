"use server";

import { revalidatePath } from "next/cache";
import { type RewardfulAffiliate, rewardfulService } from "@/lib/rewardful";
import { createClient } from "@/lib/supabase/server";
import { affiliateService } from "@/services/affiliate.service";
import type { CreateAffiliateInput } from "@/types/affiliate";

/**
 * Get affiliate data for a user
 */
export async function getAffiliateDataAction(userId: string) {
    try {
        return await affiliateService.getAffiliateData(userId);
    } catch (error) {
        console.error("Error in getAffiliateDataAction:", error);
        throw error;
    }
}

/**
 * Create affiliate account and get referral link
 */
export async function createAffiliateAccountAction(input: CreateAffiliateInput) {
    try {
        const supabase = await createClient();

        // Check if user already has an affiliate record
        const { data: existing } = await supabase
            .from("affiliate_referrals")
            .select("*")
            .eq("user_id", input.user_id)
            .single();

        if (existing) {
            // Already has affiliate account
            return { success: true, data: existing };
        }

        // Create affiliate in Rewardful
        if (!rewardfulService.isConfigured()) {
            return {
                success: false,
                error: "Affiliate program is not configured. Please contact support.",
            };
        }

        let rewardfulAffiliate: RewardfulAffiliate | null = null;

        // find existing affiliate in Rewardful by email
        // (in case they signed up for the affiliate program before creating an account)
        // If found, use that affiliate instead of creating a new one
        const existingAffiliate = await rewardfulService.getAffiliateByEmail(
            input.email,
        );

        if (existingAffiliate) {
            rewardfulAffiliate = existingAffiliate;
        } else {
            rewardfulAffiliate = await rewardfulService.createAffiliate({
                email: input.email,
                first_name: input.first_name,
                last_name: input.last_name,
            });
        }

        if (!rewardfulAffiliate) {
            return {
                success: false,
                error:
                    "Failed to create affiliate account in Rewardful. Please try again later.",
            };
        }

        const code = rewardfulAffiliate.links[0].token;

        const link = `${process.env.NEXT_PUBLIC_APP_URL}?via=${code}`;

        // Create affiliate record in our database
        const { data, error } = await supabase
            .from("affiliate_referrals")
            .insert({
                user_id: input.user_id,
                rewardful_affiliate_id: rewardfulAffiliate.id,
                rewardful_link: link,
                is_active: true,
                joined_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        revalidatePath("/dashboard/affiliates");
        return { success: true, data };
    } catch (error) {
        console.error("Error creating affiliate account:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create affiliate account",
        };
    }
}

