import {
  deleteProxyAdminAction,
  getProxiesAdminAction,
  getProxiesPaginatedAdminAction,
  getProxyByIdAdminAction,
  updateProxyAdminAction,
} from "@/lib/actions/proxy-admin.actions";

import type {
  Proxy,
  ProxyFilters
} from "@/types/proxy";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const proxyAdminKeys = {
  all: ["proxiesAdmin"] as const,
  lists: () => [...proxyAdminKeys.all, "list"] as const,
  list: (filters?: ProxyFilters) => [...proxyAdminKeys.lists(), filters] as const,
  paginatedLists: () => [...proxyAdminKeys.all, "paginatedList"] as const,
  paginatedList: (filters?: ProxyFilters) => [...proxyAdminKeys.paginatedLists(), filters] as const,
  details: () => [...proxyAdminKeys.all, "detail"] as const,
  detail: (id: string) => [...proxyAdminKeys.details(), id] as const,
};

export function useProxiesAdmin(filters?: ProxyFilters) {
  return useQuery({
    queryKey: proxyAdminKeys.list(filters),
    queryFn: () => getProxiesAdminAction(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProxiesPaginatedAdmin(filters?: ProxyFilters) {
  return useQuery({
    queryKey: proxyAdminKeys.paginatedList(filters),
    queryFn: () => getProxiesPaginatedAdminAction(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProxyByIdAdmin(id: string) {
  return useQuery({
    queryKey: proxyAdminKeys.detail(id),
    queryFn: () => getProxyByIdAdminAction(id),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateProxyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Proxy> & { id: string }) => {
      const result = await updateProxyAdminAction(data);
      return result;
    },
    onSuccess: (updatedProxy: Proxy) => {
      queryClient.setQueryData(proxyAdminKeys.detail(updatedProxy.id), updatedProxy);
      queryClient.invalidateQueries({ queryKey: proxyAdminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proxyAdminKeys.paginatedLists() });
    },
    onError: (error) => {
      console.error("Failed to update proxy (admin):", error);
    },
  });
}

export function useDeleteProxyAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProxyAdminAction(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: proxyAdminKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: proxyAdminKeys.lists() });
      queryClient.invalidateQueries({ queryKey: proxyAdminKeys.paginatedLists() });
    },
    onError: (error) => {
      console.error("Failed to delete proxy (admin):", error);
    },
  });
}
