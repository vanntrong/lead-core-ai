import { createAdminClient } from "@/lib/supabase/admin";
import type {
	Lead,
	LeadFilters,
	LeadScrapInfo,
	PaginatedLeadResponse,
} from "@/types/lead";

export class LeadAdminService {
	private async getSupabaseClient() {
		return createAdminClient();
	}

	async flagLead(id: string): Promise<Lead> {
		const supabase = await this.getSupabaseClient();
		const { data: updatedLead, error } = await supabase
			.from("leads")
			.update({ flagged: true })
			.eq("id", id)
			.select("*")
			.single();
		if (error) {
			console.error("Error flagging lead (admin):", error);
			throw new Error(`Failed to flag lead: ${error.message}`);
		}
		return updatedLead;
	}

	async getLeadsPaginated(
		filters: LeadFilters = {}
	): Promise<PaginatedLeadResponse> {
		const supabase = await this.getSupabaseClient();

		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;

		// Build data query
		let query = supabase.from("leads").select("*");

		// Build count query (head:true for faster count)
		let countQuery = supabase
			.from("leads")
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
		if (filters.verify_email_status) {
			query = query.eq("verify_email_status", filters.verify_email_status);
			countQuery = countQuery.eq(
				"verify_email_status",
				filters.verify_email_status
			);
		}
		if (filters.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			const searchFilter = `url.ilike.${searchTerm}`;
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

		// Apply pagination and ordering
		query = query
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		const [{ data, error }, { count, error: countError }] = await Promise.all([
			query,
			countQuery,
		]);

		if (error) {
			console.error("Error fetching paginated leads:", error);
			throw new Error(`Failed to fetch paginated leads: ${error.message}`);
		}

		if (countError) {
			console.error("Error fetching leads count:", countError);
			throw new Error(`Failed to fetch leads count: ${countError.message}`);
		}

		const totalCount = count ?? 0;
		const totalPages = Math.ceil(totalCount / limit);

		return {
			data: (data ?? []).map((lead) => ({
				...lead,
				scrap_info:
					typeof lead.scrap_info === "string"
						? JSON.parse(lead.scrap_info)
						: (lead.scrap_info as LeadScrapInfo | null),
			})),
			totalCount,
			currentPage: page,
			totalPages,
			itemsPerPage: limit,
		};
	}

	async updateLead(data: Partial<Lead> & { id: string }): Promise<Lead> {
		const supabase = await this.getSupabaseClient();
		const { id, ...updateData } = data;
		const { data: updatedLead, error } = await supabase
			.from("leads")
			.update(updateData)
			.eq("id", id)
			.select("*")
			.single();
		if (error) {
			console.error("Error updating lead (admin):", error);
			throw new Error(`Failed to update lead: ${error.message}`);
		}
		return updatedLead;
	}

	async deleteLead(id: string): Promise<void> {
		const supabase = await this.getSupabaseClient();
		const { data: lead } = await supabase
			.from("leads")
			.select("id")
			.eq("id", id)
			.single();
		if (!lead) {
			throw new Error("Lead not found");
		}
		const { error } = await supabase.from("leads").delete().eq("id", id);
		if (error) {
			console.error("Error deleting lead (admin):", error);
			throw new Error(`Failed to delete lead: ${error.message}`);
		}
	}
}

export const leadAdminService = new LeadAdminService();
