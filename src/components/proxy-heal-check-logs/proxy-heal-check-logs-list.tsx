import { Pagination } from "@/components/ui/pagination";
import type { PaginatedProxyHealCheckLogResponse } from "@/types/proxy_heal_check_log";
import { FileText } from "lucide-react";
import { ProxyHealCheckLogsTable } from "./proxy-heal-check-logs-table";

interface ProxyHealCheckLogsListProps {
	response: PaginatedProxyHealCheckLogResponse;
	isLoading: boolean;
	isFetching: boolean;
	error: Error | null;
	pagination: {
		currentPage: number;
		itemsPerPage: number;
		handlePageChange: (page: number) => void;
		handleItemsPerPageChange: (itemsPerPage: number) => void;
	};
}

const ProxyHealCheckLogsList = ({
	isFetching,
	isLoading,
	error,
	response,
	pagination,
}: ProxyHealCheckLogsListProps) => {
	// Error state
	if (error) {
		return (
			<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-red-200 bg-red-50">
				<div className="text-center">
					<h3 className="font-medium text-lg text-red-900">
						Unable to load proxy heal check logs
					</h3>
					<p className="mt-1 text-red-600 text-sm">
						There was a problem loading your proxy heal check log data. Please
						refresh the page or try again.
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				{/* Loading skeleton for table */}
				<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
					<div className="animate-pulse">
						{/* Header skeleton */}
						<div className="border-gray-200 border-b bg-gray-50 p-4">
							<div className="flex space-x-4">
								{Array.from({ length: 6 }, (_, i) => (
									<div
										className="h-4 flex-1 rounded bg-gray-200"
										key={`header-skeleton-${i}`}
									/>
								))}
							</div>
						</div>
						{/* Rows skeleton */}
						{Array.from({ length: 5 }, (_, i) => (
							<div
								className="border-gray-100 border-b p-4"
								key={`row-skeleton-${i}`}
							>
								<div className="flex space-x-4">
									{Array.from({ length: 6 }, (_, j) => (
										<div
											className="h-6 flex-1 rounded bg-gray-100"
											key={`cell-skeleton-${i}-${j}`}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
				{/* Pagination skeleton */}
				<div className="flex items-center justify-between">
					<div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
					<div className="flex space-x-2">
						{Array.from({ length: 5 }, (_, i) => (
							<div
								className="h-8 w-8 animate-pulse rounded bg-gray-200"
								key={`pagination-skeleton-${i}`}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	const logs = response?.data || [];
	const totalCount = response?.totalCount || 0;
	const totalPages = response?.totalPages || 0;

	return (
		<div className="space-y-4">
			{/* Proxy Heal Check Log Table */}
			<div className="relative">
				<ProxyHealCheckLogsTable paginatedLogs={response} />
				{/* Fetching overlay */}
				{isFetching && !isLoading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
						<div className="flex items-center space-x-2 rounded-lg border bg-white px-4 py-2 shadow-sm">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
							<span className="text-gray-600 text-sm">Updating...</span>
						</div>
					</div>
				)}
				{/* Empty state */}
				{!isLoading && logs.length === 0 && (
					<div className="mt-2 flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
						<div className="text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
								<FileText className="h-6 w-6 text-gray-400" />
							</div>
							<h3 className="mt-4 font-medium text-gray-900 text-lg">
								No proxy heal check logs found
							</h3>
							<div className="mt-6 flex items-center justify-center" />
						</div>
					</div>
				)}
			</div>
			{/* Pagination */}
			{totalCount > 0 && (
				<div className="rounded-b-lg border-gray-200 border-t bg-white px-6 py-4">
					<Pagination
						currentPage={pagination.currentPage}
						disabled={isFetching}
						itemsPerPage={pagination.itemsPerPage}
						onItemsPerPageChange={pagination.handleItemsPerPageChange}
						onPageChange={pagination.handlePageChange}
						totalItems={totalCount}
						totalPages={totalPages}
					/>
				</div>
			)}
		</div>
	);
};

export default ProxyHealCheckLogsList;
