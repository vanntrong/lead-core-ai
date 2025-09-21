"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination";
import { CancelSubscriptionDialog } from "@/components/usage-invoices/cancel-subscription-dialog";
import InvoiceList from "@/components/usage-invoices/invoice-list";
import { UsageOverview } from "@/components/usage-invoices/usage-overview";
import pricingPlans from "@/config/pricing-plans.json";
import { useUserInvoicesPaginated } from "@/hooks/use-invoice";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { InvoiceFilters } from "@/types/invoice";
import { Crown } from "lucide-react";
import { useEffect } from "react";

export default function UsageAndInvoicesPage() {
  const { data: activeSubscription, isLoading, error } = useUserActiveSubscription();

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
  const paginatedFilters: InvoiceFilters = {
    page: currentPage,
    limit: itemsPerPage,
  };

  const {
    data: paginatedResponse,
    isLoading: isLoadingLeads,
    error: loadsError,
    isFetching: isFetchingLeads,
    refetch: refetchLoads,
  } = useUserInvoicesPaginated(paginatedFilters);

  const _subscription = activeSubscription;
  // Map subscription to plan from pricingPlans
  const mappedPlan = _subscription
    ? pricingPlans.find(
      (plan) =>
        plan.tier === _subscription.plan_tier
    )
    : null;

  let planColor = "text-gray-900";
  if (mappedPlan?.tier === "basic") planColor = "text-gray-500";
  else if (mappedPlan?.tier === "pro") planColor = "text-indigo-500";
  else if (mappedPlan?.tier === "unlimited") planColor = "text-purple-500";

  if (isLoading && !activeSubscription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading subscription data...
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

  return (
    <DashboardLayout>
      <div className="border-gray-200 border-b bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-bold text-gray-900 text-xl">Usage & Billing</h1>
              {_subscription && (
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  {mappedPlan?.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {
                activeSubscription && ["basic", "pro"].includes(activeSubscription?.plan_tier ?? "basic") && (
                  <Button
                    className="h-9 from-indigo-600 to-purple-600"
                    size="sm"
                  >
                    <Crown className="mr-2 h-4 w-4 text-yellow-300" />
                    Update Usage
                  </Button>
                )
              }
              {
                activeSubscription && <CancelSubscriptionDialog />
              }
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 font-bold text-3xl text-gray-900">Plan Usage & Billing</h2>
          <p className="text-gray-600 text-lg">Monitor your usage and billing history.</p>
        </div>

        {/* Usage Overview */}
        <UsageOverview activeSubscription={activeSubscription} />

        {/* Invoice Table Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pt-2 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
            <div className="flex-1 border-t border-gray-200 ml-4" />
          </div>
          <InvoiceList
            error={loadsError}
            isFetching={isFetchingLeads}
            isLoading={isLoadingLeads}
            pagination={{
              currentPage,
              itemsPerPage,
              handlePageChange,
              handleItemsPerPageChange,
            }}
            response={paginatedResponse!}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
