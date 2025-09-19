"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { LeadFiltersComponent } from "@/components/leads/lead-filters";
import LeadList from "@/components/leads/lead-list";
import { LeadStatsCards } from "@/components/leads/lead-stats";
import { useLeadsPaginated, useLeadStats } from "@/hooks/use-leads";
import { cn } from "@/lib/utils";
import { LeadFilters } from "@/types/lead";

export default function Page() {
	return (
		<Suspense>
			<LeadBoardPage />
		</Suspense>
	);
}

function LeadBoardPage() {
	const [filters, setFilters] = useState<LeadFilters>();
	const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);

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
		error: loadsError,
		isFetching: isFetchingLeads,
		refetch: refetchLoads,
	} = useLeadsPaginated(paginatedFilters);
	const {
		data: stats,
		isFetching: statsLoading,
		refetch: refetchStats,
	} = useLeadStats();
	// const generateMockLoads = useGenerateMockLoads();

	// Calculate filtered count for display
	const totalCount = paginatedResponse?.totalCount || 0;
	const filteredCount = paginatedResponse?.totalCount || 0;

	const handleCreateLead = () => {
		setIsAddLeadDialogOpen(true);
	};

	const handleRefresh = async () => {
		await Promise.all([refetchLoads(), refetchStats()]);
		toast.success("Load board refreshed");
	};

	const MOCK_LOAD_COUNT = 20;

	const handleGenerateMockData = async () => {
		try {
			// await generateMockLoads.mutateAsync(MOCK_LOAD_COUNT);
			toast.success(`Generated ${MOCK_LOAD_COUNT} mock loads`);
		} catch {
			toast.error("Failed to generate mock loads");
		}
	};

	return (
		<DashboardLayout>
			<div className="border-gray-200 border-b bg-white">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div>
							<h1 className="font-bold text-gray-900 text-xl">
								Lead Management
							</h1>
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
							{/* {
								(paginatedResponse?.totalCount ?? 0) <= 0 && (
									<Button
										className="h-9"
										disabled={generateMockLoads.isPending}
										onClick={handleGenerateMockData}
										size="sm"
										variant="outline"
									>
										{generateMockLoads.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										{generateMockLoads.isPending
											? "Generating..."
											: "Generate Mock Data"}
									</Button>
								)
							} */}
							<Button
								className="h-9 bg-indigo-600 hover:bg-indigo-700"
								onClick={handleCreateLead}
								size="sm"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Load
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h2 className="mb-2 font-bold text-3xl text-gray-900">
						Your Lead Overview
					</h2>
					<p className="text-gray-600 text-lg">
						See, verify, and act on leads—fast.
					</p>
				</div>
				{/* Stats Cards */}
				<LeadStatsCards isLoading={statsLoading} stats={stats} />

				{/* Filters */}
				<LeadFiltersComponent
					filteredCount={filteredCount}
					filters={filters ?? {}}
					onFiltersChange={setFilters}
					totalCount={totalCount}
				/>

				{/* Load Table */}
				<div className="space-y-4">
					<LeadList
						error={loadsError}
						filters={filters ?? {}}
						isFetching={isFetchingLeads}
						isLoading={isLoadingLeads}
						// isMockDataGenerating={generateMockLoads.isPending}
						onCreateLead={handleCreateLead}
						onGenerateMockData={handleGenerateMockData}
						pagination={{
							currentPage,
							itemsPerPage,
							handlePageChange,
							handleItemsPerPageChange,
						}}
						response={paginatedResponse!}
					/>
				</div>
			</div>

			{/* Add Lead Dialog */}
			<AddLeadDialog
				isOpen={isAddLeadDialogOpen}
				onClose={() => setIsAddLeadDialogOpen(false)}

			/>
		</DashboardLayout>
	);
}
