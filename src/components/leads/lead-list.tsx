import { LeadFilters, PaginatedLeadResponse } from "@/types/lead";
import { Crown, Loader2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Pagination } from "../ui/pagination";
import { LeadTable } from "./lead-table";
import { useRouter } from "@bprogress/next/app";

interface LeadListProps {
  response: PaginatedLeadResponse;
  isLoading: boolean;
  isFetching: boolean;
  filters: LeadFilters;
  onCreateLead: () => void;
  onGenerateMockData?: () => void;
  isMockDataGenerating?: boolean;
  isShowUpgradeButton?: boolean;
  error: Error | null;

  pagination: {
    currentPage: number;
    itemsPerPage: number;
    handlePageChange: (page: number) => void;
    handleItemsPerPageChange: (itemsPerPage: number) => void;
  };
}

const LeadList = ({
  filters,
  onCreateLead,
  onGenerateMockData,
  isMockDataGenerating,
  isShowUpgradeButton,
  isFetching,
  isLoading,
  error,
  response,
  pagination,
}: LeadListProps) => {
  // Handle error state
  const router = useRouter()

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-red-200 bg-red-50">
        <div className="text-center">
          <h3 className="font-medium text-lg text-red-900">
            Unable to load lead
          </h3>
          <p className="mt-1 text-red-600 text-sm">
            There was a problem loading your lead data. Please refresh the page
            or try again.
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
                    key={`header-skeleton-${Date.now()}-${i}`}
                  />
                ))}
              </div>
            </div>
            {/* Rows skeleton */}
            {Array.from({ length: 5 }, (_, i) => (
              <div
                className="border-gray-100 border-b p-4"
                key={`row-skeleton-${Date.now()}-${i}`}
              >
                <div className="flex space-x-4">
                  {Array.from({ length: 6 }, (_, j) => (
                    <div
                      className="h-6 flex-1 rounded bg-gray-100"
                      key={`cell-skeleton-${Date.now()}-${i}-${j}`}
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
                key={`pagination-skeleton-${Date.now()}-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const leads = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = response?.totalPages || 0;

  return (
    <div className="space-y-4">
      {/* Lead Table */}
      <div className="relative">
        <LeadTable
          leads={leads}
          searchTerms={filters.search}
          showSummary={true}
        />

        {/* Fetching overlay */}

        {isFetching && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2 rounded-lg border bg-white px-4 py-2 shadow-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span className="text-gray-600 text-sm">Updating...</span>
            </div>
          </div>
        )}
        {!isLoading && leads.length === 0 && (
          <div className="mt-2 flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-medium text-gray-900 text-lg">
                No leads found
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {filters?.search ||
                  filters?.source ||
                  filters?.status ||
                  filters?.date_range
                  ? "Try adjusting your search filters to find more results."
                  : "Get started by adding your first lead to the system."}
              </p>
              <div className="mt-6 flex items-center justify-center space-x-3">

                {
                  isShowUpgradeButton ? (
                    <Button
                      className="h-9 from-indigo-600 to-purple-600"
                      onClick={() => router.push('/pricing')}
                      size="sm"
                    >
                      <Crown className="mr-2 h-4 w-4 text-yellow-300" />
                      Upgrade to add leads
                    </Button>
                  ) : (
                    <Button onClick={onCreateLead} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lead
                    </Button>
                  )
                }
                {onGenerateMockData && (
                  <Button
                    disabled={isMockDataGenerating}
                    onClick={onGenerateMockData}
                    size="sm"
                    variant="outline"
                  >
                    {isMockDataGenerating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isMockDataGenerating
                      ? "Generating..."
                      : "Generate Sample Data"}
                  </Button>
                )}
              </div>
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

export default LeadList;
