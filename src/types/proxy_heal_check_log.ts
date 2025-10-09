import type { Database } from "../../database.types";

export type ProxyHealCheckLogStatus =
	Database["public"]["Enums"]["proxy_heal_check_log_status"];
export type ProxyHealCheckLogRow =
	Database["public"]["Tables"]["proxy_heal_check_logs"]["Row"];
export type ProxyHealCheckLogInsert =
	Database["public"]["Tables"]["proxy_heal_check_logs"]["Insert"];
export type ProxyHealCheckLogUpdate =
	Database["public"]["Tables"]["proxy_heal_check_logs"]["Update"];

export interface ProxyHealCheckLog extends ProxyHealCheckLogRow {}

export interface PaginatedProxyHealCheckLogResponse {
	data: ProxyHealCheckLog[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
}

export interface ProxyHealCheckLogFilters {
	page?: number;
	limit?: number;
	status?: ProxyHealCheckLogStatus;
	proxy_host?: string;
	proxy_port?: number;
	search?: string;
	date_range?: {
		start: string;
		end: string;
	};
}

export interface CreateProxyHealCheckLogData
	extends Partial<ProxyHealCheckLogRow> {}
export interface UpdateProxyHealCheckLogData
	extends Partial<ProxyHealCheckLogRow> {
	id: string;
}

export interface ProxyHealCheckLogStats {
	total: number;
	success: number;
	failed: number;
	banned: number;
	timeout: number;
	host_breakdown: Array<{
		proxy_host: string;
		count: number;
		success_rate: number;
	}>;
}
