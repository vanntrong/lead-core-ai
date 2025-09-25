import { createAdminClient } from "@/lib/supabase/admin";
import { PaginatedProxyHealCheckLogResponse, ProxyHealCheckLog, ProxyHealCheckLogFilters, ProxyHealCheckLogStatus } from "@/types/proxy_heal_check_log";

export interface LogProxyHealCheckOperationParams {
  proxy_host: string;
  proxy_port: number;
  proxy_ip?: string | null;
  startTime: Date;
  endTime: Date;
  status: ProxyHealCheckLogStatus;
  error?: string | null;
}

export class ProxyHealCheckLogsAdminService {
  private async getSupabaseClient() {
    return createAdminClient();
  }

  async createLog(data: Partial<ProxyHealCheckLog>): Promise<ProxyHealCheckLog> {
    const supabase = await this.getSupabaseClient();
    const { data: newLog, error } = await supabase
      .from("proxy_heal_check_logs")
      .insert({
        created_at: data.created_at || new Date().toISOString(),
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
      console.error("Error creating proxy heal check log (admin):", error);
      throw new Error(`Failed to create proxy heal check log: ${error.message}`);
    }
    return newLog;
  }

  async updateLog(data: Partial<ProxyHealCheckLog> & { id: string }): Promise<ProxyHealCheckLog> {
    const supabase = await this.getSupabaseClient();
    const { id, ...updateData } = data;
    const { data: updatedLog, error } = await supabase
      .from("proxy_heal_check_logs")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating proxy heal check log (admin):", error);
      throw new Error(`Failed to update proxy heal check log: ${error.message}`);
    }
    return updatedLog;
  }

  async deleteLog(id: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    const { data: log } = await supabase
      .from("proxy_heal_check_logs")
      .select("id")
      .eq("id", id)
      .single();
    if (!log) {
      throw new Error("Proxy heal check log not found");
    }
    const { error } = await supabase.from("proxy_heal_check_logs").delete().eq("id", id);
    if (error) {
      console.error("Error deleting proxy heal check log (admin):", error);
      throw new Error(`Failed to delete proxy heal check log: ${error.message}`);
    }
  }

  async getLogById(id: string): Promise<ProxyHealCheckLog | null> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("proxy_heal_check_logs")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching proxy heal check log (admin):", error);
      throw new Error(`Failed to fetch proxy heal check log: ${error.message}`);
    }
    return data;
  }

  async getLogsPaginated(filters: ProxyHealCheckLogFilters = {}): Promise<PaginatedProxyHealCheckLogResponse> {
    const supabase = await this.getSupabaseClient();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    let query = supabase.from("proxy_heal_check_logs").select("*");
    let countQuery = supabase.from("proxy_heal_check_logs").select("*", { count: "exact", head: true });
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
      const searchFilter = `proxy_host.ilike.${searchTerm},error.ilike.${searchTerm}`;
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
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      query,
      countQuery,
    ]);
    if (error) {
      console.error("Error fetching paginated proxy heal check logs (admin):", error);
      throw new Error(`Failed to fetch paginated proxy heal check logs: ${error.message}`);
    }
    if (countError) {
      console.error("Error fetching proxy heal check logs count (admin):", countError);
      throw new Error(`Failed to fetch proxy heal check logs count: ${countError.message}`);
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

  async getLogs(filters?: ProxyHealCheckLogFilters): Promise<ProxyHealCheckLog[]> {
    const supabase = await this.getSupabaseClient();
    let query = supabase.from("proxy_heal_check_logs").select("*");
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.proxy_host) {
      query = query.eq("proxy_host", filters.proxy_host);
    }
    if (filters?.proxy_port) {
      query = query.eq("proxy_port", filters.proxy_port);
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      query = query.or(
        `proxy_host.ilike.${searchTerm},error.ilike.${searchTerm}`
      );
    }
    if (filters?.date_range) {
      query = query.gte("created_at", filters.date_range.start).lte("created_at", filters.date_range.end);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching proxy heal check logs (admin):", error);
      throw new Error(`Failed to fetch proxy heal check logs: ${error.message}`);
    }
    return data ?? [];
  }

  async getLogStats(): Promise<{ total: number; success: number; failed: number; host_breakdown: Array<{ proxy_host: string; count: number; success_rate: number }> }> {
    const supabase = await this.getSupabaseClient();
    const { data: logs, error } = await supabase
      .from("proxy_heal_check_logs")
      .select("*");
    if (error) {
      console.error("Error fetching proxy heal check log stats (admin):", error);
      throw new Error(`Failed to fetch proxy heal check log stats: ${error.message}`);
    }
    const typedLogs = (logs ?? []) as ProxyHealCheckLog[];
    const total = typedLogs.length;
    const success = typedLogs.filter((log) => log.status === "success").length;
    const failed = typedLogs.filter((log) => log.status === "failed").length;
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
    const host_breakdown = Object.entries(hostMap).map(([proxy_host, stats]) => ({
      proxy_host,
      count: stats.total,
      success_rate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
    }));
    return {
      total,
      success,
      failed,
      host_breakdown,
    };
  }

  async getRecentLogsByHost(proxy_host: string, limit: number = 10): Promise<ProxyHealCheckLog[]> {
    return this.getLogs({
      proxy_host,
      limit,
    });
  }

  async getFailedLogs(filters?: { proxy_host?: string; since?: string }): Promise<ProxyHealCheckLog[]> {
    const logFilters: ProxyHealCheckLogFilters = {
      status: "failed",
      proxy_host: filters?.proxy_host,
    };
    if (filters?.since) {
      logFilters.date_range = {
        start: filters.since,
        end: new Date().toISOString(),
      };
    }
    return this.getLogs(logFilters);
  }

  async logProxyHealCheckOperation(params: LogProxyHealCheckOperationParams): Promise<ProxyHealCheckLog> {
    const { proxy_host, proxy_port, proxy_ip, startTime, endTime, status, error } = params;
    const duration = endTime.getTime() - startTime.getTime();
    return this.createLog({
      proxy_host,
      proxy_port,
      proxy_ip,
      duration,
      status,
      error: error || null,
    });
  }
}

export const proxyHealCheckLogsAdminService = new ProxyHealCheckLogsAdminService();
