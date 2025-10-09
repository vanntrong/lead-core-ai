import { createClient } from "@/lib/supabase/server";
import type {
	CreateScraperLogData,
	PaginatedScraperLogResponse,
	ScraperLog,
	ScraperLogFilters,
	ScraperLogStats,
	ScraperSource,
	UpdateScraperLogData,
} from "@/types/scraper_log";

// Params type for logScrapingOperation
export interface LogScrapingOperationParams {
	source: ScraperSource;
	url: string;
	startTime: Date;
	endTime: Date;
	success: boolean;
	error?: string;
}

export class ScraperLogsService {
	private async getSupabaseClient() {
		return await createClient();
	}

	async getScraperLogById(id: string): Promise<ScraperLog | null> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("scraper_logs")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // Log not found
			}
			console.error("Error fetching scraper log:", error);
			throw new Error(`Failed to fetch scraper log: ${error.message}`);
		}

		return data;
	}

	async getScraperLogsPaginated(
		filters: ScraperLogFilters = {}
	): Promise<PaginatedScraperLogResponse> {
		const supabase = await this.getSupabaseClient();

		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;

		// Build data query
		let query = supabase.from("scraper_logs").select("*");

		// Build count query (head:true for faster count)
		let countQuery = supabase
			.from("scraper_logs")
			.select("*", { count: "exact", head: true });

		// Apply filters to both queries
		if (filters.status) {
			query = query.eq("status", filters.status);
			countQuery = countQuery.eq("status", filters.status);
		}
		if (filters.source) {
			query = query.eq("source", filters.source);
			countQuery = countQuery.eq("source", filters.source);
		}
		if (filters.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			const searchFilter = `url.ilike.${searchTerm}`;
			query = query.or(searchFilter);
			countQuery = countQuery.or(searchFilter);
		}

		if (filters.date_range?.start) {
			query = query.gte("timestamp", filters.date_range.start);
			countQuery = countQuery.gte("timestamp", filters.date_range.start);
		}

		if (filters.date_range?.end) {
			query = query.lte("timestamp", filters.date_range.end);
			countQuery = countQuery.lte("timestamp", filters.date_range.end);
		}

		// Apply pagination and ordering
		query = query
			.order("timestamp", { ascending: false })
			.range(offset, offset + limit - 1);

		const [{ data, error }, { count, error: countError }] = await Promise.all([
			query,
			countQuery,
		]);

		if (error) {
			console.error("Error fetching paginated scraper logs:", error);
			throw new Error(
				`Failed to fetch paginated scraper logs: ${error.message}`
			);
		}

		if (countError) {
			console.error("Error fetching scraper logs count:", countError);
			throw new Error(
				`Failed to fetch scraper logs count: ${countError.message}`
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

	async getScraperLogs(filters?: ScraperLogFilters): Promise<ScraperLog[]> {
		const supabase = await this.getSupabaseClient();

		let query = supabase.from("scraper_logs").select("*");

		if (filters?.status) {
			query = query.eq("status", filters.status);
		}
		if (filters?.source) {
			query = query.eq("source", filters.source);
		}
		if (filters?.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			query = query.or(
				`url.ilike.${searchTerm},source.ilike.${searchTerm},error.ilike.${searchTerm}`
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
			console.error("Error fetching scraper logs:", error);
			throw new Error(`Failed to fetch scraper logs: ${error.message}`);
		}

		return data ?? [];
	}

	async createScraperLog(data: CreateScraperLogData): Promise<ScraperLog> {
		const supabase = await this.getSupabaseClient();

		const { data: newLog, error } = await supabase
			.from("scraper_logs")
			.insert({
				timestamp: data.timestamp || new Date().toISOString(),
				source: data.source,
				url: data.url,
				duration: data.duration,
				status: data.status,
				error: data.error,
			})
			.select("*")
			.single();

		if (error) {
			console.error("Error creating scraper log:", error);
			throw new Error(`Failed to create scraper log: ${error.message}`);
		}

		return newLog;
	}

	async updateScraperLog(data: UpdateScraperLogData): Promise<ScraperLog> {
		const supabase = await this.getSupabaseClient();
		const { id, ...updateData } = data;

		const { data: updatedLog, error } = await supabase
			.from("scraper_logs")
			.update(updateData)
			.eq("id", id)
			.select("*")
			.single();

		if (error) {
			console.error("Error updating scraper log:", error);
			throw new Error(`Failed to update scraper log: ${error.message}`);
		}

		return updatedLog;
	}

	async deleteScraperLog(id: string): Promise<void> {
		const supabase = await this.getSupabaseClient();

		const { data: log } = await supabase
			.from("scraper_logs")
			.select("id")
			.eq("id", id)
			.single();

		if (!log) {
			throw new Error("Scraper log not found");
		}

		const { error } = await supabase.from("scraper_logs").delete().eq("id", id);

		if (error) {
			console.error("Error deleting scraper log:", error);
			throw new Error(`Failed to delete scraper log: ${error.message}`);
		}
	}

	async getScraperLogStats(): Promise<ScraperLogStats> {
		const supabase = await this.getSupabaseClient();

		const { data: logs, error } = await supabase
			.from("scraper_logs")
			.select("*");

		if (error) {
			console.error("Error fetching scraper log stats:", error);
			throw new Error(`Failed to fetch scraper log stats: ${error.message}`);
		}

		const typedLogs = (logs ?? []) as ScraperLog[];
		const total = typedLogs.length;
		const success = typedLogs.filter((log) => log.status === "success").length;
		const failed = typedLogs.filter((log) => log.status === "fail").length;

		// Calculate average duration (only for logs with duration)
		const logsWithDuration = typedLogs.filter((log) => log.duration !== null);
		const average_duration =
			logsWithDuration.length > 0
				? logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) /
					logsWithDuration.length
				: null;

		// Calculate breakdown by source with success rate
		const sourceMap: Record<string, { total: number; success: number }> = {};
		typedLogs.forEach((log) => {
			if (log.source) {
				if (!sourceMap[log.source]) {
					sourceMap[log.source] = { total: 0, success: 0 };
				}
				sourceMap[log.source].total++;
				if (log.status === "success") {
					sourceMap[log.source].success++;
				}
			}
		});

		const source_breakdown = Object.entries(sourceMap).map(
			([source, stats]) => ({
				source,
				count: stats.total,
				success_rate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
			})
		);

		const top_sources = [...source_breakdown]
			.sort((a, b) => b.count - a.count)
			.slice(0, 3)
			.map((item) => ({
				...item,
				percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
			}));

		return {
			total,
			success,
			failed,
			average_duration,
			source_breakdown,
			top_sources,
		};
	}

	// Helper method to log scraping operations
	// Params type for logScrapingOperation

	async logScrapingOperation(
		params: LogScrapingOperationParams
	): Promise<ScraperLog> {
		const { source, url, startTime, endTime, success, error } = params;
		const duration = endTime.getTime() - startTime.getTime();

		return this.createScraperLog({
			timestamp: startTime.toISOString(),
			source,
			url,
			duration,
			status: success ? "success" : "fail",
			error: error || null,
		});
	}

	// Helper method to get recent logs for a specific source
	async getRecentLogsBySource(
		source: ScraperSource,
		limit = 10
	): Promise<ScraperLog[]> {
		return this.getScraperLogs({
			source,
			limit,
		});
	}

	// Helper method to get failed logs that might need retry
	async getFailedLogs(filters?: {
		source?: ScraperSource;
		since?: string;
	}): Promise<ScraperLog[]> {
		const logFilters: ScraperLogFilters = {
			status: "fail",
			source: filters?.source,
		};

		if (filters?.since) {
			logFilters.date_range = {
				start: filters.since,
				end: new Date().toISOString(),
			};
		}

		return this.getScraperLogs(logFilters);
	}
}

export const scraperLogsService = new ScraperLogsService();
