"use client";

import { ArrowDown, ArrowUp, Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { LeadFilters, LeadSource, LeadStatus } from "@/types/lead";

interface LeadFiltersProps {
	filters: LeadFilters;
	onFiltersChange: (filters: LeadFilters) => void;
	totalCount: number;
	filteredCount: number;
}

export function LeadFiltersComponent({
	filters,
	onFiltersChange,
	totalCount,
	filteredCount,
}: LeadFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleFilterChange = (key: keyof LeadFilters, value: unknown) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	const clearAllFilters = () => {
		onFiltersChange({});
	};

	const hasActiveFilters = Object.keys(filters).length > 0;

	return (
		<div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<Filter className="h-4 w-4 text-gray-500" />
						<span className="font-medium text-gray-900 text-sm">
							Leads Filters
						</span>
						{hasActiveFilters && (
							<span className="rounded-full bg-indigo-100 px-2 py-1 font-medium text-indigo-800 text-xs">
								{Object.keys(filters).length} active
							</span>
						)}
					</div>
					<div className="text-gray-600 text-sm">
						Showing {filteredCount} of {totalCount} leads
					</div>
				</div>

				<div className="flex items-center space-x-2">
					{hasActiveFilters && (
						<Button
							className="h-8 px-3 text-xs"
							onClick={clearAllFilters}
							size="sm"
							variant="outline"
						>
							<X className="mr-1 h-3 w-3" />
							Clear All
						</Button>
					)}
				</div>
			</div>

			{/* Always visible: Search and Status */}
			<div className="flex items-center justify-between gap-3">
				<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-4 2xl:grid-cols-4">
					{/* Search */}
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
						<Input
							className="h-9 pl-9"
							onChange={(e) =>
								handleFilterChange("search", e.target.value || undefined)
							}
							placeholder="Search leads..."
							value={filters.search || ""}
						/>
					</div>

					{/* Source Filter */}
					<Select
						onValueChange={(value) =>
							handleFilterChange(
								"source",
								value === "all" ? undefined : (value as unknown as LeadSource)
							)
						}
						value={
							Array.isArray(filters.source)
								? filters.source[0] || "all"
								: (filters.source ?? "all")
						}
					>
						<SelectTrigger className="h-9">
							<SelectValue placeholder="All Sources" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Sources</SelectItem>
							<SelectItem value="shopify">Shopify</SelectItem>
							<SelectItem value="etsy">Etsy</SelectItem>
							<SelectItem value="g2">G2</SelectItem>
							<SelectItem value="woocommerce">WooCommerce</SelectItem>
							<SelectItem value="google_places">Google Places</SelectItem>
							<SelectItem value="npi_registry">NPI Registry</SelectItem>
							<SelectItem value="fmcsa">FMCSA</SelectItem>
						</SelectContent>
					</Select>

					<Select
						onValueChange={(value) =>
							handleFilterChange(
								"status",
								value === "all" ? undefined : (value as unknown as LeadStatus)
							)
						}
						value={
							Array.isArray(filters.status)
								? filters.status[0] || "all"
								: (filters.status ?? "all")
						}
					>
						<SelectTrigger className="h-9">
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="scraped">Scraped</SelectItem>
							<SelectItem value="enriched">Enriched</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
						</SelectContent>
					</Select>

					<Select
						onValueChange={(value) =>
							handleFilterChange(
								"verify_email_status",
								value === "all" ? undefined : (value as unknown as LeadStatus)
							)
						}
						value={
							Array.isArray(filters.verify_email_status)
								? filters.verify_email_status[0] || "all"
								: (filters.verify_email_status ?? "all")
						}
					>
						<SelectTrigger className="h-9">
							<SelectValue placeholder="All Verified Email Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Verified Email Statuses</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="verified">Verified</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="relative flex items-center gap-3">
					<Button
						className="h-8 px-3 text-xs"
						onClick={() => setIsExpanded(!isExpanded)}
						size="sm"
						variant="outline"
					>
						{isExpanded ? "Less Filters" : "More Filters"}
						{isExpanded ? (
							<ArrowUp className="ml-1 h-3 w-3" />
						) : (
							<ArrowDown className="ml-1 h-3 w-3" />
						)}
					</Button>
				</div>
			</div>

			{/* Expandable filters */}
			{isExpanded && (
				<div className="space-y-4 border-gray-200 border-t pt-4">
					{/* Location Filters */}
					<div>
						<div className="mb-2 font-medium text-gray-700 text-sm">
							Location Filters
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<Input
								className="h-9"
								onChange={(e) =>
									handleFilterChange("location", e.target.value || undefined)
								}
								placeholder="Location (e.g., Austin, LA)"
								value={filters.location || ""}
							/>
							<Input
								className="h-9"
								onChange={(e) =>
									handleFilterChange("city", e.target.value || undefined)
								}
								placeholder="City"
								value={filters.city || ""}
							/>
							<Input
								className="h-9"
								onChange={(e) =>
									handleFilterChange("state", e.target.value || undefined)
								}
								placeholder="State (e.g., TX, CA)"
								value={filters.state || ""}
							/>
							<Input
								className="h-9"
								onChange={(e) =>
									handleFilterChange("business_type", e.target.value || undefined)
								}
								placeholder="Business Type"
								value={filters.business_type || ""}
							/>
						</div>
					</div>

					{/* Date Range */}
					<div>
						<div className="mb-2 font-medium text-gray-700 text-sm">
							Date Range
						</div>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<div>
								<label
									className="mb-1.5 block text-gray-600 text-sm"
									htmlFor="created-date-from"
								>
									From
								</label>
								<Input
									className="h-9"
									id="created-date-from"
									onChange={(e) => {
										const currentRange = filters.date_range || {
											start: "",
											end: "",
										};
										handleFilterChange("date_range", {
											...currentRange,
											start: e.target.value,
										});
									}}
									type="date"
									value={filters.date_range?.start || ""}
								/>
							</div>

							<div>
								<label
									className="mb-1.5 block text-gray-600 text-sm"
									htmlFor="created-date-to"
								>
									To
								</label>
								<Input
									className="h-9"
									id="created-date-to"
									onChange={(e) => {
										const currentRange = filters.date_range || {
											start: "",
											end: "",
										};
										handleFilterChange("date_range", {
											...currentRange,
											end: e.target.value,
										});
									}}
									type="date"
									value={filters.date_range?.end || ""}
								/>
							</div>

							<div className="flex items-end">
								<Button
									className="h-9"
									onClick={() => handleFilterChange("date_range", undefined)}
									size="sm"
									variant="outline"
								>
									Clear Dates
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
