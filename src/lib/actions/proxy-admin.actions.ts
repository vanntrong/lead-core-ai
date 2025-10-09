"use server";

import { proxyAdminService } from "@/services/proxy-admin.service";
import type {
	PaginatedProxyResponse,
	Proxy,
	ProxyFilters,
} from "@/types/proxy";

export async function getProxiesAdminAction(
	filters?: ProxyFilters
): Promise<Proxy[]> {
	try {
		return await proxyAdminService
			.getProxiesPaginated(filters)
			.then((res) => res.data);
	} catch (error) {
		console.error("Error in getProxiesAdminAction:", error);
		throw error;
	}
}

export async function getProxyByIdAdminAction(
	id: string
): Promise<Proxy | null> {
	try {
		return await proxyAdminService.getProxyById(id);
	} catch (error) {
		console.error("Error in getProxyByIdAdminAction:", error);
		throw error;
	}
}

export async function getProxiesPaginatedAdminAction(
	filters?: ProxyFilters
): Promise<PaginatedProxyResponse> {
	try {
		return await proxyAdminService.getProxiesPaginated(filters);
	} catch (error) {
		console.error("Error in getProxiesPaginatedAdminAction:", error);
		throw error;
	}
}

export async function updateProxyAdminAction(
	data: Partial<Proxy> & { id: string }
): Promise<Proxy> {
	try {
		return await proxyAdminService.updateProxy(data);
	} catch (error) {
		console.error("Error in updateProxyAdminAction:", error);
		throw error;
	}
}

export async function deleteProxyAdminAction(
	id: string
): Promise<{ success: boolean }> {
	try {
		await proxyAdminService.deleteProxy(id);
		return { success: true };
	} catch (error) {
		console.error("Error in deleteProxyAdminAction:", error);
		throw error;
	}
}
