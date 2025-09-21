import {
  createLeadAction,
  deleteLeadAction,
  getLeadByIdAction,
  getLeadsAction,
  getLeadsPaginatedAction,
  getLeadStatsAction,
  updateLeadAction,
  generateMockLeadsAction,
} from "@/lib/actions/lead.actions";

import type {
  CreateLeadData,
  Lead,
  LeadFilters,
  UpdateLeadData,
} from "@/types/lead";
import { fromSecondsToMilliseconds } from "@/utils/helper";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// Cache duration constants
const MINUTES_TO_MS = fromSecondsToMilliseconds(60);
const FIVE_MINUTES = MINUTES_TO_MS * 5;
const TWO_MINUTES = MINUTES_TO_MS * 2;

// Query keys
export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (filters?: LeadFilters) => [...leadKeys.lists(), filters] as const,
  paginatedLists: () => [...leadKeys.all, "paginatedList"] as const,
  paginatedList: (filters?: LeadFilters) =>
    [...leadKeys.paginatedLists(), filters] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  stats: () => [...leadKeys.all, "stats"] as const,
};

// Backward-compatible alias (optional; remove after refactor)
export const loadKeys = leadKeys;

// Get all leads with optional filters
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => getLeadsAction(filters),
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  });
}

// Get paginated leads with optional filters
export function useLeadsPaginated(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.paginatedList(filters),
    // lead action expects an object; pass filters inside
    queryFn: () => getLeadsPaginatedAction(filters),
    placeholderData: keepPreviousData,
    staleTime: TWO_MINUTES,
  });
}

// Get single lead by ID
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => getLeadByIdAction(id),
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
}

// Create new lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadData) => createLeadAction(data),
    onSuccess: () => {
      // Invalidate and refetch lead lists
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.paginatedLists() });
    },
    onError: (error) => {
      console.error("Failed to create lead:", error);
    },
  });
}

// Update existing lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadData) => {
      const result = await updateLeadAction(data);
      // Convert result to Lead type
      return {
        ...result,
        scrap_info: result.scrap_info as Lead["scrap_info"],
      };
    },
    onSuccess: (updatedLead: Lead) => {
      // Update the specific lead in cache
      queryClient.setQueryData(leadKeys.detail(updatedLead.id), updatedLead);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.paginatedLists() });
    },
    onError: (error) => {
      console.error("Failed to update lead:", error);
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLeadAction(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: leadKeys.detail(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.paginatedLists() });
    },
    onError: (error) => {
      console.error("Failed to delete lead:", error);
    },
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: () => getLeadStatsAction(),
    staleTime: TWO_MINUTES,
  });
}

export function useGenerateMockLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateMockLeadsAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.paginatedLists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
    },
    onError: (error) => {
      console.error("Failed to generate mock leads:", error);
    },
  });
}

