import {
	getScraperLogsAdminAction,
	getScraperLogByIdAdminAction,
	getScraperLogsPaginatedAdminAction,
	createScraperLogAdminAction,
	updateScraperLogAdminAction,
	deleteScraperLogAdminAction,
	getScraperLogStatsAdminAction,
} from "@/lib/actions/scraper-logs-admin.actions";

import type {
	CreateScraperLogData,
	ScraperLog,
	ScraperLogFilters,
	UpdateScraperLogData,
} from "@/types/scraper_log";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

// Query keys
export const scraperLogAdminKeys = {
	all: ["scraperLogsAdmin"] as const,
	lists: () => [...scraperLogAdminKeys.all, "list"] as const,
	list: (filters?: ScraperLogFilters) =>
		[...scraperLogAdminKeys.lists(), filters] as const,
	paginatedLists: () => [...scraperLogAdminKeys.all, "paginatedList"] as const,
	paginatedList: (filters?: ScraperLogFilters) =>
		[...scraperLogAdminKeys.paginatedLists(), filters] as const,
	details: () => [...scraperLogAdminKeys.all, "detail"] as const,
	detail: (id: string) => [...scraperLogAdminKeys.details(), id] as const,
	stats: () => [...scraperLogAdminKeys.all, "stats"] as const,
};

// Get all logs with optional filters
export function useScraperLogsAdmin(filters?: ScraperLogFilters) {
	return useQuery({
		queryKey: scraperLogAdminKeys.list(filters),
		queryFn: () => getScraperLogsAdminAction(filters),
		placeholderData: keepPreviousData,
	});
}

// Get paginated logs with optional filters
export function useScraperLogsPaginatedAdmin(filters?: ScraperLogFilters) {
	return useQuery({
		queryKey: scraperLogAdminKeys.paginatedList(filters),
		queryFn: () => getScraperLogsPaginatedAdminAction(filters),
		placeholderData: keepPreviousData,
	});
}

// Get single log by ID
export function useScraperLogByIdAdmin(id: string) {
	return useQuery({
		queryKey: scraperLogAdminKeys.detail(id),
		queryFn: () => getScraperLogByIdAdminAction(id),
		enabled: !!id,
		placeholderData: keepPreviousData,
	});
}

// Create new log
export function useCreateScraperLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateScraperLogData) =>
			createScraperLogAdminAction(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: scraperLogAdminKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: scraperLogAdminKeys.paginatedLists(),
			});
			queryClient.invalidateQueries({ queryKey: scraperLogAdminKeys.stats() });
		},
		onError: (error) => {
			console.error("Failed to create scraper log (admin):", error);
		},
	});
}

// Update existing log
export function useUpdateScraperLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateScraperLogData) => {
			const result = await updateScraperLogAdminAction(data);
			return result;
		},
		onSuccess: (updatedLog: ScraperLog) => {
			queryClient.setQueryData(
				scraperLogAdminKeys.detail(updatedLog.id),
				updatedLog
			);
			queryClient.invalidateQueries({ queryKey: scraperLogAdminKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: scraperLogAdminKeys.paginatedLists(),
			});
		},
		onError: (error) => {
			console.error("Failed to update scraper log (admin):", error);
		},
	});
}

// Delete log
export function useDeleteScraperLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteScraperLogAdminAction(id),
		onSuccess: (_, deletedId) => {
			queryClient.removeQueries({
				queryKey: scraperLogAdminKeys.detail(deletedId),
			});
			queryClient.invalidateQueries({ queryKey: scraperLogAdminKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: scraperLogAdminKeys.paginatedLists(),
			});
		},
		onError: (error) => {
			console.error("Failed to delete scraper log (admin):", error);
		},
	});
}

// Get stats
export function useScraperLogStatsAdmin() {
	return useQuery({
		queryKey: scraperLogAdminKeys.stats(),
		queryFn: () => getScraperLogStatsAdminAction(),
	});
}
