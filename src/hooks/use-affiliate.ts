"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    createAffiliateAccountAction,
    getAffiliateDataAction,
} from "@/lib/actions/affiliate.actions";
import type { CreateAffiliateInput } from "@/types/affiliate";

// Query keys
export const affiliateKeys = {
    all: ["affiliate"] as const,
    detail: (userId: string) => [...affiliateKeys.all, userId] as const,
};

/**
 * Hook to get affiliate data for a user
 */
export function useAffiliate(userId: string) {
    return useQuery({
        queryKey: affiliateKeys.detail(userId),
        queryFn: () => getAffiliateDataAction(userId),
        enabled: !!userId,
    });
}

/**
 * Hook to create affiliate account and get referral link
 */
export function useCreateAffiliate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateAffiliateInput) =>
            createAffiliateAccountAction(input),
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Affiliate account created! Here's your referral link.");
                queryClient.invalidateQueries({ queryKey: affiliateKeys.all });
            } else {
                toast.error(result.error || "Failed to create affiliate account");
            }
        },
        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to create affiliate account",
            );
        },
    });
}

