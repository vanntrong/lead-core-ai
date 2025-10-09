import { TWO_MINUTES } from "@/constants";
import {
	getInvoicesAction,
	getInvoicesPaginatedAction,
} from "@/lib/actions/invoice.actions";
import type { InvoiceFilters } from "@/types/invoice";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/**
 * Hook to get all invoices for the user
 */
export const invoiceKeys = {
	all: ["invoices"] as const,
	paginatedLists: () => [...invoiceKeys.all, "paginatedList"] as const,
	paginatedList: (filters?: InvoiceFilters) =>
		[...invoiceKeys.paginatedLists(), filters] as const,
};

export function useUserInvoices() {
	return useQuery({
		queryKey: invoiceKeys.all,
		queryFn: () => getInvoicesAction(),
		staleTime: TWO_MINUTES,
		placeholderData: keepPreviousData,
	});
}

export function useUserInvoicesPaginated(filters?: InvoiceFilters) {
	return useQuery({
		queryKey: invoiceKeys.paginatedList(filters),
		// invoice action expects an object; pass filters inside
		queryFn: () => getInvoicesPaginatedAction(filters),
		placeholderData: keepPreviousData,
		staleTime: TWO_MINUTES,
	});
}
