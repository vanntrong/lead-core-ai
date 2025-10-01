"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { LeadFiltersComponent } from "@/components/leads/lead-filters";
import LeadList from "@/components/leads/lead-list";
import { LeadStatsCards } from "@/components/leads/lead-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination";
import pricingPlans from "@/config/pricing-plans.json";
import { useGenerateMockLeads, useLeadsPaginated, useLeadStats } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { LeadFilters } from "@/types/lead";
import { useRouter } from "@bprogress/next/app";
import { Crown, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

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
	const { data: activeSubscription, isLoading, error } = useUserActiveSubscription();

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
		refetch: refetchLeads,
	} = useLeadsPaginated(paginatedFilters);
	const {
		data: stats,
		isLoading: statsLoading,
		refetch: refetchStats,
	} = useLeadStats();
	const generateMockLeads = useGenerateMockLeads();
	const router = useRouter();
	const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
	const [isRefetchingStats, setIsRefetchingStats] = useState(false);

	// Calculate filtered count for display
	const totalCount = paginatedResponse?.totalCount || 0;
	const filteredCount = paginatedResponse?.totalCount || 0;

	const handleCreateLead = () => {
		setIsAddLeadDialogOpen(true);
	};

	const handleRefresh = async () => {
		setIsRefreshingLeads(true);
		setIsRefetchingStats(true);
		// Refetch leads and stats in parallel
		await Promise.all([
			refetchLeads().then(() => setIsRefreshingLeads(false)),
			refetchStats().then(() => setIsRefetchingStats(false))
		]);
		// Wait for both refetches to complete
		toast.success("Lead board refreshed");
	};

	const handleGenerateMockData = async () => {
		try {
			const result = await generateMockLeads.mutateAsync();
			if (result.success) {
				toast.success(`Generated 2 mock leads`);
			} else {
				toast.error(result.message);
			}
		} catch {
			toast.error("Failed to generate mock leads");
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Loading subscription data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl">Error Loading Dashboard</h1>
					<p className="mb-6 text-muted-foreground">
						Failed to load your subscription data.
					</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	const _subscription = activeSubscription;
	// Map subscription to plan from pricingPlans
	const mappedPlan = _subscription
		? pricingPlans.find(
			(plan) =>
				plan.tier === _subscription.plan_tier
		)
		: null;

	return (
		<DashboardLayout planName={mappedPlan?.name}>
			<div className="border-gray-200 border-b bg-white">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="font-bold text-gray-900 text-xl">Lead Management</h1>
							{_subscription && (
								<Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
									{mappedPlan?.name}
								</Badge>
							)}
						</div>
						<div className="flex items-center space-x-3">
							<Button
								className="h-9"
								disabled={isLoadingLeads || isRefreshingLeads || isRefetchingStats}
								onClick={handleRefresh}
								size="sm"
								variant="outline"
							>
								<RefreshCw
									className={cn("mr-2 h-4 w-4", {
										"animate-spin": isLoadingLeads || isRefreshingLeads || isRefetchingStats,
									})}
								/>
								Refresh
							</Button>
							{_subscription ? (
								<Button
									className="h-9 bg-indigo-600 hover:bg-indigo-700"
									onClick={handleCreateLead}
									size="sm"
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Load
								</Button>
							) : (
								<Button
									className="h-9 from-indigo-600 to-purple-600"
									onClick={() => router.push('/pricing')}
									size="sm"
								>
									<Crown className="mr-2 h-4 w-4 text-yellow-300" />
									Upgrade to add leads
								</Button>
							)}
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
				<LeadStatsCards isLoading={statsLoading || isRefetchingStats} stats={stats} />

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
						error={leadsError}
						filters={filters ?? {}}
						isFetching={isLoadingLeads || isRefreshingLeads}
						isLoading={isLoadingLeads}
						isMockDataGenerating={generateMockLeads.isPending}
						isShowUpgradeButton={!_subscription}
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

				<footer className="mt-12 border-t border-gray-200 pt-6">
					<nav className="mb-4 flex flex-wrap justify-center gap-4 text-gray-600 text-sm font-medium">
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

			{/* Add Lead Dialog */}
			<AddLeadDialog
				isOpen={isAddLeadDialogOpen}
				onClose={() => setIsAddLeadDialogOpen(false)}
				onLeadAdded={handleRefresh}
			/>
		</DashboardLayout>
	);
}
