"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import pricingPlans from "@/config/pricing-plans.json";
import { useUserActiveSubscription, useUserSubscription } from "@/hooks/use-subscription";
import { formatPrice } from "@/lib/subscription";
import {
	BarChart3,
	Bell,
	Package,
	Route,
	Settings,
	Shield,
	TrendingUp,
	Truck,
	Users,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
	const { data: activeSubscription, isLoading, error } = useUserActiveSubscription();

	// const retrieveSession = useRetrieveStripeSession();

	// const handleBillingClick = () => {
	// 	createBillingPortal.mutate();
	// };

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					{/* <p className="text-muted-foreground">
						{retrieveSession.isPending
							? "Setting up your subscription..."
							: "Loading dashboard..."}
					</p> */}
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
									{mappedPlan?.name} Plan
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

				{/* Stats Grid */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
								<Truck className="h-6 w-6 text-blue-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">12</div>
						<p className="text-gray-600 text-sm">Active Vehicles</p>
						<p className="mt-2 font-medium text-green-600 text-xs">
							+2 from last month
						</p>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">18</div>
						<p className="text-gray-600 text-sm">Active Drivers</p>
						<p className="mt-2 font-medium text-green-600 text-xs">
							+3 from last month
						</p>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
								<Route className="h-6 w-6 text-purple-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">24</div>
						<p className="text-gray-600 text-sm">Active Routes</p>
						<p className="mt-2 font-medium text-green-600 text-xs">
							+5 from last month
						</p>
					</div>

					<div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
								<Package className="h-6 w-6 text-orange-600" />
							</div>
							<TrendingUp className="h-5 w-5 text-green-500" />
						</div>
						<div className="mb-1 font-bold text-3xl text-gray-900">847</div>
						<p className="text-gray-600 text-sm">Monthly Loads</p>
						<p className="mt-2 font-medium text-green-600 text-xs">
							+12% from last month
						</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<button
						className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-indigo-200 hover:shadow-lg"
						type="button"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 transition-colors group-hover:bg-indigo-200">
							<BarChart3 className="h-6 w-6 text-indigo-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Load Board
						</h3>
						<p className="text-gray-600 text-sm">
							Find and manage available loads for your fleet
						</p>
					</button>

					<button
						className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-green-200 hover:shadow-lg"
						type="button"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 transition-colors group-hover:bg-green-200">
							<Route className="h-6 w-6 text-green-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Route Planner
						</h3>
						<p className="text-gray-600 text-sm">
							Optimize routes for maximum efficiency and fuel savings
						</p>
					</button>

					<button
						className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-200 hover:shadow-lg"
						type="button"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 transition-colors group-hover:bg-blue-200">
							<Users className="h-6 w-6 text-blue-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Driver Hub
						</h3>
						<p className="text-gray-600 text-sm">
							Monitor driver performance and compliance status
						</p>
					</button>

					<button
						className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-orange-200 hover:shadow-lg"
						type="button"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 transition-colors group-hover:bg-orange-200">
							<Shield className="h-6 w-6 text-orange-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Risk Alerts
						</h3>
						<p className="text-gray-600 text-sm">
							Real-time alerts about risks and opportunities
						</p>
					</button>
				</div>

				{/* Subscription Info */}
				{_subscription && mappedPlan && (
					<Card className="mt-8">
						<CardHeader>
							<CardTitle>Subscription Details</CardTitle>
							<CardDescription>
								Manage your LeadCore AI subscription
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div>
									<h4 className="mb-2 font-semibold">Current Plan</h4>
									<p className="text-muted-foreground text-sm">
										{mappedPlan.name} - {formatPrice(mappedPlan.priceMonthly)}/month
									</p>
									<ul className="mt-2 text-xs text-gray-600 list-disc pl-4">
										{mappedPlan.features.map((feature) => (
											<li key={feature}>{feature}</li>
										))}
									</ul>
								</div>

								<div>
									<h4 className="mb-2 font-semibold">Status</h4>
									<Badge
										variant={
											_subscription.subscription_status === "active"
												? "default"
												: "secondary"
										}
									>
										{_subscription.subscription_status}
									</Badge>
								</div>

								{/* <div>
									<h4 className="mb-2 font-semibold">Actions</h4>
									<Button
										disabled={createBillingPortal.isPending}
										onClick={handleBillingClick}
										size="sm"
										variant="outline"
									>
										{createBillingPortal.isPending
											? "Loading..."
											: "Manage Billing"}
									</Button>
								</div> */}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</DashboardLayout>
	);
}
