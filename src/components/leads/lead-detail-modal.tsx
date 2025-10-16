"use client";

import {
    Brain,
    Building2,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    Globe,
    Hash,
    Info,
    Link as LinkIcon,
    Mail,
    MapPin,
    Phone,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { leadSourceColorConfig } from "@/constants/saas-source";
import { leadScoringService } from "@/services/lead-scoring.service";
import type { Lead } from "@/types/lead";
import { formatSearchParams, getLeadDisplayData } from "@/utils/lead-display";

interface LeadDetailModalProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onExport?: (lead: Lead) => void;
}

export function LeadDetailModal({
    lead,
    isOpen,
    onClose,
    onExport,
}: LeadDetailModalProps) {
    if (!lead) {
        return null;
    }

    const displayData = getLeadDisplayData(lead);
    const sourceInfo = leadSourceColorConfig[lead.source];
    const totalScore = leadScoringService.scoreLead(lead);

    return (
        <Dialog onOpenChange={onClose} open={isOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader className="border-gray-200 border-b pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DialogTitle className="font-bold text-2xl text-gray-900">
                                Lead Details
                            </DialogTitle>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge
                                    className={`${sourceInfo.badge} rounded border px-2 py-1`}
                                >
                                    {sourceInfo.label}
                                </Badge>
                                <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {onExport && (
                            <Button
                                className="h-9 bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => onExport(lead)}
                                size="sm"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-gray-100 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                                    <LinkIcon className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-semibold text-gray-900 text-lg">
                                        {displayData.displayTitle}
                                    </h3>
                                    <p className="mt-1 flex items-center gap-2 text-gray-600 text-sm">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {displayData.displaySubtitle}
                                    </p>
                                    {displayData.actualUrl && (
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
                                    {displayData.searchParams && (
                                        <p className="mt-1 text-gray-500 text-xs">
                                            Search: {formatSearchParams(displayData.searchParams)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Score Overview */}
                        <div className="bg-gradient-to-br from-gray-50/50 to-indigo-50/30 p-6">
                            {/* Score Cards Grid */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                {/* Total Score */}
                                <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-white p-4 text-center shadow-sm">
                                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold text-transparent text-xl">
                                        {totalScore}
                                    </div>
                                    <div className="font-medium text-gray-600 text-xs">
                                        Total Score
                                    </div>
                                </div>

                                {/* Email Status */}
                                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                                        {(() => {
                                            const firstInfo = lead.verify_email_info?.[0];
                                            const isVerified =
                                                firstInfo?.status === "valid" ||
                                                lead.verify_email_status === "verified";
                                            return isVerified ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            );
                                        })()}
                                    </div>
                                    <div className="mb-1 font-bold text-base text-gray-900">
                                        {(() => {
                                            const firstInfo = lead.verify_email_info?.[0];
                                            const isVerified =
                                                firstInfo?.status === "valid" ||
                                                lead.verify_email_status === "verified";
                                            return isVerified ? "Verified" : "Unverified";
                                        })()}
                                    </div>
                                    <div className="font-medium text-gray-600 text-xs">
                                        Email Status
                                    </div>
                                </div>

                                {/* Data Quality */}
                                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                        <Brain className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="mb-1 font-bold text-base text-gray-900">
                                        {lead.enrich_info?.title_guess ? "High" : "Basic"}
                                    </div>
                                    <div className="font-medium text-gray-600 text-xs">
                                        Data Quality
                                    </div>
                                </div>

                                {/* Source Quality */}
                                <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                                        <Globe className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="mb-1 truncate font-bold text-base text-gray-900">
                                        {sourceInfo.label}
                                    </div>
                                    <div className="font-medium text-gray-600 text-xs">
                                        Source Type
                                    </div>
                                </div>
                            </div>

                            {/* Email Verification Details */}
                            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                                <div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-4 py-3">
                                    <h4 className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                                        <Mail className="h-4 w-4 text-indigo-500" />
                                        Email Verification Details
                                    </h4>
                                </div>
                                <div className="p-4">
                                    {(lead?.scrap_info?.emails?.length ?? 0) <= 0 ? (
                                        <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                                                <XCircle className="h-4 w-4 text-red-500" />
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
                                        <div className="space-y-2">
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
                                                        className={
                                                            isVerified
                                                                ? "flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 p-3"
                                                                : "flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 p-3"
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                isVerified
                                                                    ? "flex h-8 w-8 items-center justify-center rounded-lg bg-green-100"
                                                                    : "flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100"
                                                            }
                                                        >
                                                            {isVerified ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Mail className="h-4 w-4 text-orange-500" />
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
                                                                    className={
                                                                        isVerified
                                                                            ? "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs"
                                                                            : "inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700 text-xs"
                                                                    }
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
                    {(lead.enrich_info?.title_guess || lead.enrich_info?.summary) && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                                        <Brain className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-base text-gray-900">
                                        Lead Intelligence
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-3 p-5">
                                {lead.enrich_info?.title_guess && (
                                    <div className="flex flex-col">
                                        <div className="mb-1 flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                            <dt className="font-medium text-gray-700 text-sm">
                                                Company Title
                                            </dt>
                                        </div>
                                        <dd className="ml-6 font-semibold text-gray-900">
                                            {lead.enrich_info.title_guess}
                                        </dd>
                                    </div>
                                )}
                                {lead.enrich_info?.summary && (
                                    <div className="flex flex-col">
                                        <div className="mb-1 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            <dt className="font-medium text-gray-700 text-sm">
                                                Business Summary
                                            </dt>
                                        </div>
                                        <dd className="ml-6 text-gray-600 text-sm leading-relaxed">
                                            {lead.enrich_info.summary}
                                        </dd>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Raw Data */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-gray-100 border-b bg-gradient-to-r from-gray-50 to-gray-50/50 px-5 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                                    <Hash className="h-4 w-4 text-indigo-600" />
                                </div>
                                <h3 className="font-semibold text-base text-gray-900">
                                    Raw Data
                                </h3>
                            </div>
                        </div>
                        <div className="p-5">
                            <dl className="space-y-3">
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
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <dt className="font-medium text-gray-700 text-sm">
                                                        Description
                                                    </dt>
                                                </div>
                                                <details className="group">
                                                    <summary className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-medium text-gray-900 text-sm transition-colors hover:bg-gray-100">
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
                                                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3">
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
            </DialogContent>
        </Dialog>
    );
}
