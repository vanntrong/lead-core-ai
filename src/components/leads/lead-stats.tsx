"use client";

import { Card } from "@/components/ui/card";
import { LeadStats } from "@/types/lead";
import {
	DollarSign,
	Package,
	TrendingUp
} from "lucide-react";

interface LeadStatsProps {
	stats?: LeadStats;
	isLoading?: boolean;
}

export function LeadStatsCards({ stats, isLoading }: LeadStatsProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow" key={`loading-${i}`}>
						<div className="flex items-center justify-between animate-pulse">
							<div>
								<div className="mb-2 h-4 w-24 rounded bg-gray-200" />
								<div className="h-7 w-16 rounded bg-gray-200" />
							</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
								<div className="h-5 w-5 rounded bg-gray-300" />
							</div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
			{/* Total Leads */}
			<Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-gray-600 text-sm">Total Leads</p>
						<p className="font-bold text-xl text-gray-900">{stats?.total}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
						<TrendingUp className="h-5 w-5 text-indigo-600" />
					</div>
				</div>
			</Card>

			{/* Enriched */}
			<Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-gray-600 text-sm">Enriched</p>
						<p className="font-bold text-xl text-gray-900">{stats?.enriched}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
						<Package className="h-5 w-5 text-green-600" />
					</div>
				</div>
			</Card>

			{/* Verified Email */}
			<Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-gray-600 text-sm">Verified Email</p>
						<p className="font-bold text-xl text-gray-900">{stats?.verified_email}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
				</div>
			</Card>

			{/* Score ≥ 70 */}
			<Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-gray-600 text-sm">Score ≥ 70</p>
						<p className="font-bold text-xl text-gray-900">{stats?.score_70_plus}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
						<TrendingUp className="h-5 w-5 text-indigo-600" />
					</div>
				</div>
			</Card>

			{/* Score ≥ 90 */}
			<Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-gray-600 text-sm">Score ≥ 90</p>
						<p className="font-bold text-xl text-gray-900">{stats?.score_90_plus}</p>
					</div>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
						<DollarSign className="h-5 w-5 text-purple-600" />
					</div>
				</div>
			</Card>
		</div>
	);
}
