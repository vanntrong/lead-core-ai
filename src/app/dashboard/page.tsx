"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import pricingPlans from "@/config/pricing-plans.json";
import { useLeadStats } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Brain,
	CheckCircle2,
	Globe,
	Package,
	RefreshCw
} from "lucide-react";

export default function Dashboard() {
	const { data: activeSubscription, isLoading, error } = useUserActiveSubscription();
	const {
		data: stats,
		isLoading: statsLoading,
		isFetching: statsFetching,
		refetch: refetchStats,
	} = useLeadStats();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">
						Loading your subscription data...
					</p>
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
			{/* Top Header Bar */}
			<div className="hidden border-gray-200 border-b bg-white lg:block">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="font-bold text-gray-900 text-xl">Dashboard</h1>
							{_subscription && (
								<Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
									{mappedPlan?.name}
								</Badge>
							)}
						</div>

						<div className="flex items-center space-x-3">
							<Button
								className="h-9"
								disabled={statsFetching || statsLoading}
								onClick={() => refetchStats()}
								size="sm"
								variant="outline"
							>
								<RefreshCw
									className={cn("mr-2 h-4 w-4", {
										"animate-spin": statsFetching || statsLoading,
									})}
								/>
								Refresh
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="mb-2 font-bold text-3xl text-gray-900">
						Good morning! 👋
					</h2>
					<p className="text-gray-600 text-lg">
						AI-powered lead generation made simple.
					</p>
				</div>

				{/* Premium Insights - Compact Top Section */}
				<div className="mb-8 rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600">
								<span className="text-white font-bold text-base">AI</span>
							</div>
							<div>
								<h3 className="font-bold text-gray-900 text-lg">Premium Insights</h3>
								<p className="text-gray-600 text-sm">Enhanced lead intelligence for smarter decisions</p>
							</div>
							<Badge className="flex items-center gap-1 bg-purple-100 text-purple-700 border-purple-200 text-sm px-3 py-1 font-medium">
								<span className="text-lg mr-2">🚀</span>
								<span>Coming Soon</span>
							</Badge>
						</div>

						<div className="flex items-center space-x-6">
							<div className="text-center">
								<div className="flex items-center space-x-2">
									<BarChart3 className="h-4 w-4 text-green-600" />
									<span className="font-semibold text-gray-900 text-sm">SpyFu Snapshot</span>
								</div>
								<div className="mt-1 flex items-center justify-center space-x-1">
									<span className="font-bold text-orange-600 text-base">25 $TOWN</span>
								</div>
							</div>

							<div className="h-8 w-px bg-gray-300" />

							<div className="text-center">
								<div className="flex items-center space-x-2">
									<span className="text-lg">🤖</span>
									<span className="font-semibold text-gray-900 text-sm">Claude Boost</span>
								</div>
								<div className="mt-1 flex items-center justify-center space-x-1">
									<span className="font-bold text-purple-600 text-base">50 $TOWN</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid - Enhanced SaaS UI */}
				<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{statsLoading || statsFetching ? (
						// Skeleton loading state
						[...Array(4)].map((_, i) => (
							<div key={i} className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5">
								<div className="mb-3 flex items-start justify-between">
									<Skeleton className="h-10 w-10 rounded-lg" />
									<Skeleton className="h-4 w-16" />
								</div>
								<Skeleton className="mb-1 h-8 w-20" />
								<Skeleton className="h-4 w-24" />
							</div>
						))
					) : (
						// Actual stats content
						[
							{
								icon: Globe,
								label: "LEADS",
								value: stats?.total || 0,
								title: "Total Leads",
								colors: "from-indigo-500 to-purple-600",
								hoverColor: "text-indigo-700",
								bgGradient: "from-indigo-50 to-purple-50"
							},
							{
								icon: Brain,
								label: "AI",
								value: stats?.enriched || 0,
								title: "AI Enriched",
								colors: "from-emerald-500 to-green-600",
								hoverColor: "text-emerald-700",
								bgGradient: "from-emerald-50 to-green-50"
							},
							{
								icon: CheckCircle2,
								label: "VERIFIED",
								value: stats?.verified_email || 0,
								title: "Verified Emails",
								colors: "from-purple-500 to-violet-600",
								hoverColor: "text-purple-700",
								bgGradient: "from-purple-50 to-violet-50"
							},
							{
								icon: Package,
								label: "QUALITY",
								value: stats?.score_70_plus || 0,
								title: "High Quality (≥70)",
								colors: "from-orange-500 to-amber-600",
								hoverColor: "text-orange-700",
								bgGradient: "from-orange-50 to-amber-50"
							}
						].map((stat, i) => {
							const Icon = stat.icon;
							return (
								<div key={i} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
									<div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
									<div className="relative">
										<div className="mb-3 flex items-start justify-between">
											<div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.colors} shadow-sm`}>
												<Icon className="h-5 w-5 text-white" />
											</div>
											<div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{stat.label}</div>
										</div>
										<div className={`mb-1 font-bold text-2xl text-gray-900 group-hover:${stat.hoverColor} transition-colors duration-300`}>{stat.value}</div>
										<p className="text-gray-600 text-sm font-medium">{stat.title}</p>
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* Lead Source Breakdown - Enhanced SaaS UI */}
				<div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h3 className="font-bold text-xl text-gray-900">Lead Sources</h3>
							<p className="text-gray-500 text-sm">Breakdown by platform</p>
						</div>
						{statsLoading || statsFetching ? (
							<Skeleton className="h-6 w-32" />
						) : (
							<Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
								{(stats?.source_breakdown ?? []).length} Active Sources
							</Badge>
						)}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{statsLoading || statsFetching ? (
							// Skeleton for source breakdown
							[...Array(4)].map((_, i) => (
								<div key={i} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 border border-gray-200">
									<div className="flex items-center gap-4">
										<Skeleton className="h-12 w-12 rounded-xl" />
										<div className="flex-1">
											<Skeleton className="h-5 w-20 mb-2" />
											<Skeleton className="h-4 w-16" />
										</div>
										<div className="text-right">
											<Skeleton className="h-6 w-8 mb-1" />
											<Skeleton className="h-3 w-12" />
										</div>
									</div>
								</div>
							))
						) : (
							// Actual source breakdown
							<>
								{(stats?.source_breakdown ?? []).map((item) => (
									<div key={item.source} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200">
										<div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										<div className="relative flex items-center gap-4">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow duration-300">
												{item.source === "shopify" && <Globe className="h-6 w-6 text-indigo-600" />}
												{item.source === "woocommerce" && <Package className="h-6 w-6 text-orange-600" />}
												{item.source === "g2" && <BarChart3 className="h-6 w-6 text-emerald-600" />}
												{item.source === "etsy" && <Brain className="h-6 w-6 text-purple-600" />}
											</div>
											<div className="flex-1">
												<div className="font-bold text-gray-900 text-lg capitalize group-hover:text-indigo-700 transition-colors duration-300">
													{item.source}
												</div>
												<div className="text-gray-500 text-sm">Platform</div>
											</div>
											<div className="text-right">
												<div className="font-bold text-2xl text-indigo-700 group-hover:text-indigo-800 transition-colors duration-300">
													{item.count}
												</div>
												<div className="text-gray-500 text-xs">leads</div>
											</div>
										</div>
									</div>
								))}
								{(stats?.source_breakdown ?? []).length === 0 && (
									<div className="col-span-full text-center py-8">
										<div className="text-gray-400 text-lg mb-2">📊</div>
										<p className="text-gray-500">No lead sources yet</p>
										<p className="text-gray-400 text-sm">Start adding leads to see breakdown</p>
									</div>
								)}
							</>
						)}
					</div>
				</div>

				<p className="text-center text-gray-500 text-sm">
					© {new Date().getFullYear()} LeadCore AI. Powered by $TOWN.
				</p>
			</div>
		</DashboardLayout>
	);
}
