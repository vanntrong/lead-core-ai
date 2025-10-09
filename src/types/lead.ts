import type { Database } from "../../database.types";

export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type LeadSource = Database["public"]["Enums"]["lead_source"];
export type LeadVerifyEmailStatus =
	Database["public"]["Enums"]["verify_email_status"];

// Base lead type from database
export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

// Extended lead type for UI
// Raw scraping info stored in leads.scrap_info (source-agnostic, optional fields)
export interface LeadScrapInfo {
	// main meta description (for direct access)
	desc?: string;
	// main page title (for direct access)
	title?: string;
	// detected emails (for direct access)
	emails?: string[];
}

export interface LeadEnrichInfo {
	summary: string;
	title_guess: string;
}

export interface VerifyEmailInfo {
	input_email: string;
	status: "valid" | "invalid" | "unknown";
	risk?: string;
	result?: string;
}

export interface Lead
	extends Omit<LeadRow, "scrap_info" | "enrich_info" | "verify_email_info"> {
	scrap_info: LeadScrapInfo | null;
	enrich_info: LeadEnrichInfo | null;
	verify_email_info?: VerifyEmailInfo[];
}

// Lead creation data
export interface CreateLeadData {
	url: string;
	source: LeadSource;
}

// Lead update data
export interface UpdateLeadData extends Partial<LeadRow> {
	id: string;
}

// Lead filters for search and filtering
export interface LeadFilters {
	status?: LeadStatus;
	source?: LeadSource;
	verify_email_status?: LeadVerifyEmailStatus;
	search?: string; // Search across url, source, status
	flagged?: boolean;
	date_range?: {
		start: string;
		end: string;
	};
	page?: number;
	limit?: number;
}

export interface PaginatedLeadResponse {
	data: Lead[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
}

export interface LeadSourceBreakdownItem {
	source: string;
	count: number;
}

export interface LeadStats {
	total: number; // Total leads
	verified_email: number; // Leads with verified email
	enriched: number; // Leads enriched
	score_70_plus: number; // Leads with score >= 70
	score_90_plus: number; // Leads with score >= 90
	error: number; // Leads in error state
	source_breakdown?: LeadSourceBreakdownItem[];
}
