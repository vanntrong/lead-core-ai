import { createClient } from "@/lib/supabase/server";
import type { LeadSource } from "@/types/lead";
import type {
	CreateProxyLogData,
	PaginatedProxyLogResponse,
	ProxyLog,
	ProxyLogFilters,
	ProxyLogStats,
	ProxyLogStatus,
	UpdateProxyLogData,
} from "@/types/proxy_log";

export interface LogProxyOperationParams {
	proxy_host: string;
	web_source: LeadSource;
	web_url?: string;
	proxy_port: number;
	proxy_ip?: string | null;
	startTime: Date;
	endTime: Date;
	status: ProxyLogStatus;
	error?: string | null;
	duration?: number;
}

export class ProxyLogsService {
	private async getSupabaseClient() {
		return await createClient();
	}

	async getProxyLogById(id: string): Promise<ProxyLog | null> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("proxy_logs")
			.select("*")
			.eq("id", id)
			.single();
		if (error) {
			if (error.code === "PGRST116") {
				return null;
			}
			console.error("Error fetching proxy log:", error);
			throw new Error(`Failed to fetch proxy log: ${error.message}`);
		}
		return data;
	}

	async getProxyLogsPaginated(
		filters: ProxyLogFilters = {}
	): Promise<PaginatedProxyLogResponse> {
		const supabase = await this.getSupabaseClient();
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;
		let query = supabase.from("proxy_logs").select("*");
		let countQuery = supabase
			.from("proxy_logs")
			.select("*", { count: "exact", head: true });
		if (filters.status) {
			query = query.eq("status", filters.status);
			countQuery = countQuery.eq("status", filters.status);
		}
		if (filters.proxy_host) {
			query = query.eq("proxy_host", filters.proxy_host);
			countQuery = countQuery.eq("proxy_host", filters.proxy_host);
		}
		if (filters.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			query = query.or(
				`proxy_host.ilike.${searchTerm},error.ilike.${searchTerm}`
			);
			countQuery = countQuery.or(
				`proxy_host.ilike.${searchTerm},error.ilike.${searchTerm}`
			);
		}
		if (filters.date_range?.start) {
			query = query.gte("timestamp", filters.date_range.start);
			countQuery = countQuery.gte("timestamp", filters.date_range.start);
		}
		if (filters.date_range?.end) {
			query = query.lte("timestamp", filters.date_range.end);
			countQuery = countQuery.lte("timestamp", filters.date_range.end);
		}
		query = query
			.order("timestamp", { ascending: false })
			.range(offset, offset + limit - 1);
		const [{ data, error }, { count, error: countError }] = await Promise.all([
			query,
			countQuery,
		]);
		if (error) {
			console.error("Error fetching paginated proxy logs:", error);
			throw new Error(`Failed to fetch paginated proxy logs: ${error.message}`);
		}
		if (countError) {
			console.error("Error fetching proxy logs count:", countError);
			throw new Error(
				`Failed to fetch proxy logs count: ${countError.message}`
			);
		}
		const totalCount = count ?? 0;
		const totalPages = Math.ceil(totalCount / limit);
		return {
			data: data ?? [],
			totalCount,
			currentPage: page,
			totalPages,
			itemsPerPage: limit,
		};
	}

	async getProxyLogs(filters?: ProxyLogFilters): Promise<ProxyLog[]> {
		const supabase = await this.getSupabaseClient();
		let query = supabase.from("proxy_logs").select("*");
		if (filters?.status) {
			query = query.eq("status", filters.status);
		}
		if (filters?.proxy_host) {
			query = query.eq("proxy_host", filters.proxy_host);
		}
		if (filters?.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			query = query.or(
				`proxy_host.ilike.${searchTerm},error.ilike.${searchTerm}`
			);
		}
		if (filters?.date_range) {
			query = query
				.gte("timestamp", filters.date_range.start)
				.lte("timestamp", filters.date_range.end);
		}
		const { data, error } = await query.order("timestamp", {
			ascending: false,
		});
		if (error) {
			console.error("Error fetching proxy logs:", error);
			throw new Error(`Failed to fetch proxy logs: ${error.message}`);
		}
		return data ?? [];
	}

	async createProxyLog(data: CreateProxyLogData): Promise<ProxyLog> {
		const supabase = await this.getSupabaseClient();
		const { data: newLog, error } = await supabase
			.from("proxy_logs")
			.insert({
				web_source: data.web_source,
				web_url: data.web_url,
				proxy_host: data.proxy_host,
				proxy_port: data.proxy_port,
				proxy_ip: data.proxy_ip,
				status: data.status,
				duration: data.duration,
				error: data.error,
			})
			.select("*")
			.single();
		if (error) {
			console.error("Error creating proxy log:", error);
			throw new Error(`Failed to create proxy log: ${error.message}`);
		}
		return newLog;
	}

	async updateProxyLog(data: UpdateProxyLogData): Promise<ProxyLog> {
		const supabase = await this.getSupabaseClient();
		const { id, ...updateData } = data;
		const { data: updatedLog, error } = await supabase
			.from("proxy_logs")
			.update(updateData)
			.eq("id", id)
			.select("*")
			.single();
		if (error) {
			console.error("Error updating proxy log:", error);
			throw new Error(`Failed to update proxy log: ${error.message}`);
		}
		return updatedLog;
	}

	async deleteProxyLog(id: string): Promise<void> {
		const supabase = await this.getSupabaseClient();
		const { data: log } = await supabase
			.from("proxy_logs")
			.select("id")
			.eq("id", id)
			.single();
		if (!log) {
			throw new Error("Proxy log not found");
		}
		const { error } = await supabase.from("proxy_logs").delete().eq("id", id);
		if (error) {
			console.error("Error deleting proxy log:", error);
			throw new Error(`Failed to delete proxy log: ${error.message}`);
		}
	}

	async getProxyLogStats(): Promise<ProxyLogStats> {
		const supabase = await this.getSupabaseClient();
		const { data: logs, error } = await supabase.from("proxy_logs").select("*");
		if (error) {
			console.error("Error fetching proxy log stats:", error);
			throw new Error(`Failed to fetch proxy log stats: ${error.message}`);
		}
		const typedLogs = (logs ?? []) as ProxyLog[];
		const total = typedLogs.length;
		const success = typedLogs.filter((log) => log.status === "success").length;
		const failed = typedLogs.filter((log) => log.status === "failed").length;
		const banned = typedLogs.filter((log) => log.status === "banned").length;
		const timeout = typedLogs.filter((log) => log.status === "timeout").length;
		// Breakdown by proxy_host
		const hostMap: Record<string, { total: number; success: number }> = {};
		typedLogs.forEach((log) => {
			if (log.proxy_host) {
				if (!hostMap[log.proxy_host]) {
					hostMap[log.proxy_host] = { total: 0, success: 0 };
				}
				hostMap[log.proxy_host].total++;
				if (log.status === "success") {
					hostMap[log.proxy_host].success++;
				}
			}
		});
		const host_breakdown = Object.entries(hostMap).map(
			([proxy_host, stats]) => ({
				proxy_host,
				count: stats.total,
				success_rate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
			})
		);
		return {
			total,
			success,
			failed,
			banned,
			timeout,
			host_breakdown,
		};
	}

	async logProxyOperation(params: LogProxyOperationParams): Promise<ProxyLog> {
		const {
			proxy_host,
			proxy_port,
			proxy_ip,
			startTime,
			endTime,
			status,
			error,
			web_source,
			web_url,
		} = params;
		const duration = endTime.getTime() - startTime.getTime();

		return this.createProxyLog({
			web_source,
			web_url,
			proxy_host,
			proxy_port,
			proxy_ip,
			duration,
			status,
			error: error || null,
		});
	}
}

export const proxyLogsService = new ProxyLogsService();
