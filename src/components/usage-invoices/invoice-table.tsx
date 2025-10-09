"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { InvoiceRow } from "@/types/invoice";
import { Calendar, Download, Link } from "lucide-react";
import { useRouter } from "next/navigation";

interface InvoiceTableProps {
	invoices: InvoiceRow[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
	draft: { label: "Draft", color: "bg-gray-50 text-gray-800 border-gray-100" },
	open: { label: "Open", color: "bg-blue-50 text-blue-800 border-blue-100" },
	paid: { label: "Paid", color: "bg-green-50 text-green-800 border-green-100" },
	uncollectible: {
		label: "Uncollectible",
		color: "bg-orange-50 text-orange-800 border-orange-100",
	},
	void: { label: "Void", color: "bg-red-50 text-red-800 border-red-100" },
};

export function InvoiceTable({ invoices }: InvoiceTableProps) {
	const _router = useRouter();

	return (
		<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="border-gray-200 border-b-2 bg-gray-50/80 hover:bg-gray-50/80">
						<TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm">
							Invoice ID
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Status
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Amount
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Period
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							Created At
						</TableHead>
						<TableHead className="h-12 px-4 text-center font-semibold text-gray-900 text-sm">
							PDF
						</TableHead>
						<TableHead className="h-12 w-[120px] px-4 text-center font-semibold text-gray-900 text-sm">
							Actions
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{invoices.map((invoice) => (
						<TableRow key={invoice.id} className="group hover:bg-indigo-50/50">
							<TableCell className="py-3 font-mono">{invoice.id}</TableCell>
							<TableCell className="py-3 text-center">
								<Badge
									className={`${statusConfig[invoice.status || "draft"]?.color} gap-1 rounded border px-2 py-1 font-semibold`}
								>
									{statusConfig[invoice.status || "draft"]?.label ||
										invoice.status}
								</Badge>
							</TableCell>
							<TableCell className="py-3 text-center font-semibold text-gray-900 text-sm">
								{invoice.amount_paid != null
									? `$${(invoice.amount_paid / 100).toLocaleString()}`
									: `$${(invoice.amount_due ?? 0 / 100).toLocaleString()}`}
								<span className="ml-1 font-medium text-gray-500 text-sm">
									{invoice.currency?.toUpperCase() || "USD"}
								</span>
							</TableCell>
							<TableCell className="py-3 text-center text-gray-600 text-sm">
								{invoice.period_start && invoice.period_end
									? `${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(invoice.period_end).toLocaleDateString()}`
									: "N/A"}
							</TableCell>
							<TableCell className="py-3 text-center">
								<div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
									<Calendar
										className="h-4 w-4 text-gray-400"
										aria-hidden="true"
									/>
									<time dateTime={invoice.created_at ?? undefined}>
										{invoice.created_at
											? new Date(invoice.created_at).toLocaleDateString()
											: "N/A"}
									</time>
								</div>
							</TableCell>
							<TableCell className="py-3 text-center">
								<div className="flex items-center justify-center">
									{invoice.invoice_pdf ? (
										<a
											href={invoice.invoice_pdf}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-indigo-600 text-sm hover:underline"
										>
											<Download className="h-4 w-4" /> Download
										</a>
									) : (
										<span className="text-gray-400">N/A</span>
									)}
								</div>
							</TableCell>
							<TableCell className="py-3 text-center">
								<div className="flex items-center justify-center">
									{invoice.hosted_invoice_url && (
										<Button
											variant="ghost"
											size="sm"
											title="View on Stripe"
											className="h-7 w-7 p-0 hover:bg-indigo-100 hover:text-indigo-700 focus:ring-2 focus:ring-indigo-500/20"
										>
											<a
												href={invoice.hosted_invoice_url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-indigo-600 hover:underline"
											>
												<Link className="inline h-4 w-4" />
											</a>
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
