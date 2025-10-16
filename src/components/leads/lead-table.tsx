"use client";

import {
	ArrowUpRight,
	Calendar,
	CheckCircle2,
	Clock,
	ExternalLink,
	Eye,
	Mail,
	MapPin,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { leadSourceColorConfig } from "@/constants/saas-source";
import { leadScoringService } from "@/services/lead-scoring.service";
import type { Lead } from "@/types/lead";
import { formatDate } from "@/utils/helper";
import { getLeadDisplayData } from "@/utils/lead-display";
import { Badge } from "../ui/badge";
import { HighlightText } from "../ui/highlight-text";
import { LeadDetailModal } from "./lead-detail-modal";

interface LeadTableProps {
	leads: Lead[];
	searchTerms?: string;
	showSummary?: boolean;
}

// Status badge config
const statusConfig: Record<
	string,
	{ label: string; color: string; dot: string }
> = {
	pending: {
		label: "Pending",
		color: "bg-gray-50 text-gray-800 border-gray-100",
		dot: "bg-gray-300",
	},
	scraped: {
		label: "Scraped",
		color: "bg-indigo-50 text-indigo-800 border-indigo-100",
		dot: "bg-indigo-400",
	},
	enriching: {
		label: "Enriching",
		color: "bg-blue-50 text-blue-800 border-blue-100",
		dot: "bg-blue-400",
	},
	enriched: {
		label: "Enriched",
		color: "bg-purple-50 text-purple-800 border-purple-100",
		dot: "bg-purple-400",
	},
	error: {
		label: "Error",
		color: "bg-red-50 text-red-800 border-red-100",
		dot: "bg-red-400",
	},
};

export function LeadTable({
	leads,
	searchTerms,
	showSummary = true,
}: LeadTableProps) {
	const highlightTerms = searchTerms ? [searchTerms] : [];
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Calculate summary statistics for business insights
	const summaryStats = React.useMemo(() => {
		const total = leads.length;
		const pending = leads.filter((l) => l.status === "pending").length;
		const scraped = leads.filter((l) => l.status === "scraped").length;
		const enriched = leads.filter((l) => l.status === "enriched").length;
		const verifiedEmail = leads.filter(
			(l) => l.verify_email_status === "verified"
		).length;

		return {
			total,
			pending,
			scraped,
			enriched,
			verifiedEmail,
		};
	}, [leads]);

	const handleLeadClick = (lead: Lead) => {
		setSelectedLead(lead);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedLead(null);
	};

	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-gray-200 border-b-2 bg-gray-50/80 hover:bg-gray-50/80">
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Source
						</TableHead>
						<TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm">
							Web URL / Title
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Status
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Email
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Phone
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Address
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Created At
						</TableHead>
						<TableHead className="h-12 w-[120px] px-4 text-center font-semibold text-gray-900 text-sm">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{leads.map((lead) => (
						<LeadRow
							highlightTerms={highlightTerms}
							key={lead.id}
							lead={lead}
							onLeadClick={handleLeadClick}
						/>
					))}
				</TableBody>
			</Table>

			{/* Business Summary Footer */}
			{showSummary && leads.length > 0 && (
				<div className="border-gray-200 border-t bg-gray-50/50 px-6 py-4">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center space-x-6 text-gray-600">
							<span className="font-medium">
								{summaryStats.total} Total Leads
							</span>
							<span className="flex items-center space-x-1">
								<div className="mr-1 h-2 w-2 rounded-full bg-indigo-500" />
								{summaryStats.scraped} Scraped
							</span>
							<span className="flex items-center space-x-1">
								<div className="mr-1 h-2 w-2 rounded-full bg-purple-500" />
								{summaryStats.enriched} Enriched
							</span>
							<span className="flex items-center space-x-1">
								<div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
								{summaryStats.verifiedEmail} Verified Email
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Lead Detail Modal */}
			<LeadDetailModal
				isOpen={isModalOpen}
				lead={selectedLead}
				onClose={handleCloseModal}
			/>
		</div>
	);
}

const LeadRow = ({
	lead,
	highlightTerms,
	onLeadClick,
}: {
	lead: Lead;
	highlightTerms: string[];
	onLeadClick: (lead: Lead) => void;
}) => {
	const router = useRouter();
	const sourceInfo = leadSourceColorConfig[lead.source];

	const statusInfo = statusConfig[lead.status] || {
		label: lead.status || "N/A",
		color: "bg-gray-100 text-gray-800 border-gray-200",
		dot: "bg-gray-400",
	};

	const totalScore = leadScoringService.scoreLead(lead);

	// Get display data based on source type
	const displayData = getLeadDisplayData(lead);

	return (
		<TableRow
			aria-label={`Lead ${lead.url}`}
			className="group cursor-pointer transition-colors hover:bg-indigo-50/50"
			key={lead.id}
		>
			{/* Source */}
			<TableCell className="py-3 text-center align-middle">
				<Badge
					className={`${sourceInfo.badge}gap-1 rounded border px-2 py-1 font-semibold`}
				>
					{sourceInfo.label}
				</Badge>
			</TableCell>

			{/* Business Name / Title */}
			<TableCell className="max-w-[270px] py-3 pl-4 align-middle">
				<div className="max-w-[270px] font-medium text-gray-900 text-sm">
					<div className="flex items-center gap-1">
						{displayData.actualUrl ? (
							<a
								aria-label="Open link"
								className="inline-flex items-center"
								href={displayData.actualUrl}
								rel="noopener noreferrer"
								target="_blank"
								title={displayData.actualUrl}
							>
								<ExternalLink aria-hidden="true" className="h-3 w-3" />
							</a>
						) : (
							<span className="inline-flex items-center opacity-50">
								<ExternalLink aria-hidden="true" className="h-3 w-3" />
							</span>
						)}
						<div className="max-w-[240px] gap-1 truncate">
							<HighlightText
								highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded"
								highlightTerms={highlightTerms}
								text={displayData.displayTitle}
							/>
						</div>
					</div>
					<div className="mt-1 flex max-w-[240px] items-center gap-1 truncate text-gray-500 text-xs">
						<MapPin className="h-3 w-3 flex-shrink-0" />
						<span className="truncate" title={displayData.displaySubtitle}>
							{displayData.displaySubtitle}
						</span>
					</div>
				</div>
			</TableCell>

			{/* Status */}
			<TableCell className="py-3 text-center align-middle">
				<div className="flex flex-col items-center">
					<Badge
						className={
							statusInfo.color +
							"mb-1 inline-flex items-center gap-1 rounded border px-2 py-1 font-semibold text-xs"
						}
					>
						<div className={`mr-1.5 h-2 w-2 rounded-full ${statusInfo.dot}`} />
						{statusInfo.label}
					</Badge>
					{totalScore > 0 && (
						<span className="mt-0.5 gap-1 font-medium text-gray-500 text-sm">
							Score: {totalScore}
						</span>
					)}
				</div>
			</TableCell>

			{/* Verify Email Status */}
			<TableCell className="py-3 align-middle">
				<div className="flex flex-col items-center">
					<div className="flex items-center justify-center gap-2">
						{(() => {
							if (lead.scrap_info?.emails?.length === 0) {
								return null;
							}

							if (lead.verify_email_status === "verified") {
								return (
									<>
										<CheckCircle2
											aria-label="Verified"
											className="h-4 w-4 text-green-500"
										/>
										<span className="font-medium text-green-700 text-sm">
											Verified
										</span>
									</>
								);
							}
							if (lead.verify_email_status === "pending") {
								return (
									<>
										<Clock
											aria-label="Pending"
											className="h-4 w-4 text-gray-400"
										/>
										<span className="font-medium text-gray-600 text-sm">
											Pending
										</span>
									</>
								);
							}
							if (lead.verify_email_status === "failed") {
								return (
									<>
										<XCircle
											aria-label="Failed"
											className="h-4 w-4 text-red-500"
										/>
										<span className="font-medium text-red-700 text-sm">
											Failed
										</span>
									</>
								);
							}
							if (lead.verify_email_status === "invalid") {
								return (
									<>
										<XCircle
											aria-label="Invalid"
											className="h-4 w-4 text-orange-500"
										/>
										<span className="font-medium text-orange-700 text-sm">
											Invalid
										</span>
									</>
								);
							}
							return (
								<span className="font-medium text-gray-400 text-sm">N/A</span>
							);
						})()}
					</div>
					<span className="mt-1 flex items-center gap-1 font-medium text-gray-500 text-sm">
						<Mail aria-label="Email" className="mr-1 h-4 w-4 text-gray-400" />
						{lead.scrap_info?.emails && lead.scrap_info?.emails?.length > 0
							? lead.scrap_info.emails[0]
							: "N/A"}
					</span>
				</div>
			</TableCell>

			{/* Phone Numbers Found */}
			<TableCell className="py-3 align-middle">
				<div className="flex flex-col items-center">
					<span className="mt-1 flex items-center gap-1 font-medium text-gray-500 text-sm">
						<Mail aria-label="Email" className="mr-1 h-4 w-4 text-gray-400" />
						{lead.scrap_info?.phone && lead.scrap_info?.phone?.length > 0
							? lead.scrap_info.phone
							: "N/A"}
					</span>
				</div>
			</TableCell>

			{/* Address */}
			<TableCell className="py-3 align-middle">
				<div className="flex justify-center">
					<span className="mt-1 max-w-[200px] items-center gap-1 truncate font-medium text-gray-500 text-sm">
						{lead.scrap_info?.address && lead.scrap_info?.address?.length > 0
							? lead.scrap_info.address
							: "N/A"}
					</span>
				</div>
			</TableCell>

			{/* Created At */}
			<TableCell className="py-3 text-center align-middle">
				<div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
					<Calendar aria-hidden="true" className="h-4 w-4 text-gray-400" />
					<time dateTime={lead.created_at}>{formatDate(lead.created_at)}</time>
				</div>
			</TableCell>

			{/* Quick Actions */}
			<TableCell className="py-3 text-center align-middle">
				<div className="flex items-center justify-center space-x-1">
					{lead.verify_email_status !== "pending" && (
						<>
							<Button
								aria-label="Quick View"
								className="h-7 w-7 p-0 hover:bg-indigo-100 hover:text-indigo-700 focus:ring-2 focus:ring-indigo-500/20"
								onClick={() => onLeadClick(lead)}
								size="sm"
								title="Quick View"
								type="button"
								variant="ghost"
							>
								<Eye aria-hidden="true" className="h-4 w-4" />
							</Button>
							<Button
								aria-label="Go to Detail Page"
								className="h-7 w-7 p-0 hover:bg-purple-100 hover:text-purple-700 focus:ring-2 focus:ring-purple-500/20"
								onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
								size="sm"
								title="Go to Detail Page"
								type="button"
								variant="ghost"
							>
								<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
							</Button>
						</>
					)}
				</div>
			</TableCell>
		</TableRow>
	);
};
