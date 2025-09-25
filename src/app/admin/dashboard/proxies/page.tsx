"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import ProxyHealCheckLogsList from "@/components/proxy-heal-check-logs/proxy-heal-check-logs-list";
import { ProxyList } from "@/components/proxy-heal-check-logs/proxy-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination";
import { useProxiesAdmin } from "@/hooks/use-proxy-admin";
import { useProxyHealCheckLogsPaginatedAdmin } from "@/hooks/use-proxy-heal-check-logs-admin";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ProxiesPage() {

  const {
    data: proxies,
    isLoading: proxiesLoading,
    isFetching: proxiesFetching,
    error: proxiesError,
    refetch: refetchProxies,
  } = useProxiesAdmin()

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
  const paginatedFilters = {
    page: currentPage,
    limit: itemsPerPage,
  };

  const {
    data: paginatedResponse,
    isLoading: isLoadingProxyHealCheckLog,
    error: proxyLogError,
    isFetching: isFetchingProxyHealCheckLog,
    refetch: refetchProxyHealCheckLog,
  } = useProxyHealCheckLogsPaginatedAdmin(paginatedFilters);

  const handleRefresh = async () => {
    await Promise.all([refetchProxyHealCheckLog(), refetchProxies()]);
    toast.success("Proxies board refreshed");
  };

  if (proxyLogError || proxiesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Error Loading Proxies</h1>
          <p className="mb-6 text-muted-foreground">
            Failed to load proxies data.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="border-gray-200 border-b bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-bold text-gray-900 text-xl">Proxies</h1>
              <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">Admin</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                className="h-9"
                disabled={isFetchingProxyHealCheckLog || isLoadingProxyHealCheckLog}
                onClick={handleRefresh}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", {
                    "animate-spin": isFetchingProxyHealCheckLog || isLoadingProxyHealCheckLog,
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
          <h2 className="mb-2 font-bold text-3xl text-gray-900">Proxy Operations Center</h2>
          <p className="text-gray-600 text-lg">Stay informed about proxy activity and issues.</p>
        </div>

        {/* Proxy List */}
        <ProxyList proxies={proxies} isLoading={proxiesLoading || proxiesFetching} />

        {/* Section Divider */}
        <div className="flex items-center justify-between pt-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Proxies Health Check Logs</h3>
          <div className="flex-1 border-t border-gray-200 ml-4" />
        </div>

        {/* Logs Table */}
        <ProxyHealCheckLogsList
          error={proxyLogError}
          isFetching={isFetchingProxyHealCheckLog}
          isLoading={isLoadingProxyHealCheckLog}
          pagination={{
            currentPage,
            itemsPerPage,
            handlePageChange,
            handleItemsPerPageChange,
          }}
          response={paginatedResponse!}
        />
      </div>
    </DashboardLayout>
  );
}
