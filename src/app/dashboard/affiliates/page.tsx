"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { AffiliateDashboard } from "@/components/affiliates/affiliate-dashboard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { useAffiliate } from "@/hooks/use-affiliate";
import { useCurrentUser } from "@/hooks/use-auth";

export default function AffiliatesPage() {
	const { data: user, isLoading: userLoading } = useCurrentUser();
	const { data: affiliateData, isLoading: affiliateLoading } = useAffiliate(
		user?.id || ""
	);

	if (userLoading || !user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Loading your profile...</p>
				</div>
			</div>
		);
	}

	const userEmail = user?.email || "";
	const userName =
		`${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`.trim() ||
		"User";

	return (
		<DashboardLayout>
			{/* Top Header Bar */}
			<div className="border-gray-200 border-b bg-white">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-4">
							<h1 className="font-bold text-gray-900 text-xl">
								Affiliate Program
							</h1>
							{affiliateData && (
								<Badge className="border-green-200 bg-green-50 text-green-700">
									<Users className="mr-1 h-3 w-3" />
									Active Affiliate
								</Badge>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="mb-2 font-bold text-3xl text-gray-900">
						Earn by Sharing LeadCore AI 💰
					</h2>
					<p className="text-gray-600 text-lg">
						Get your unique referral link and earn lifetime commissions.
					</p>
				</div>

				{/* Affiliate Dashboard Component */}
				{affiliateLoading ? (
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<p className="text-muted-foreground">Loading affiliate data...</p>
						</div>
					</div>
				) : (
					<AffiliateDashboard
						affiliateData={affiliateData || null}
						email={userEmail}
						fullName={userName}
						userId={user.id ?? ""}
					/>
				)}

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
