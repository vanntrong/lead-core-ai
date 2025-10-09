import type { Database } from "../../database.types";

export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
export type PlanTier = Database["public"]["Enums"]["plan_tier"];

// Base invoice type from database
export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
export type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];

export interface Invoice extends InvoiceRow {}

export interface PaginatedInvoiceResponse {
	data: Invoice[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	itemsPerPage: number;
}

export interface InvoiceFilters {
	page?: number;
	limit?: number;
}
