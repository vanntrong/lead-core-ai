"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ExportLeadDialog } from "@/components/leads/export-lead-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import pricingPlans from "@/config/pricing-plans.json";
import { useLead } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { leadScoringService } from "@/services/lead-scoring.service";
import {
  ArrowLeft,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  Download,
  FileText,
  Globe,
  Hash,
  Info,
  Link as LinkIcon,
  Mail,
  RefreshCw,
  TrendingUp,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use as usePromise, useState } from "react";

const SOURCE_MAP: Record<string, { label: string; badge: string }> = {
  shopify: {
    label: "Shopify",
    badge: "bg-green-100 text-green-800 border-green-200",
  },
  etsy: {
    label: "Etsy",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  g2: {
    label: "G2",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
  woocommerce: {
    label: "WooCommerce",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  unknown: {
    label: "Unknown Source",
    badge: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function DossierPage({ params }: { params: { slug: string } }) {
  const maybePromise = usePromise(params as any);
  const resolvedParams = typeof maybePromise === "object" && maybePromise !== null && "slug" in maybePromise ? maybePromise : params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadDossierPage leadId={String(resolvedParams.slug)} />
    </Suspense>
  );
}

function LeadDossierPage({ leadId }: { leadId: string }) {
  const { data: lead, isLoading: isLoadingLead, isFetching: isFetchingLead, error: leadError, refetch: refetchLead } = useLead(leadId);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { data: activeSubscription, isLoading, error } = useUserActiveSubscription();
  const router = useRouter();

  if (leadError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load lead details</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/leads">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
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

  const _subscription = activeSubscription;
  // Map subscription to plan from pricingPlans
  const mappedPlan = _subscription
    ? pricingPlans.find(
      (plan) =>
        plan.tier === _subscription.plan_tier
    )
    : null;

  return (
    <DashboardLayout>
      <div className="border-gray-200 border-b bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-bold text-gray-900 text-xl">Lead Dossier</h1>
              {_subscription && (
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  {mappedPlan?.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild className="h-9" size="sm" variant="outline">
                <Link href="/dashboard/leads">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Leads
                </Link>
              </Button>
              <Button
                className="h-9"
                size="sm"
                variant="outline"
                onClick={() => refetchLead()}
                disabled={isFetchingLead || isLoadingLead}
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", {
                    "animate-spin": isFetchingLead || isLoadingLead,
                  })}
                />
                Refresh
              </Button>
              {
                ["pro", "unlimited"].includes(_subscription?.plan_tier ?? "basic") ? (<Button
                  className="h-9 bg-indigo-600 hover:bg-indigo-700"
                  size="sm"
                  disabled={!lead}
                  onClick={() => setIsExportDialogOpen(true)}
                >
                  <Download className="mr-2 h-4 w-4 " />
                  Export Lead
                </Button>
                ) : (
                  <Button
                    className="h-9 from-indigo-600 to-purple-600"
                    onClick={() => router.push(activeSubscription ? '/dashboard/usage-invoices' : '/pricing')}
                    size="sm"
                  >
                    <Crown className="mr-2 h-4 w-4 text-yellow-300" />
                    Upgrade to Export
                  </Button>
                )
              }
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 font-bold text-3xl text-gray-900">
            Lead Details & Insights
          </h2>
          <p className="text-gray-600 text-lg">
            Instantly review, verify, and understand your lead. All the info you need—at a glance.
          </p>
        </div>

        {
          isLoadingLead || isFetchingLead || !lead ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                {/* Header Card Skeleton */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-50 px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
                          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Score Overview Skeleton */}
                  <div className="p-6 bg-gradient-to-br from-gray-50/50 to-indigo-50/30">

                    {/* Score Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      {/* Total Score Card Skeleton */}
                      <div className="text-center p-5 bg-white border border-indigo-100 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 animate-pulse"></div>
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mb-1 mx-auto" />
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mx-auto" />
                      </div>

                      {/* Email Status Card Skeleton */}
                      <div className="text-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mb-1 mx-auto" />
                        <div className="h-4 w-22 bg-gray-100 rounded animate-pulse mx-auto" />
                      </div>

                      {/* Data Quality Card Skeleton */}
                      <div className="text-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-5 w-12 bg-gray-200 rounded animate-pulse mb-1 mx-auto" />
                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mx-auto" />
                      </div>

                      {/* Source Type Card Skeleton */}
                      <div className="text-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-5 w-14 bg-gray-200 rounded animate-pulse mb-1 mx-auto" />
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mx-auto" />
                      </div>
                    </div>

                    {/* Email Verification Details Skeleton */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Intelligence Skeleton */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                          <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Data Skeleton */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-26 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-44 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-22 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-38 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                          <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <LinkIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={lead.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-gray-900 hover:text-indigo-700 transition-colors block truncate"
                        >
                          {lead.url}
                        </a>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm border ${SOURCE_MAP[lead.source]?.badge ?? "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                          >
                            {SOURCE_MAP[lead.source]?.label ?? lead.source}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Overview */}
                  <div className="p-6 bg-gradient-to-br from-gray-50/50 to-indigo-50/30">

                    {/* Score Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      {/* Total Score */}
                      <div className="text-center p-5 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                          {leadScoringService.scoreLead(lead)}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Total Score</div>
                      </div>

                      {/* Email Status */}
                      <div className="text-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-50 rounded-xl">
                          {(() => {
                            const firstInfo = lead.verify_email_info?.[0];
                            const isVerified = firstInfo?.status === "valid" || lead.verify_email_status === "verified";
                            return isVerified ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-500" />
                            );
                          })()}
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {(() => {
                            const firstInfo = lead.verify_email_info?.[0];
                            const isVerified = firstInfo?.status === "valid" || lead.verify_email_status === "verified";
                            return isVerified ? "Verified" : "Unverified";
                          })()}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Email Status</div>
                      </div>

                      {/* Data Quality */}
                      <div className="text-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-xl">
                          <Brain className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {lead.enrich_info?.title_guess ? "High" : "Basic"}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Data Quality</div>
                      </div>

                      {/* Source Quality */}
                      <div className="text-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-50 rounded-xl">
                          <Globe className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {SOURCE_MAP[lead.source]?.label || lead.source}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Source Type</div>
                      </div>
                    </div>

                    {/* Email Verification Details */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          Email Verification Details
                        </h4>
                      </div>
                      <div className="p-5">
                        {(lead?.scrap_info?.emails?.length ?? 0) <= 0 ? (
                          <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                              <XCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-red-700">No Email Found</div>
                              <div className="text-xs text-red-600 mt-0.5">No email addresses were discovered during scraping</div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(() => {
                              const firstInfo = lead.verify_email_info?.[0];
                              const email = firstInfo?.input_email || lead?.scrap_info?.emails?.[0];
                              const isVerified = firstInfo?.status === "valid" || lead.verify_email_status === "verified";

                              return (
                                <div className={`flex items-center gap-4 p-4 rounded-lg border ${isVerified
                                  ? "bg-green-50 border-green-100"
                                  : "bg-orange-50 border-orange-100"
                                  }`}>
                                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${isVerified ? "bg-green-100" : "bg-orange-100"
                                    }`}>
                                    {isVerified ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <Mail className="h-5 w-5 text-orange-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold truncate ${isVerified ? "text-green-800" : "text-orange-800"
                                      }`}>
                                      {email || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isVerified
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                        }`}>
                                        {firstInfo?.status || (isVerified ? "verified" : "pending")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Intelligence */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <Brain className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Lead Intelligence</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <dt className="text-sm font-medium text-gray-700">Company Title</dt>
                        </div>
                        <dd className="text-base text-gray-900 font-semibold ml-6">{lead.enrich_info?.title_guess ?? "N/A"}</dd>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <dt className="text-sm font-medium text-gray-700">Business Summary</dt>
                        </div>
                        <dd className="text-sm text-gray-600 leading-relaxed ml-6">{lead.enrich_info?.summary ?? "N/A"}</dd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Data */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200">
                        <Hash className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Raw Data</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <dl className="space-y-4">
                      {/* Page Title */}
                      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <dt className="text-sm font-medium text-gray-700 flex-shrink-0">Page Title</dt>
                        </div>
                        <dd className="text-sm text-gray-900 text-right max-w-xs truncate" title={lead.scrap_info?.title ?? "N/A"}>
                          {lead.scrap_info?.title ?? "N/A"}
                        </dd>
                      </div>

                      {/* Emails Found */}
                      {(() => {
                        const emails = Array.isArray(lead.scrap_info?.emails) && lead.scrap_info?.emails.length > 0
                          ? lead.scrap_info.emails
                          : [];
                        const firstEmail = emails.length > 0 ? emails[0] : "N/A";
                        return (
                          <div className="py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <dt className="text-sm font-medium text-gray-700 flex-shrink-0">Emails Found</dt>
                              </div>
                              <dd className="text-sm text-gray-900 text-right max-w-xs break-all">{firstEmail}</dd>
                            </div>
                          </div>
                        );
                      })()}

                      {/* About */}
                      {lead.scrap_info?.desc && (
                        <div className="py-3">
                          {lead.scrap_info.desc.length > 100 ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <dt className="text-sm font-medium text-gray-700">Description</dt>
                              </div>
                              <details className="group">
                                <summary className="flex items-center justify-between w-full py-3 px-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                  <span>View description</span>
                                  <svg
                                    className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
                                  <dd className="text-sm text-gray-600 leading-relaxed">
                                    {lead.scrap_info.desc}
                                  </dd>
                                </div>
                              </details>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <dt className="text-sm font-medium text-gray-700 flex-shrink-0">About</dt>
                              </div>
                              <dd className="text-sm text-gray-900 text-right max-w-xs leading-relaxed">
                                {lead.scrap_info?.desc ?? "N/A"}
                              </dd>
                            </div>
                          )}
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>

      {/* Export Lead Dialog */}
      <ExportLeadDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        leadData={lead}
      />
    </DashboardLayout>
  );
}

