import {
	getProxyHealCheckLogsAdminAction,
	getProxyHealCheckLogByIdAdminAction,
	getProxyHealCheckLogsPaginatedAdminAction,
	createProxyHealCheckLogAdminAction,
	updateProxyHealCheckLogAdminAction,
	deleteProxyHealCheckLogAdminAction,
	getProxyHealCheckLogStatsAdminAction,
} from "@/lib/actions/proxy-heal-check-logs-admin.actions";

import type {
	CreateProxyHealCheckLogData,
	ProxyHealCheckLog,
	ProxyHealCheckLogFilters,
	UpdateProxyHealCheckLogData,
} from "@/types/proxy_heal_check_log";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

export const proxyHealCheckLogAdminKeys = {
	all: ["proxyHealCheckLogsAdmin"] as const,
	lists: () => [...proxyHealCheckLogAdminKeys.all, "list"] as const,
	list: (filters?: ProxyHealCheckLogFilters) =>
		[...proxyHealCheckLogAdminKeys.lists(), filters] as const,
	paginatedLists: () =>
		[...proxyHealCheckLogAdminKeys.all, "paginatedList"] as const,
	paginatedList: (filters?: ProxyHealCheckLogFilters) =>
		[...proxyHealCheckLogAdminKeys.paginatedLists(), filters] as const,
	details: () => [...proxyHealCheckLogAdminKeys.all, "detail"] as const,
	detail: (id: string) =>
		[...proxyHealCheckLogAdminKeys.details(), id] as const,
	stats: () => [...proxyHealCheckLogAdminKeys.all, "stats"] as const,
};

export function useProxyHealCheckLogsAdmin(filters?: ProxyHealCheckLogFilters) {
	return useQuery({
		queryKey: proxyHealCheckLogAdminKeys.list(filters),
		queryFn: () => getProxyHealCheckLogsAdminAction(filters),
		placeholderData: keepPreviousData,
	});
}

export function useProxyHealCheckLogsPaginatedAdmin(
	filters?: ProxyHealCheckLogFilters
) {
	return useQuery({
		queryKey: proxyHealCheckLogAdminKeys.paginatedList(filters),
		queryFn: () => getProxyHealCheckLogsPaginatedAdminAction(filters),
		placeholderData: keepPreviousData,
	});
}

export function useProxyHealCheckLogByIdAdmin(id: string) {
	return useQuery({
		queryKey: proxyHealCheckLogAdminKeys.detail(id),
		queryFn: () => getProxyHealCheckLogByIdAdminAction(id),
		enabled: !!id,
		placeholderData: keepPreviousData,
	});
}

export function useCreateProxyHealCheckLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProxyHealCheckLogData) =>
			createProxyHealCheckLogAdminAction(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.paginatedLists(),
			});
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.stats(),
			});
		},
		onError: (error) => {
			console.error("Failed to create proxy heal check log (admin):", error);
		},
	});
}

export function useUpdateProxyHealCheckLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateProxyHealCheckLogData) => {
			const result = await updateProxyHealCheckLogAdminAction(data);
			return result;
		},
		onSuccess: (updatedLog: ProxyHealCheckLog) => {
			queryClient.setQueryData(
				proxyHealCheckLogAdminKeys.detail(updatedLog.id),
				updatedLog
			);
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.paginatedLists(),
			});
		},
		onError: (error) => {
			console.error("Failed to update proxy heal check log (admin):", error);
		},
	});
}

export function useDeleteProxyHealCheckLogAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteProxyHealCheckLogAdminAction(id),
		onSuccess: (_, deletedId) => {
			queryClient.removeQueries({
				queryKey: proxyHealCheckLogAdminKeys.detail(deletedId),
			});
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: proxyHealCheckLogAdminKeys.paginatedLists(),
			});
		},
		onError: (error) => {
			console.error("Failed to delete proxy heal check log (admin):", error);
		},
	});
}

export function useProxyHealCheckLogStatsAdmin() {
	return useQuery({
		queryKey: proxyHealCheckLogAdminKeys.stats(),
		queryFn: () => getProxyHealCheckLogStatsAdminAction(),
	});
}
