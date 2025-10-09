"use server";

import { invoiceService } from "@/services/invoice.service";
import type { InvoiceFilters } from "@/types/invoice";

export async function getInvoicesAction() {
	try {
		return await invoiceService.getUserInvoices();
	} catch (error) {
		console.error("Error in getInvoicesAction:", error);
		throw error;
	}
}

export async function getInvoicesPaginatedAction(filters?: InvoiceFilters) {
	try {
		return await invoiceService.getInvoicesPaginated(filters);
	} catch (error) {
		console.error("Error in getInvoicesPaginatedAction:", error);
		throw error;
	}
}
