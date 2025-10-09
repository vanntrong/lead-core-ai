import type { Database } from "../../database.types";

export type ProxyLogStatus = Database["public"]["Enums"]["proxy_log_status"];

export type ProxyLogRow = Database["public"]["Tables"]["proxy_logs"]["Row"];
export type ProxyLogInsert =
	Database["public"]["Tables"]["proxy_logs"]["Insert"];
export type ProxyLogUpdate =
	Database["public"]["Tables"]["proxy_logs"]["Update"];

export interface ProxyLog extends ProxyLogRow {}

export interface PaginatedProxyLogResponse {
	data: ProxyLog[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
}

export interface ProxyLogFilters {
	page?: number;
	limit?: number;
	status?: ProxyLogStatus;
	proxy_host?: string;
	search?: string;
	date_range?: {
		start: string;
		end: string;
	};
}

export interface CreateProxyLogData extends Partial<ProxyLogRow> {}
export interface UpdateProxyLogData extends Partial<ProxyLogRow> {
	id: string;
}

export interface ProxyLogStats {
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
