"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import pricingPlans from "@/config/pricing-plans.json";
import { useLeadStats } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import {
	BarChart3,
	Bell,
	Brain,
	CheckCircle2,
	Globe,
	Package,
	Route,
	Settings,
	TrendingUp,
	Users
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
	const { data: activeSubscription, isLoading, error } = useUserActiveSubscription();
	const {
		data: stats,
		isFetching: statsLoading,
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
							<Button className="relative" size="sm" variant="ghost">
								<Bell className="h-4 w-4" />
								<span className="-right-1 -top-1 absolute h-2 w-2 rounded-full bg-red-500" />
							</Button>

							<Link href="/settings">
								<Button
									className="flex items-center gap-2"
									size="sm"
									variant="outline"
								>
									<Settings className="h-4 w-4" />
									Settings
								</Button>
							</Link>
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

				{/* Stats Grid */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
								<Globe className="h-6 w-6 text-blue-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">{stats?.total}</div>
						<p className="text-gray-600 text-sm">Total leads</p>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
								<Brain className="h-6 w-6 text-green-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">{stats?.enriched}</div>
						<p className="text-gray-600 text-sm">Enriched</p>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
								<CheckCircle2 className="h-6 w-6 text-purple-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">{stats?.verified_email}</div>
						<p className="text-gray-600 text-sm">Verified Email</p>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
								<Package className="h-6 w-6 text-orange-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">{stats?.score_70_plus}</div>
						<p className="text-gray-600 text-sm">Score ≥ 70</p>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
