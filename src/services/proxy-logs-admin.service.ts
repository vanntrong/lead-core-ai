import { createAdminClient } from "@/lib/supabase/admin";
import type {
	PaginatedProxyLogResponse,
	ProxyLog,
	ProxyLogFilters,
	ProxyLogStats,
} from "@/types/proxy_log";

export class ProxyLogsAdminService {
	async createProxyLog(data: any): Promise<ProxyLog> {
		const supabase = await this.getSupabaseClient();
		const { data: newLog, error } = await supabase
			.from("proxy_logs")
			.insert({
				created_at: data.created_at || new Date().toISOString(),
				web_source: data.web_source,
				web_url: data.web_url,
				proxy_host: data.proxy_host,
				proxy_port: data.proxy_port,
				proxy_ip: data.proxy_ip,
				status: data.status,
				error: data.error,
			})
			.select("*")
			.single();
		if (error) {
			console.error("Error creating proxy log (admin):", error);
			throw new Error(`Failed to create proxy log: ${error.message}`);
		}
		return newLog;
	}

	async updateProxyLog(data: any): Promise<ProxyLog> {
		const supabase = await this.getSupabaseClient();
		const { id, ...updateData } = data;
		const { data: updatedLog, error } = await supabase
			.from("proxy_logs")
			.update(updateData)
			.eq("id", id)
			.select("*")
			.single();
		if (error) {
			console.error("Error updating proxy log (admin):", error);
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
			console.error("Error deleting proxy log (admin):", error);
			throw new Error(`Failed to delete proxy log: ${error.message}`);
		}
	}
	private async getSupabaseClient() {
		return createAdminClient();
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
			console.error("Error fetching proxy log (admin):", error);
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
			const searchFilter = `web_url.ilike.${searchTerm}`;
			query = query.or(searchFilter);
			countQuery = countQuery.or(searchFilter);
		}
		if (filters.date_range?.start) {
			query = query.gte("created_at", filters.date_range.start);
			countQuery = countQuery.gte("created_at", filters.date_range.start);
		}
		if (filters.date_range?.end) {
			query = query.lte("created_at", filters.date_range.end);
			countQuery = countQuery.lte("created_at", filters.date_range.end);
		}
		query = query
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);
		const [{ data, error }, { count, error: countError }] = await Promise.all([
			query,
			countQuery,
		]);
		if (error) {
			console.error("Error fetching paginated proxy logs (admin):", error);
			throw new Error(`Failed to fetch paginated proxy logs: ${error.message}`);
		}
		if (countError) {
			console.error("Error fetching proxy logs count (admin):", countError);
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
				`web_url.ilike.${searchTerm},proxy_host.ilike.${searchTerm},error.ilike.${searchTerm}`
			);
		}
		if (filters?.date_range) {
			query = query
				.gte("created_at", filters.date_range.start)
				.lte("created_at", filters.date_range.end);
		}
		const { data, error } = await query.order("created_at", {
			ascending: false,
		});
		if (error) {
			console.error("Error fetching proxy logs (admin):", error);
			throw new Error(`Failed to fetch proxy logs: ${error.message}`);
		}
		return data ?? [];
	}

	async getProxyLogStats(): Promise<ProxyLogStats> {
		const supabase = await this.getSupabaseClient();
		const { data: logs, error } = await supabase.from("proxy_logs").select("*");
		if (error) {
			console.error("Error fetching proxy log stats (admin):", error);
			throw new Error(`Failed to fetch proxy log stats: ${error.message}`);
		}
		const typedLogs = (logs ?? []) as ProxyLog[];
		const total = typedLogs.length;
		const success = typedLogs.filter((log) => log.status === "success").length;
		const failed = typedLogs.filter((log) => log.status === "failed").length;
		const banned = typedLogs.filter((log) => log.status === "banned").length;
		const timeout = typedLogs.filter((log) => log.status === "timeout").length;
		// Host breakdown
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

	async getRecentLogsByHost(
		proxy_host: string,
		limit = 10
	): Promise<ProxyLog[]> {
		return this.getProxyLogs({
			proxy_host,
			limit,
		});
	}

	async getFailedLogs(filters?: {
		proxy_host?: string;
		since?: string;
	}): Promise<ProxyLog[]> {
		const logFilters: ProxyLogFilters = {
			status: "failed",
			proxy_host: filters?.proxy_host,
		};
		if (filters?.since) {
			logFilters.date_range = {
				start: filters.since,
				end: new Date().toISOString(),
			};
		}
		return this.getProxyLogs(logFilters);
	}
}

export const proxyLogsAdminService = new ProxyLogsAdminService();
