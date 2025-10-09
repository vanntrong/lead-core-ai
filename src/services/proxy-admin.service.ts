import { createAdminClient } from "@/lib/supabase/admin";
import type {
	PaginatedProxyResponse,
	Proxy,
	ProxyFilters,
} from "@/types/proxy";

export class ProxyAdminService {
	async getProxyById(id: string): Promise<Proxy | null> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("proxies")
			.select("*")
			.eq("id", id)
			.single();
		if (error) {
			if (error.code === "PGRST116") {
				return null; // Proxy not found
			}
			console.error("Error fetching proxy:", error);
			throw new Error(`Failed to fetch proxy: ${error.message}`);
		}

		if (!data) { return null; }

		return data;
	}
	private index = 0;
	private async getSupabaseClient() {
		return createAdminClient();
	}

	async getNextProxy(): Promise<Proxy | null> {
		const supabase = await this.getSupabaseClient();
		// Get count of active proxies
		const { count, error: countError } = await supabase
			.from("proxies")
			.select("id", { count: "exact", head: true })
			.eq("status", "active");
		if (countError || !count) { return null; }
		// Use round-robin offset
		const offset = this.index % count;
		const { data, error } = await supabase
			.from("proxies")
			.select("*")
			.eq("status", "active")
			.order("updated_at", { ascending: false })
			.range(offset, offset);
		if (error || !data?.length) { return null; }
		this.index = (this.index + 1) % count;
		return data[0] as Proxy;
	}

	async getProxiesPaginated(
		filters: ProxyFilters = {}
	): Promise<PaginatedProxyResponse> {
		const supabase = await this.getSupabaseClient();
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;
		let query = supabase.from("proxies").select("*");
		let countQuery = supabase
			.from("proxies")
			.select("*", { count: "exact", head: true });
		if (filters.status) {
			query = query.eq("status", filters.status);
			countQuery = countQuery.eq("status", filters.status);
		}
		if (filters.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			query = query.or(`host.ilike.${searchTerm}`);
			countQuery = countQuery.or(`host.ilike.${searchTerm}`);
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
			console.error("Error fetching paginated proxies:", error);
			throw new Error(`Failed to fetch paginated proxies: ${error.message}`);
		}
		if (countError) {
			console.error("Error fetching proxies count:", countError);
			throw new Error(`Failed to fetch proxies count: ${countError.message}`);
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

	async updateProxy(data: Partial<Proxy> & { id: string }): Promise<Proxy> {
		const supabase = await this.getSupabaseClient();
		const { id, ...updateData } = data;
		const { data: updatedProxy, error } = await supabase
			.from("proxies")
			.update(updateData)
			.eq("id", id)
			.select("*")
			.single();
		if (error) {
			console.error("Error updating proxy (admin):", error);
			throw new Error(`Failed to update proxy: ${error.message}`);
		}
		return updatedProxy;
	}

	async deleteProxy(id: string): Promise<void> {
		const supabase = await this.getSupabaseClient();
		const { data: proxy } = await supabase
			.from("proxies")
			.select("id")
			.eq("id", id)
			.single();
		if (!proxy) {
			throw new Error("Proxy not found");
		}
		const { error } = await supabase.from("proxies").delete().eq("id", id);
		if (error) {
			console.error("Error deleting proxy (admin):", error);
			throw new Error(`Failed to delete proxy: ${error.message}`);
		}
	}
}

export const proxyAdminService = new ProxyAdminService();
