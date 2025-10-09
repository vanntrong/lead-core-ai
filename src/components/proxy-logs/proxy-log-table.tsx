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
import type { PaginatedProxyLogResponse, ProxyLog } from "@/types/proxy_log";
import { formatDate } from "@/utils/helper";
import { Calendar, Link } from "lucide-react";

interface ProxyLogTableProps {
	paginatedLogs?: PaginatedProxyLogResponse;
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
	banned: {
		label: "Banned",
		color: "bg-orange-50 text-orange-800 border-orange-100",
		dot: "bg-orange-400",
	},
	timeout: {
		label: "Timeout",
		color: "bg-gray-50 text-gray-800 border-gray-100",
		dot: "bg-gray-300",
	},
	pending: {
		label: "Pending",
		color: "bg-gray-50 text-gray-800 border-gray-100",
		dot: "bg-gray-300",
	},
};

export function ProxyLogTable({
	paginatedLogs,
	loading,
	error,
}: Readonly<ProxyLogTableProps>) {
	if (loading) { return <div>Loading logs...</div>; }
	if (error) { return <div>Error loading logs</div>; }
	if (!paginatedLogs || paginatedLogs.data.length === 0) {
		return <div>No proxy logs found.</div>;
	}

	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-gray-200 border-b-2 bg-gray-50/80 hover:bg-gray-50/80">
						<TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm">
							URL
						</TableHead>
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
							Timestamp
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{paginatedLogs.data.map((log) => (
						<ProxyLogRow key={log.id} log={log} />
					))}
				</TableBody>
			</Table>
			{/* Pagination controls can be added here */}
		</div>
	);
}

const ProxyLogRow = ({ log }: { log: ProxyLog }) => {
	const statusInfo = statusConfig[log.status] || {
		label: log.status || "N/A",
		color: "bg-gray-100 text-gray-800 border-gray-200",
		dot: "bg-gray-400",
	};
	return (
		<TableRow
			className="group cursor-pointer transition-colors hover:bg-indigo-50/50"
			key={log.id}
			aria-label={`Proxy log ${log.web_url}`}
		>
			{/* URL */}
			<TableCell className="max-w-[270px] py-3 pl-4 align-middle">
				<div className="max-w-[270px] font-medium text-gray-900 text-sm">
					<div className="flex items-center gap-1">
						<a
							href={log.web_url || undefined}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center"
							title={log.web_url || undefined}
							aria-label="Open link"
						>
							<Link className="h-3 w-3" aria-hidden="true" />
						</a>
						<div className="max-w-[270px] gap-1 truncate">{log.web_url}</div>
					</div>
				</div>
			</TableCell>
			{/* Proxy Host */}
			<TableCell className="py-3 text-center align-middle">
				<span className="text-gray-700 text-sm">{log.proxy_host}</span>
			</TableCell>
			{/* Proxy IP */}
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
