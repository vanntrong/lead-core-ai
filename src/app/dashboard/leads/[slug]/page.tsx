"use client";

import { useRouter } from "@bprogress/next/app";
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
	MapPin,
	Phone,
	RefreshCw,
	TrendingUp,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Suspense, use as usePromise, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExportLeadDialog } from "@/components/leads/export-lead-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import pricingPlans from "@/config/pricing-plans";
import { useLead } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { leadScoringService } from "@/services/lead-scoring.service";
import {
	formatSearchParams,
	getLeadDisplayData,
} from "@/utils/lead-display";

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
	google_places: {
		label: "Google Places",
		badge: "bg-blue-100 text-blue-800 border-blue-200", // Google Places: blue
	},
	npi_registry: {
		label: "NPI Registry",
		badge: "bg-teal-100 text-teal-800 border-teal-200", // NPI Registry: teal
	},
	fmcsa: {
		label: "FMCSA",
		badge: "bg-amber-100 text-amber-800 border-amber-200", // FMCSA: amber
	},
	unknown: {
		label: "Unknown Source",
		badge: "bg-gray-100 text-gray-800 border-gray-200",
	},
};

export default function DossierPage({ params }: { params: { slug: string } }) {
	const maybePromise = usePromise(params as any);
	const resolvedParams =
		typeof maybePromise === "object" &&
			maybePromise !== null &&
			"slug" in maybePromise
			? maybePromise
			: params;
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LeadDossierPage leadId={String(resolvedParams.slug)} />
		</Suspense>
	);
}

function LeadDossierPage({ leadId }: { leadId: string }) {
	const {
		data: lead,
		isLoading: isLoadingLead,
		isFetching: isFetchingLead,
		error: leadError,
		refetch: refetchLead,
	} = useLead(leadId);
	const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
	const {
		data: activeSubscription,
		isLoading,
		error,
	} = useUserActiveSubscription();
	const router = useRouter();

	if (leadError || !(lead || isLoadingLead || isFetchingLead)) {
		return (
			<DashboardLayout>
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<p className="mb-4 text-red-600">Failed to load lead details</p>
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
					<p className="text-muted-foreground">Loading subscription data...</p>
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
		? pricingPlans.find((plan) => plan.tier === _subscription.plan_tier)
		: null;

	// Get display data for the lead
	const displayData = lead ? getLeadDisplayData(lead) : null;

	return (
		<DashboardLayout planName={mappedPlan?.name}>
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
								disabled={isFetchingLead || isLoadingLead}
								onClick={() => refetchLead()}
								size="sm"
								variant="outline"
							>
								<RefreshCw
									className={cn("mr-2 h-4 w-4", {
										"animate-spin": isFetchingLead || isLoadingLead,
									})}
								/>
								Refresh
							</Button>
							{_subscription ? (
								<Button
									className="h-9 bg-indigo-600 hover:bg-indigo-700"
									disabled={!lead}
									onClick={() => setIsExportDialogOpen(true)}
									size="sm"
								>
									<Download className="mr-2 h-4 w-4" />
									Export Lead
								</Button>
							) : (
								<Button
									className="h-9 from-indigo-600 to-purple-600"
									onClick={() =>
										router.push(
											activeSubscription
												? "/dashboard/usage-invoices"
												: "/pricing"
										)
									}
									size="sm"
								>
									<Crown className="mr-2 h-4 w-4 text-yellow-300" />
									Upgrade to Export
								</Button>
							)}
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
						Instantly review, verify, and understand your lead. All the info you
						need—at a glance.
					</p>
				</div>

				{isLoadingLead || isFetchingLead || !lead ? (
					<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="space-y-6">
							{/* Header Card Skeleton */}
							<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 via-gray-50 to-gray-50 px-6 py-5">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
										<div className="min-w-0 flex-1">
											<div className="mb-2 h-5 w-48 animate-pulse rounded bg-gray-200" />
											<div className="mt-1.5 flex items-center gap-4">
												<div className="h-4 w-16 animate-pulse rounded-full bg-gray-100" />
												<div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
											</div>
										</div>
									</div>
								</div>
								{/* Score Overview Skeleton */}
								<div className="bg-gradient-to-br from-gray-50/50 to-indigo-50/30 p-6">
									{/* Score Cards Grid Skeleton */}
									<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
										{/* Total Score Card Skeleton */}
										<div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-white p-5 text-center shadow-sm">
											<div className="absolute top-0 left-0 h-1 w-full animate-pulse bg-gray-200" />
											<div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
											<div className="mx-auto mb-1 h-6 w-12 animate-pulse rounded bg-gray-200" />
											<div className="mx-auto h-4 w-20 animate-pulse rounded bg-gray-100" />
										</div>

										{/* Email Status Card Skeleton */}
										<div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
											<div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
											<div className="mx-auto mb-1 h-5 w-16 animate-pulse rounded bg-gray-200" />
											<div className="mx-auto h-4 w-22 animate-pulse rounded bg-gray-100" />
										</div>

										{/* Data Quality Card Skeleton */}
										<div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
											<div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
											<div className="mx-auto mb-1 h-5 w-12 animate-pulse rounded bg-gray-200" />
											<div className="mx-auto h-4 w-24 animate-pulse rounded bg-gray-100" />
										</div>

										{/* Source Type Card Skeleton */}
										<div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
											<div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
											<div className="mx-auto mb-1 h-5 w-14 animate-pulse rounded bg-gray-200" />
											<div className="mx-auto h-4 w-20 animate-pulse rounded bg-gray-100" />
										</div>
									</div>

									{/* Email Verification Details Skeleton */}
									<div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
										<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-5 py-4">
											<div className="flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
											</div>
										</div>
										<div className="p-5">
											<div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
												<div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
												<div className="min-w-0 flex-1">
													<div className="mb-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
													<div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Lead Intelligence Skeleton */}
							<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
										<div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
									</div>
								</div>
								<div className="space-y-4 p-6">
									<div className="space-y-3">
										<div className="flex flex-col">
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="h-5 w-64 animate-pulse rounded bg-gray-100" />
										</div>
										<div className="flex flex-col">
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="space-y-2">
												<div className="h-4 w-full animate-pulse rounded bg-gray-100" />
												<div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
												<div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Raw Data Skeleton */}
							<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
										<div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
									</div>
								</div>
								<div className="p-6">
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<div>
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
										</div>
										<div>
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
										</div>
										<div>
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
										</div>
										<div>
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-26 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="h-4 w-44 animate-pulse rounded bg-gray-100" />
										</div>
										<div>
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-22 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="h-4 w-38 animate-pulse rounded bg-gray-100" />
										</div>
										<div className="md:col-span-2">
											<div className="mb-1 flex items-center gap-2">
												<div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
												<div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
											</div>
											<div className="space-y-2">
												<div className="h-4 w-full animate-pulse rounded bg-gray-100" />
												<div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="space-y-6">
							{/* Header Card */}
							<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
								<div className="border-gray-100 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-6 py-5">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
											<LinkIcon className="h-4 w-4 text-indigo-600" />
										</div>
										<div className="min-w-0 flex-1">
											<h3 className="truncate font-semibold text-gray-900 text-lg">
												{displayData?.displayTitle || "Unknown"}
											</h3>
											<p className="mt-1 flex items-center gap-2 text-gray-600 text-sm">
												<MapPin className="h-3.5 w-3.5" />
												{displayData?.displaySubtitle || "No location"}
											</p>
											{displayData?.actualUrl && (
												<a
													className="mt-1 flex items-center gap-1 text-indigo-600 text-sm transition-colors hover:text-indigo-700"
													href={displayData.actualUrl}
													rel="noopener noreferrer"
													target="_blank"
												>
													<Globe className="h-3.5 w-3.5" />
													Visit Website
												</a>
											)}
											{displayData?.searchParams && (
												<p className="mt-1 text-gray-500 text-xs">
													Search: {formatSearchParams(displayData.searchParams)}
												</p>
											)}
											<div className="mt-2 flex items-center gap-4">
												<span
													className={`inline-flex items-center rounded-full border px-3 py-1 font-medium text-xs shadow-sm ${SOURCE_MAP[lead.source]?.badge ??
														"border-gray-200 bg-gray-100 text-gray-800"
														}`}
												>
													{SOURCE_MAP[lead.source]?.label ?? lead.source}
												</span>
												<span className="flex items-center gap-1.5 text-gray-500 text-sm">
													<Calendar className="h-3.5 w-3.5" />
													{new Date(lead.created_at).toLocaleDateString()}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Score Overview */}
								<div className="bg-gradient-to-br from-gray-50/50 to-indigo-50/30 p-6">
									{/* Score Cards Grid */}
									<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
										{/* Total Score */}
										<div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:shadow-md">
											<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
												<TrendingUp className="h-6 w-6 text-white" />
											</div>
											<div className="mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold text-2xl text-transparent">
												{leadScoringService.scoreLead(lead)}
											</div>
											<div className="font-medium text-gray-600 text-sm">
												Total Score
											</div>
										</div>

										{/* Email Status */}
										<div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:shadow-md">
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
												{(() => {
													const firstInfo = lead.verify_email_info?.[0];
													const isVerified =
														firstInfo?.status === "valid" ||
														lead.verify_email_status === "verified";
													return isVerified ? (
														<CheckCircle2 className="h-6 w-6 text-green-500" />
													) : (
														<XCircle className="h-6 w-6 text-red-500" />
													);
												})()}
											</div>
											<div className="mb-1 font-bold text-gray-900 text-lg">
												{(() => {
													const firstInfo = lead.verify_email_info?.[0];
													const isVerified =
														firstInfo?.status === "valid" ||
														lead.verify_email_status === "verified";
													return isVerified ? "Verified" : "Unverified";
												})()}
											</div>
											<div className="font-medium text-gray-600 text-sm">
												Email Status
											</div>
										</div>

										{/* Data Quality */}
										<div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:shadow-md">
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
												<Brain className="h-6 w-6 text-blue-500" />
											</div>
											<div className="mb-1 font-bold text-gray-900 text-lg">
												{lead.enrich_info?.title_guess ? "High" : "Basic"}
											</div>
											<div className="font-medium text-gray-600 text-sm">
												Data Quality
											</div>
										</div>

										{/* Source Quality */}
										<div className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:shadow-md">
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
												<Globe className="h-6 w-6 text-orange-500" />
											</div>
											<div className="mb-1 font-bold text-gray-900 text-lg">
												{SOURCE_MAP[lead.source]?.label || lead.source}
											</div>
											<div className="font-medium text-gray-600 text-sm">
												Source Type
											</div>
										</div>
									</div>

									{/* Email Verification Details */}
									<div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
										<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-5 py-4">
											<h4 className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
												<Mail className="h-4 w-4 text-indigo-500" />
												Email Verification Details
											</h4>
										</div>
										<div className="p-5">
											{(lead?.scrap_info?.emails?.length ?? 0) <= 0 ? (
												<div className="flex items-center gap-4 rounded-lg border border-red-100 bg-red-50 p-4">
													<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
														<XCircle className="h-5 w-5 text-red-500" />
													</div>
													<div className="min-w-0 flex-1">
														<div className="font-semibold text-red-700 text-sm">
															No Email Found
														</div>
														<div className="mt-0.5 text-red-600 text-xs">
															No email addresses were discovered during scraping
														</div>
													</div>
												</div>
											) : (
												<div className="space-y-3">
													{(() => {
														const firstInfo = lead.verify_email_info?.[0];
														const email =
															firstInfo?.input_email ||
															lead?.scrap_info?.emails?.[0];
														const isVerified =
															firstInfo?.status === "valid" ||
															lead.verify_email_status === "verified";

														return (
															<div
																className={`flex items-center gap-4 rounded-lg border p-4 ${isVerified
																	? "border-green-100 bg-green-50"
																	: "border-orange-100 bg-orange-50"
																	}`}
															>
																<div
																	className={`flex h-10 w-10 items-center justify-center rounded-lg ${isVerified
																		? "bg-green-100"
																		: "bg-orange-100"
																		}`}
																>
																	{isVerified ? (
																		<CheckCircle2 className="h-5 w-5 text-green-500" />
																	) : (
																		<Mail className="h-5 w-5 text-orange-500" />
																	)}
																</div>
																<div className="min-w-0 flex-1">
																	<div
																		className={`truncate font-semibold text-sm ${isVerified
																			? "text-green-800"
																			: "text-orange-800"
																			}`}
																	>
																		{email || "N/A"}
																	</div>
																	<div className="mt-0.5 flex items-center gap-2">
																		<span
																			className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${isVerified
																				? "bg-green-100 text-green-700"
																				: "bg-orange-100 text-orange-700"
																				}`}
																		>
																			{firstInfo?.status ||
																				(isVerified ? "verified" : "pending")}
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
							<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
								<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
											<Brain className="h-4 w-4 text-indigo-600" />
										</div>
										<h3 className="font-semibold text-gray-900 text-lg">
											Lead Intelligence
										</h3>
									</div>
								</div>
								<div className="space-y-4 p-6">
									<div className="space-y-3">
										<div className="flex flex-col">
											<div className="mb-1 flex items-center gap-2">
												<Building2 className="h-4 w-4 text-gray-400" />
												<dt className="font-medium text-gray-700 text-sm">
													Company Title
												</dt>
											</div>
											<dd className="ml-6 font-semibold text-base text-gray-900">
												{lead.enrich_info?.title_guess ?? "N/A"}
											</dd>
										</div>
										<div className="flex flex-col">
											<div className="mb-1 flex items-center gap-2">
												<FileText className="h-4 w-4 text-gray-400" />
												<dt className="font-medium text-gray-700 text-sm">
													Business Summary
												</dt>
											</div>
											<dd className="ml-6 text-gray-600 text-sm leading-relaxed">
												{lead.enrich_info?.summary ?? "N/A"}
											</dd>
										</div>
									</div>
								</div>
							</div>

							{/* Raw Data */}
							<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
								<div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
											<Hash className="h-4 w-4 text-indigo-600" />
										</div>
										<h3 className="font-semibold text-gray-900 text-lg">
											Raw Data
										</h3>
									</div>
								</div>
								<div className="p-6">
									<dl className="space-y-4">
										{/* Title/Name */}
										<div className="flex items-start gap-3 border-gray-100 border-b py-3 last:border-b-0">
											<div className="flex min-w-0 flex-1 items-center gap-2">
												<Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
												<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
													{(() => {
														if (lead.source === "npi_registry") {
															return "Entity Name";
														}
														if (lead.source === "fmcsa") {
															return "Company Name";
														}
														if (lead.source === "google_places") {
															return "Business Name";
														}
														return "Page Title";
													})()}
												</dt>
											</div>
											<dd
												className="max-w-xs truncate text-right text-gray-900 text-sm"
												title={lead.scrap_info?.title ?? "N/A"}
											>
												{lead.scrap_info?.title ?? "N/A"}
											</dd>
										</div>

										{/* Email */}
										{(() => {
											const emails =
												Array.isArray(lead.scrap_info?.emails) &&
													lead.scrap_info?.emails.length > 0
													? lead.scrap_info.emails
													: [];
											const firstEmail = emails.length > 0 ? emails[0] : "N/A";
											return (
												<div className="border-gray-100 border-b py-3 last:border-b-0">
													<div className="flex items-start gap-3">
														<div className="flex min-w-0 flex-1 items-center gap-2">
															<Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
															<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
																Emails Found
															</dt>
														</div>
														<dd className="max-w-xs break-all text-right text-gray-900 text-sm">
															{firstEmail}
														</dd>
													</div>
												</div>
											);
										})()}

										{/* Phone */}
										{lead.scrap_info?.phone && (
											<div className="border-gray-100 border-b py-3 last:border-b-0">
												<div className="flex items-start gap-3">
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
														<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
															Phone Number
														</dt>
													</div>
													<dd className="max-w-xs break-all text-right text-gray-900 text-sm">
														{lead.scrap_info.phone}
													</dd>
												</div>
											</div>
										)}

										{/* Address */}
										{lead.scrap_info?.address && (
											<div className="border-gray-100 border-b py-3 last:border-b-0">
												<div className="flex items-start gap-3">
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
														<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
															Address
														</dt>
													</div>
													<dd className="max-w-xs text-right text-gray-900 text-sm">
														{lead.scrap_info.address}
													</dd>
												</div>
											</div>
										)}

										{/* Website */}
										{lead.scrap_info?.website && (
											<div className="border-gray-100 border-b py-3 last:border-b-0">
												<div className="flex items-start gap-3">
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
														<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
															Website
														</dt>
													</div>
													<dd className="max-w-xs truncate text-right text-gray-900 text-sm">
														<a
															className="text-indigo-600 transition-colors hover:text-indigo-700"
															href={lead.scrap_info.website}
															rel="noopener noreferrer"
															target="_blank"
														>
															{lead.scrap_info.website}
														</a>
													</dd>
												</div>
											</div>
										)}

										{/* Business Type */}
										{lead.scrap_info?.business_type && (
											<div className="border-gray-100 border-b py-3 last:border-b-0">
												<div className="flex items-start gap-3">
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
														<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
															Business Type
														</dt>
													</div>
													<dd className="max-w-xs text-right text-gray-900 text-sm">
														{lead.scrap_info.business_type}
													</dd>
												</div>
											</div>
										)}

										{/* Rating */}
										{lead.scrap_info?.rating && (
											<div className="border-gray-100 border-b py-3 last:border-b-0">
												<div className="flex items-start gap-3">
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<TrendingUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
														<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
															Rating
														</dt>
													</div>
													<dd className="max-w-xs text-right text-gray-900 text-sm">
														★ {lead.scrap_info.rating}
													</dd>
												</div>
											</div>
										)}

										{/* Description */}
										{lead.scrap_info?.desc && (
											<div className="py-3">
												{lead.scrap_info.desc.length > 100 ? (
													<div className="space-y-3">
														<div className="flex items-center gap-2">
															<Info className="h-4 w-4 flex-shrink-0 text-gray-400" />
															<dt className="font-medium text-gray-700 text-sm">
																Description
															</dt>
														</div>
														<details className="group">
															<summary className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 font-medium text-gray-900 text-sm transition-colors hover:bg-gray-100">
																<span>View description</span>
																<svg
																	className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		d="M19 9l-7 7-7-7"
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																	/>
																</svg>
															</summary>
															<div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
																<dd className="text-gray-600 text-sm leading-relaxed">
																	{lead.scrap_info.desc}
																</dd>
															</div>
														</details>
													</div>
												) : (
													<div className="flex items-start gap-3">
														<div className="flex min-w-0 flex-1 items-center gap-2">
															<Info className="h-4 w-4 flex-shrink-0 text-gray-400" />
															<dt className="flex-shrink-0 font-medium text-gray-700 text-sm">
																Description
															</dt>
														</div>
														<dd className="max-w-xs text-right text-gray-900 text-sm leading-relaxed">
															{lead.scrap_info.desc}
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

			{/* Export Lead Dialog */}
			<ExportLeadDialog
				isOpen={isExportDialogOpen}
				leadData={lead ?? undefined}
				onClose={() => setIsExportDialogOpen(false)}
			/>
		</DashboardLayout>
	);
}
