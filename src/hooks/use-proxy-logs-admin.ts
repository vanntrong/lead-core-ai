import {
	getProxyLogsAdminAction,
	getProxyLogByIdAdminAction,
	getProxyLogsPaginatedAdminAction,
	createProxyLogAdminAction,
	updateProxyLogAdminAction,
	deleteProxyLogAdminAction,
	getProxyLogStatsAdminAction,
} from "@/lib/actions/proxy-logs-admin.actions";

import type {
	CreateProxyLogData,
	ProxyLog,
	ProxyLogFilters,
	UpdateProxyLogData,
} from "@/types/proxy_log";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

// Query keys
export const proxyLogAdminKeys = {
	all: ["proxyLogsAdmin"] as const,
	lists: () => [...proxyLogAdminKeys.all, "list"] as const,
	list: (filters?: ProxyLogFilters) =>
		[...proxyLogAdminKeys.lists(), filters] as const,
	paginatedLists: () => [...proxyLogAdminKeys.all, "paginatedList"] as const,
	paginatedList: (filters?: ProxyLogFilters) =>
		[...proxyLogAdminKeys.paginatedLists(), filters] as const,
	details: () => [...proxyLogAdminKeys.all, "detail"] as const,
	detail: (id: string) => [...proxyLogAdminKeys.details(), id] as const,
	stats: () => [...proxyLogAdminKeys.all, "stats"] as const,
};

// Get all logs with optional filters
export function useProxyLogsAdmin(filters?: ProxyLogFilters) {
	return useQuery({
		queryKey: proxyLogAdminKeys.list(filters),
		queryFn: () => getProxyLogsAdminAction(filters),
		placeholderData: keepPreviousData,
	});
}

// Get paginated logs with optional filters
export function useProxyLogsPaginatedAdmin(filters?: ProxyLogFilters) {
	return useQuery({
		queryKey: proxyLogAdminKeys.paginatedList(filters),
		queryFn: () => getProxyLogsPaginatedAdminAction(filters),
		placeholderData: keepPreviousData,
	});
}

// Get single log by ID
export function useProxyLogByIdAdmin(id: string) {
	return useQuery({
		queryKey: proxyLogAdminKeys.detail(id),
		queryFn: () => getProxyLogByIdAdminAction(id),
		enabled: !!id,
		placeholderData: keepPreviousData,
	});
}

// Create new log
export function useCreateProxyLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProxyLogData) => createProxyLogAdminAction(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: proxyLogAdminKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: proxyLogAdminKeys.paginatedLists(),
			});
			queryClient.invalidateQueries({ queryKey: proxyLogAdminKeys.stats() });
		},
		onError: (error) => {
			console.error("Failed to create proxy log (admin):", error);
		},
	});
}

// Update existing log
export function useUpdateProxyLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateProxyLogData) => {
			const result = await updateProxyLogAdminAction(data);
			return result;
		},
		onSuccess: (updatedLog: ProxyLog) => {
			queryClient.setQueryData(
				proxyLogAdminKeys.detail(updatedLog.id),
				updatedLog
			);
			queryClient.invalidateQueries({ queryKey: proxyLogAdminKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: proxyLogAdminKeys.paginatedLists(),
			});
		},
		onError: (error) => {
			console.error("Failed to update proxy log (admin):", error);
		},
	});
}

// Delete log
export function useDeleteProxyLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteProxyLogAdminAction(id),
		onSuccess: (_, deletedId) => {
			queryClient.removeQueries({
				queryKey: proxyLogAdminKeys.detail(deletedId),
			});
			queryClient.invalidateQueries({ queryKey: proxyLogAdminKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: proxyLogAdminKeys.paginatedLists(),
			});
		},
		onError: (error) => {
			console.error("Failed to delete proxy log (admin):", error);
		},
	});
}

// Get stats
export function useProxyLogStatsAdmin() {
	return useQuery({
		queryKey: proxyLogAdminKeys.stats(),
		queryFn: () => getProxyLogStatsAdminAction(),
	});
}
