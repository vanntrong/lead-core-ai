"use client";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type {
	PaginatedProxyHealCheckLogResponse,
	ProxyHealCheckLog,
} from "@/types/proxy_heal_check_log";
import { formatDate } from "@/utils/helper";
import { Calendar } from "lucide-react";

interface ProxyHealCheckLogsTableProps {
	paginatedLogs?: PaginatedProxyHealCheckLogResponse;
	loading?: boolean;
	error?: any;
}

const statusConfig: Record<
	string,
	{ label: string; color: string; dot: string }
> = {
	success: {
		label: "Success",
		color: "bg-green-50 text-green-800 border-green-100",
		dot: "bg-green-400",
	},
	failed: {
		label: "Failed",
		color: "bg-red-50 text-red-800 border-red-100",
		dot: "bg-red-400",
	},
};

export function ProxyHealCheckLogsTable({
	paginatedLogs,
	loading,
	error,
}: Readonly<ProxyHealCheckLogsTableProps>) {
	if (loading) { return <div>Loading logs...</div>; }
	if (error) { return <div>Error loading logs</div>; }
	if (!paginatedLogs || paginatedLogs.data.length === 0) {
		return <div>No proxy heal check logs found.</div>;
	}

	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-gray-200 border-b-2 bg-gray-50/80 hover:bg-gray-50/80">
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Proxy Host
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Port
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Status
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Error
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Duration (ms)
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Timestamp
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{paginatedLogs.data.map((log) => (
						<ProxyHealCheckLogRow key={log.id} log={log} />
					))}
				</TableBody>
			</Table>
			{/* Pagination controls can be added here */}
		</div>
	);
}

const ProxyHealCheckLogRow = ({ log }: { log: ProxyHealCheckLog }) => {
	const statusInfo = statusConfig[log.status] || {
		label: log.status || "N/A",
		color: "bg-gray-100 text-gray-800 border-gray-200",
		dot: "bg-gray-400",
	};
	return (
		<TableRow
			className="group cursor-pointer transition-colors hover:bg-indigo-50/50"
			key={log.id}
			aria-label={`Proxy heal check log ${log.proxy_host}`}
		>
			{/* Proxy Host */}
			<TableCell className="py-3 text-center align-middle">
				<span className="text-gray-700 text-sm">{log.proxy_host}</span>
			</TableCell>
			{/* Proxy Port */}
			<TableCell className="py-3 text-center align-middle">
				<span className="text-gray-700 text-sm">{log.proxy_port}</span>
			</TableCell>
			{/* Status */}
			<TableCell className="py-3 text-center align-middle">
				<Badge
					className={
						statusInfo.color +
						"mb-1 inline-flex items-center gap-1 rounded border px-2 py-1 font-semibold text-xs"
					}
				>
					<div className={`mr-1.5 h-2 w-2 rounded-full ${statusInfo.dot}`} />
					{statusInfo.label}
				</Badge>
			</TableCell>
			{/* Error */}
			<TableCell className="max-w-[270px] py-3 text-center align-middle">
				{log.error ? (
					<span
						className="block max-w-[240px] cursor-help truncate text-red-600 text-sm"
						style={{
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
						title={log.error || undefined}
					>
						{log.error}
					</span>
				) : (
					<span className="text-gray-400 text-sm">None</span>
				)}
			</TableCell>
			{/* Duration */}
			<TableCell className="py-3 text-center align-middle">
				<span className="text-gray-700 text-sm">
					{typeof log.duration === "number" ? log.duration : "-"}
				</span>
			</TableCell>
			{/* Timestamp */}
			<TableCell className="py-3 text-center align-middle">
				<div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
					<Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
					<time dateTime={log.created_at}>{formatDate(log.created_at)}</time>
				</div>
			</TableCell>
		</TableRow>
	);
};
