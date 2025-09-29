"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import ScraperLogList from "@/components/scraper-logs/scraper-log-list";
import { ScraperLogStatsCards } from "@/components/scraper-logs/scraper-log-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination";
import { useScraperLogsPaginatedAdmin, useScraperLogStatsAdmin } from "@/hooks/use-scraper-logs-admin";
import { cn } from "@/lib/utils";
import { ScraperLogFilters } from "@/types/scraper_log";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ScraperLogsPage() {
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
  const paginatedFilters: ScraperLogFilters = {
    page: currentPage,
    limit: itemsPerPage,
  };

  const {
    data: paginatedResponse,
    isLoading: isLoadingScrapsLog,
    error: scraperLogError,
    isFetching: isFetchingScrapLog,
    refetch: refetchScrapLog,
  } = useScraperLogsPaginatedAdmin(paginatedFilters);

  const {
    data: stats,
    isFetching: statsLoading,
    refetch: refetchStats,
  } = useScraperLogStatsAdmin();

  const handleRefresh = async () => {
    await Promise.all([refetchScrapLog(), refetchStats()]);
    toast.success("Scraper log board refreshed");
  };

  if (scraperLogError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Error Loading Scraper Logs</h1>
          <p className="mb-6 text-muted-foreground">
            Failed to load scraper log data.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout planName="Admin">
      <div className="border-gray-200 border-b bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-bold text-gray-900 text-xl">Scraper Logs</h1>
              <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">Admin</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                className="h-9"
                disabled={isFetchingScrapLog || isLoadingScrapsLog}
                onClick={handleRefresh}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", {
                    "animate-spin": isFetchingScrapLog || isLoadingScrapsLog,
                  })}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 font-bold text-3xl text-gray-900">Scraper Log History</h2>
          <p className="text-gray-600 text-lg">Monitor and audit all scraper operations.</p>
        </div>

        {/* Stats Cards */}
        <ScraperLogStatsCards isLoading={statsLoading} stats={stats} />

        {/* Logs Table */}
        <ScraperLogList
          error={scraperLogError}
          isFetching={isFetchingScrapLog}
          isLoading={isLoadingScrapsLog}
          pagination={{
            currentPage,
            itemsPerPage,
            handlePageChange,
            handleItemsPerPageChange,
          }}
          response={paginatedResponse!}
        />
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} LeadCore AI. Powered by $TOWN.
        </p>
      </div>
    </DashboardLayout>
  );
}
