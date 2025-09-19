"use client";

import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	startItem: number;
	endItem: number;
}

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	onItemsPerPageChange?: (itemsPerPage: number) => void;
	showItemsPerPage?: boolean;
	showPageInfo?: boolean;
	disabled?: boolean;
	itemsPerPageOptions?: number[];
}

export function Pagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage = 10,
	onPageChange,
	onItemsPerPageChange,
	showItemsPerPage = true,
	showPageInfo = true,
	disabled = false,
	itemsPerPageOptions = [10, 20, 50, 100],
}: PaginationProps) {
	const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	// Generate visible page numbers with smart truncation
	const getVisiblePages = () => {
		const delta = 2; // Number of pages to show on each side of current page
		const pages: (number | "ellipsis")[] = [];

		// Always show first page
		if (totalPages > 0) {
			pages.push(1);
		}

		// Add ellipsis after first page if needed
		if (currentPage > delta + 2) {
			pages.push("ellipsis");
		}

		// Add pages around current page
		const start = Math.max(2, currentPage - delta);
		const end = Math.min(totalPages - 1, currentPage + delta);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		// Add ellipsis before last page if needed
		if (currentPage < totalPages - delta - 1) {
			pages.push("ellipsis");
		}

		// Always show last page (if different from first)
		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	};

	const visiblePages = getVisiblePages();

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages && !disabled) {
			onPageChange(page);
		}
	};

	const handleItemsPerPageChange = (value: string) => {
		if (onItemsPerPageChange && !disabled) {
			onItemsPerPageChange(Number(value));
		}
	};

	if (totalPages <= 1 && !showItemsPerPage) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			{/* Items per page selector */}
			{showItemsPerPage && onItemsPerPageChange && (
				<div className="flex items-center space-x-2">
					<span className="text-gray-600 text-sm">Show</span>
					<Select
						disabled={disabled}
						onValueChange={handleItemsPerPageChange}
						value={itemsPerPage.toString()}
					>
						<SelectTrigger className="h-8 w-16">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{itemsPerPageOptions.map((option) => (
								<SelectItem key={option} value={option.toString()}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span className="text-gray-600 text-sm">per page</span>
				</div>
			)}

			{/* Page info and navigation */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
				{/* Page info */}
				{showPageInfo && totalItems > 0 && (
					<div className="text-gray-600 text-sm">
						Showing{" "}
						<span className="font-medium text-gray-900">
							{startItem.toLocaleString()}
						</span>{" "}
						to{" "}
						<span className="font-medium text-gray-900">
							{endItem.toLocaleString()}
						</span>{" "}
						of{" "}
						<span className="font-medium text-gray-900">
							{totalItems.toLocaleString()}
						</span>{" "}
						results
					</div>
				)}

				{/* Navigation buttons */}
				{totalPages > 1 && (
					<div className="flex items-center space-x-1">
						{/* First page */}
						<Button
							className="h-8 w-8 p-0"
							disabled={currentPage === 1 || disabled}
							onClick={() => handlePageChange(1)}
							size="sm"
							title="First page"
							variant="outline"
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>

						{/* Previous page */}
						<Button
							className="h-8 w-8 p-0"
							disabled={currentPage === 1 || disabled}
							onClick={() => handlePageChange(currentPage - 1)}
							size="sm"
							title="Previous page"
							variant="outline"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						{/* Page numbers */}
						<div className="flex items-center space-x-1">
							{visiblePages.map((page, index) => {
								if (page === "ellipsis") {
									return (
										<span
											className="flex h-8 w-8 items-center justify-center text-gray-400 text-sm"
											key={`ellipsis-${index}`}
										>
											...
										</span>
									);
								}

								return (
									<Button
										className={`h-8 w-8 p-0 text-sm ${currentPage === page
												? "bg-indigo-600 text-white hover:bg-indigo-700"
												: "hover:bg-gray-50"
											}`}
										disabled={disabled}
										key={page}
										onClick={() => handlePageChange(page)}
										size="sm"
										title={`Go to page ${page}`}
										variant={currentPage === page ? "default" : "outline"}
									>
										{page}
									</Button>
								);
							})}
						</div>

						{/* Next page */}
						<Button
							className="h-8 w-8 p-0"
							disabled={currentPage === totalPages || disabled}
							onClick={() => handlePageChange(currentPage + 1)}
							size="sm"
							title="Next page"
							variant="outline"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>

						{/* Last page */}
						<Button
							className="h-8 w-8 p-0"
							disabled={currentPage === totalPages || disabled}
							onClick={() => handlePageChange(totalPages)}
							size="sm"
							title="Last page"
							variant="outline"
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

// Utility function to calculate pagination info
export function calculatePaginationInfo(
	currentPage: number,
	itemsPerPage: number,
	totalItems: number
): PaginationInfo {
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	return {
		currentPage,
		totalPages,
		totalItems,
		itemsPerPage,
		startItem,
		endItem,
	};
}

// Hook to manage pagination state
export function usePagination(initialItemsPerPage = 20) {
	const [currentPage, setCurrentPage] = React.useState(1);
	const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

	const handlePageChange = React.useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handleItemsPerPageChange = React.useCallback(
		(newItemsPerPage: number) => {
			setItemsPerPage(newItemsPerPage);
			setCurrentPage(1); // Reset to first page when changing items per page
		},
		[]
	);

	const resetPagination = React.useCallback(() => {
		setCurrentPage(1);
	}, []);

	return {
		currentPage,
		itemsPerPage,
		handlePageChange,
		handleItemsPerPageChange,
		resetPagination,
	};
}
