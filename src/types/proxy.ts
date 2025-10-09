import type { Database } from "../../database.types";

export type ProxyStatus = Database["public"]["Enums"]["proxy_status"];

// Base proxy type from database
export type ProxyRow = Database["public"]["Tables"]["proxies"]["Row"];
export type ProxyInsert = Database["public"]["Tables"]["proxies"]["Insert"];
export type ProxyUpdate = Database["public"]["Tables"]["proxies"]["Update"];

// Extended proxy type for UI
export interface ProxyMonitorInfo {
	avg_response_ms?: number;
	error_count_24h?: number;
	last_checked_at?: string;
}

export interface Proxy extends ProxyRow {
	monitor_info: ProxyMonitorInfo | null;
}

// Proxy creation data
export interface CreateProxyData {
	host: string;
	port: number;
	status?: ProxyStatus;
}

// Proxy update data
export interface UpdateProxyData extends Partial<ProxyRow> {
	id: string;
}

// Proxy filters for search and filtering
export interface ProxyFilters {
	status?: ProxyStatus;
	search?: string; // Search across host, port, status
	date_range?: {
		start: string;
		end: string;
	};
	page?: number;
	limit?: number;
}

export interface PaginatedProxyResponse {
	data: Proxy[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
}

export interface ProxyStatusBreakdownItem {
	status: string;
	count: number;
}

export interface ProxyStats {
	total: number; // Total proxies
	active: number; // Active proxies
	inactive: number; // Inactive proxies
	error: number; // Proxies in error state
	avg_response_ms?: number; // Average response time
	status_breakdown?: ProxyStatusBreakdownItem[];
}
