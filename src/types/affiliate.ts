import type { Database } from "../../database.types";

export type AffiliateReferral = Database["public"]["Tables"]["affiliate_referrals"]["Row"];

export interface CreateAffiliateInput {
    user_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

export interface AffiliateStats {
    total_referrals: number;
    successful_conversions: number;
    total_commission_cents: number;
    pending_commission_cents: number;
}

