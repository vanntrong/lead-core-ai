import { deleteLeadAdminAction, flagLeadAdminAction, getLeadsPaginatedAction, updateLeadAdminAction } from "@/lib/actions/lead-admin.actions";
import type { Lead, LeadFilters } from "@/types/lead";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for React Query
export const leadAdminKeys = {
  all: ["leadAdmin"] as const,
  lists: () => [...leadAdminKeys.all, "list"] as const,
  list: (filters?: any) => [...leadAdminKeys.lists(), filters] as const,
  details: () => [...leadAdminKeys.all, "detail"] as const,
  detail: (id: string) => [...leadAdminKeys.details(), id] as const,
};

const TWO_MINUTES = 2 * 60 * 1000;

export function useLeadsPaginatedAdmin(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadAdminKeys.list(filters),
    queryFn: () => getLeadsPaginatedAction(filters),
    placeholderData: keepPreviousData,
    staleTime: TWO_MINUTES,
  });
}

export function useUpdateLeadAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lead> & { id: string }) => updateLeadAdminAction(data),
    onSuccess: (updatedLead: Lead) => {
      queryClient.invalidateQueries({ queryKey: leadAdminKeys.lists() });
      queryClient.setQueryData(leadAdminKeys.detail(updatedLead.id), updatedLead);
    },
    onError: (error) => {
      console.error("Failed to update lead (admin):", error);
    },
  });
}

export function useFlagLeadAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flagLeadAdminAction(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: leadAdminKeys.lists() });
      }
    },
    onError: (error) => {
      console.error("Failed to flag lead (admin):", error);
    },
  });
}

export function useDeleteLeadAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLeadAdminAction(id),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch lead lists
        queryClient.invalidateQueries({ queryKey: leadAdminKeys.lists() });
      }
    },
    onError: (error) => {
      console.error("Failed to delete lead (admin):", error);
    },
  });
}
