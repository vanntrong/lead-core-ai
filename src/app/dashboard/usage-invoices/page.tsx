"use client";
import { BarChart3, Crown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { usePagination } from "@/components/ui/pagination";
import { UpgradeButton } from "@/components/upgrade-btn";
import { CancelSubscriptionDialog } from "@/components/usage-invoices/cancel-subscription-dialog";
import InvoiceList from "@/components/usage-invoices/invoice-list";
import { UsageOverview } from "@/components/usage-invoices/usage-overview";
import pricingPlans from "@/config/pricing-plans";
import { useUserInvoicesPaginated } from "@/hooks/use-invoice";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import type { InvoiceFilters } from "@/types/invoice";

export default function UsageAndInvoicesPage() {
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const {
		data: activeSubscription,
		isLoading,
		error,
	} = useUserActiveSubscription();

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
	const paginatedFilters: InvoiceFilters = {
		page: currentPage,
		limit: itemsPerPage,
	};

	const {
		data: paginatedResponse,
		isLoading: isLoadingLeads,
		error: loadsError,
		isFetching: isFetchingLeads,
		refetch: refetchLoads,
	} = useUserInvoicesPaginated(paginatedFilters);

	const _subscription = activeSubscription;
	// Map subscription to plan from pricingPlans
	const mappedPlan = _subscription
		? pricingPlans.find((plan) => plan.tier === _subscription.plan_tier)
		: null;

	let _planColor = "text-gray-900";
	if (mappedPlan?.tier === "basic") {
		_planColor = "text-gray-500";
	} else if (mappedPlan?.tier === "pro") {
		_planColor = "text-indigo-500";
	} else if (mappedPlan?.tier === "unlimited") {
		_planColor = "text-purple-500";
	}

	if (isLoading && !activeSubscription) {
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

	return (
		<DashboardLayout planName={mappedPlan?.name}>
			<div className="border-gray-200 border-b bg-white">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="font-bold text-gray-900 text-xl">
								Usage & Billing
							</h1>
							{_subscription && (
								<Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
									{mappedPlan?.name}
								</Badge>
							)}
						</div>
						<div className="flex items-center space-x-3">
							{activeSubscription &&
								["trial", "basic", "pro"].includes(
									activeSubscription?.plan_tier ?? "basic"
								) && (
									<UpgradeButton
										className="flex-1"
										currentPlan={activeSubscription?.plan_tier ?? "trial"}
										title="Upgrade usage"
									/>
								)}
							{activeSubscription && mappedPlan?.tier !== "trial" && (
								<CancelSubscriptionDialog />
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Update Usage Dialog - SaaS Standard UI */}
			<Dialog onOpenChange={setShowUpdateDialog} open={showUpdateDialog}>
				<DialogContent className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
					<DialogHeader className="flex flex-col items-center text-center">
						<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
							<Crown className="h-7 w-7 text-yellow-300" />
						</div>
						<DialogTitle className="font-bold text-2xl text-gray-900">
							Change Your Usage Plan
						</DialogTitle>
						<DialogDescription className="mt-2 text-base text-gray-600">
							Want to upgrade or switch your plan? Just follow these simple
							steps below.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-4 mb-6">
						<ol className="list-decimal space-y-2 pl-6 text-base text-gray-700">
							<li>
								<span className="font-medium text-indigo-600">
									Cancel your current subscription
								</span>{" "}
								using the{" "}
								<span className="font-semibold">Cancel Subscription</span>{" "}
								button.
							</li>
							<li>
								<span className="font-medium text-purple-600">
									Go to the Pricing page
								</span>{" "}
								and choose your new plan.
							</li>
							<li>
								<span className="font-medium text-green-600">
									Complete checkout
								</span>{" "}
								to activate your new subscription instantly.
							</li>
						</ol>
					</div>
					<DialogFooter className="flex flex-col gap-2">
						<Button
							className="h-10 w-full"
							onClick={() => setShowUpdateDialog(false)}
							variant="outline"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h2 className="mb-2 font-bold text-3xl text-gray-900">
						Plan Usage & Billing
					</h2>
					<p className="text-gray-600 text-lg">
						Monitor your usage and billing history.
					</p>
				</div>

				{/* Premium Insights - Compact Top Section */}
				<div className="mb-8 rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
								<span className="font-bold text-base text-white">AI</span>
							</div>
							<div>
								<h3 className="font-bold text-gray-900 text-lg">
									Premium Insights
								</h3>
								<p className="text-gray-600 text-sm">
									Enhanced lead intelligence for smarter decisions
								</p>
							</div>
							<Badge className="flex items-center gap-1 border-purple-200 bg-purple-100 px-3 py-1 font-medium text-purple-700 text-sm">
								<span className="mr-2 text-lg">🚀</span>
								<span>Coming Soon</span>
							</Badge>
						</div>

						<div className="flex items-center space-x-6">
							<div className="text-center">
								<div className="flex items-center space-x-2">
									<BarChart3 className="h-4 w-4 text-green-600" />
									<span className="font-semibold text-gray-900 text-sm">
										SpyFu Snapshot
									</span>
								</div>
								<div className="mt-1 flex items-center justify-center space-x-1">
									<span className="font-bold text-base text-orange-600">
										25 $TOWN
									</span>
								</div>
							</div>

							<div className="h-8 w-px bg-gray-300" />

							<div className="text-center">
								<div className="flex items-center space-x-2">
									<span className="text-lg">🤖</span>
									<span className="font-semibold text-gray-900 text-sm">
										Claude Boost
									</span>
								</div>
								<div className="mt-1 flex items-center justify-center space-x-1">
									<span className="font-bold text-base text-purple-600">
										50 $TOWN
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Usage Overview */}
				<UsageOverview activeSubscription={activeSubscription} />

				{/* Invoice Table Section */}
				<div className="space-y-2">
					<div className="flex items-center justify-between pt-2 pb-4">
						<h3 className="font-semibold text-gray-900 text-lg">Invoices</h3>
						<div className="ml-4 flex-1 border-gray-200 border-t" />
					</div>
					<InvoiceList
						error={loadsError}
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
				</div>
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
