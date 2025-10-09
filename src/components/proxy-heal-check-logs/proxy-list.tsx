"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Proxy, ProxyStatus } from "@/types/proxy";
import { formatDate } from "@/utils/helper";
import { Activity, AlertCircle, Server } from "lucide-react";

interface ProxyListProps {
	isLoading?: boolean;
	proxies?: Proxy[];
}

export function ProxyList({
	isLoading,
	proxies = [],
}: Readonly<ProxyListProps>) {
	const getStatusConfig = (status: ProxyStatus) => {
		switch (status) {
			case "active":
				return {
					color: "bg-green-50 text-green-800 border-green-200",
					icon: <Activity className="h-3 w-3 text-green-600" />,
					label: "Active",
				};
			case "inactive":
				return {
					color: "bg-gray-50 text-gray-800 border-gray-200",
					icon: <Server className="h-3 w-3 text-gray-600" />,
					label: "Inactive",
				};
			case "error":
				return {
					color: "bg-red-50 text-red-800 border-red-200",
					icon: <AlertCircle className="h-3 w-3 text-red-600" />,
					label: "Error",
				};
			default:
				return {
					color: "bg-gray-50 text-gray-800 border-gray-200",
					icon: <Server className="h-3 w-3 text-gray-600" />,
					label: "Unknown",
				};
		}
	};

	if (isLoading) {
		return (
			<div className="mb-8">
				<div className="mb-6 flex items-center justify-between pt-2">
					<h3 className="font-semibold text-gray-900 text-lg">
						Proxies Status
					</h3>
					<div className="ml-4 flex-1 border-gray-200 border-t" />
				</div>
				<div className="mb-4 flex gap-2 text-sm">
					<span className="text-gray-600">
						Total:{" "}
						<span className="inline-block h-4 w-8 rounded bg-gray-200 align-middle" />
					</span>
					<span className="text-green-600">
						Active:{" "}
						<span className="inline-block h-4 w-8 rounded bg-gray-200 align-middle" />
					</span>
					<span className="text-gray-500">
						Inactive:{" "}
						<span className="inline-block h-4 w-8 rounded bg-gray-200 align-middle" />
					</span>
					<span className="text-red-600">
						Error:{" "}
						<span className="inline-block h-4 w-8 rounded bg-gray-200 align-middle" />
					</span>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					{Array.from(
						{ length: 3 },
						(_, i) => `loading-proxy-skeleton-${Date.now()}-${i}`
					).map((uniqueKey) => (
						<Card key={uniqueKey} className="animate-pulse p-4">
							<div className="mb-3 flex items-center justify-between">
								<div className="h-4 w-32 rounded bg-gray-200" />
								<div className="h-5 w-16 rounded bg-gray-200" />
							</div>
							<div className="space-y-2">
								<div className="h-3 w-24 rounded bg-gray-200" />
								<div className="h-3 w-20 rounded bg-gray-200" />
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Calculate statistics
	const stats = {
		total: proxies.length,
		active: proxies.filter((p) => p.status === "active").length,
		inactive: proxies.filter((p) => p.status === "inactive").length,
		error: proxies.filter((p) => p.status === "error").length,
	};

	return (
		<div className="mb-8">
			<div className="mb-6 flex items-center justify-between pt-2">
				<h3 className="font-semibold text-gray-900 text-lg">Proxies Status</h3>
				<div className="ml-4 flex-1 border-gray-200 border-t" />
			</div>
			<div className="mb-4 flex gap-2 text-sm">
				<span className="text-gray-600">Total: {stats.total}</span>
				<span className="text-green-600">Active: {stats.active}</span>
				<span className="text-gray-500">Inactive: {stats.inactive}</span>
				<span className="text-red-600">Error: {stats.error}</span>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{proxies.map((proxy) => {
					const statusConfig = getStatusConfig(proxy.status);

					return (
						<Card
							key={`${proxy.host}:${proxy.port}`}
							className="p-4 transition-shadow hover:shadow-md"
						>
							<div className="mb-3 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Server className="h-4 w-4 text-gray-600" />
									<span className="font-mono text-gray-900 text-sm">
										{proxy.host}:{proxy.port}
									</span>
								</div>
								<Badge
									className={`${statusConfig.color} flex items-center gap-1 px-2 py-1 text-xs`}
								>
									{statusConfig.icon}
									{statusConfig.label}
								</Badge>
							</div>
							<div className="flex flex-col gap-2 text-gray-600 text-xs sm:flex-row sm:items-center sm:justify-between">
								<div className="flex flex-col gap-1">
									{proxy.last_checked_at && (
										<div>Last checked: {formatDate(proxy.last_checked_at)}</div>
									)}
									{proxy.avg_response_ms && proxy.status === "active" && (
										<div>Avg Response: {proxy.avg_response_ms} ms</div>
									)}
								</div>
								<div className="flex flex-col gap-1 sm:items-end sm:text-right">
									{proxy.total_count_24h !== null &&
										proxy.total_count_24h > 0 && (
											<div>Total requests (24h): {proxy.total_count_24h}</div>
										)}
									{proxy.error_count_24h !== null &&
										proxy.error_count_24h > 0 && (
											<div className="text-red-600">
												Errors (24h): {proxy.error_count_24h}
											</div>
										)}
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
