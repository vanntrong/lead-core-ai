"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LeadFiltersComponent } from "@/components/lead-moderation/lead-filters";
import LeadList from "@/components/lead-moderation/lead-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination";
import { useLeadsPaginatedAdmin } from "@/hooks/use-lead-admin";
import { cn } from "@/lib/utils";
import type { LeadFilters } from "@/types/lead";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LeadModerationPage() {
	const [filters, setFilters] = useState<LeadFilters>();

	const {
		currentPage,
		itemsPerPage,
		handlePageChange,
		handleItemsPerPageChange,
		resetPagination,
	} = usePagination(10);

	useEffect(() => {
		resetPagination();
	}, [resetPagination]);

	// Combine filters with pagination
	const paginatedFilters: LeadFilters = {
		...filters,
		page: currentPage,
		limit: itemsPerPage,
	};

	const {
		data: paginatedResponse,
		isLoading: isLoadingLeads,
		error: leadsError,
		isFetching: isFetchingLeads,
		refetch: refetchLoads,
	} = useLeadsPaginatedAdmin(paginatedFilters);

	// Calculate filtered count for display
	const totalCount = paginatedResponse?.totalCount || 0;
	const filteredCount = paginatedResponse?.totalCount || 0;

	const handleRefresh = async () => {
		await Promise.all([refetchLoads()]);
		toast.success("Lead moderation refreshed");
	};

	return (
		<DashboardLayout planName="Admin">
			<div className="border-gray-200 border-b bg-white">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="font-bold text-gray-900 text-xl">
								Lead Moderation
							</h1>
							<Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
								Admin
							</Badge>
						</div>
						<div className="flex items-center space-x-3">
							<Button
								className="h-9"
								disabled={isFetchingLeads || isLoadingLeads}
								onClick={handleRefresh}
								size="sm"
								variant="outline"
							>
								<RefreshCw
									className={cn("mr-2 h-4 w-4", {
										"animate-spin": isFetchingLeads || isLoadingLeads,
									})}
								/>
								Refresh
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h2 className="mb-2 font-bold text-3xl text-gray-900">
						Moderate Leads
					</h2>
					<p className="text-gray-600 text-lg">
						Review, update, or delete leads as an admin.
					</p>
				</div>

				{/* Filters */}
				<LeadFiltersComponent
					filteredCount={filteredCount}
					filters={filters ?? {}}
					onFiltersChange={setFilters}
					totalCount={totalCount}
				/>

				{/* Lead List */}
				<LeadList
					error={leadsError}
					filters={filters ?? {}}
					isFetching={isFetchingLeads}
					isLoading={isLoadingLeads}
					pagination={{
						currentPage,
						itemsPerPage,
						handlePageChange,
						handleItemsPerPageChange,
					}}
					response={paginatedResponse!}
				/>
				<footer className="mt-12 border-gray-200 border-t pt-6">
					<nav className="mb-4 flex flex-wrap justify-center gap-4 font-medium text-gray-600 text-sm">
						<Link href="/">Product</Link>
						<Link href="/pricing">Pricing</Link>
						<Link href="/legal">Disclaimer</Link>
						<Link href="/about">About</Link>
						<Link href="/terms">Terms & Conditions</Link>
						<Link href="/privacy">Privacy Policy</Link>
					</nav>
					<p className="text-center text-gray-500 text-sm">
						© 2025 LeadCore AI. Powered by $TOWN.
					</p>
				</footer>
			</div>
		</DashboardLayout>
	);
}
