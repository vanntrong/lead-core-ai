import { leadScoringService } from "@/services/lead-scoring.service";
import type { Lead } from "../types/lead";

export type LeadExportFormat = "csv" | "google_sheets" | "zapier" | "ghl";

export interface LeadExportOptions {
	format: LeadExportFormat;
	leads: Lead[];
	webhookUrl?: string; // For Zapier/GHL
	googleSheetId?: string; // For Google Sheets
}

export class LeadExportService {
	// Export leads to CSV string
	exportToCSV(leads: Lead[]) {
		if (!leads.length) {
			return;
		}

		const headers = [
			"URL",
			"Source",
			"Status",
			"Title",
			"Description",
			"Enrichment Title",
			"Enrichment Summary",
			"Emails",
			"Verified Email Status",
			"Score",
		];
		const rows = leads.map((lead) => [
			lead.url,
			lead.source,
			lead.status,
			lead.scrap_info?.title ?? "",
			lead.scrap_info?.desc ?? "",
			lead.enrich_info?.title_guess ?? "",
			lead.enrich_info?.summary ?? "",
			(lead.scrap_info?.emails ?? []).join(", "),
			lead?.verify_email_status ?? "",
			leadScoringService.scoreLead(lead).toString(),
		]);
		const content = [
			headers.join(","),
			...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
		].join("\n");

		const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		// Generate filename based on number of leads
		const timestamp = new Date().toISOString().split("T")[0];
		const filename =
			leads.length === 1
				? `lead-${leads[0]?.id || "export"}.csv`
				: `leads-export-${timestamp}-${leads.length}-leads.csv`;

		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// Send leads to Zapier or GHL webhook
	async exportToWebhook(leads: Lead[], webhookUrl: string): Promise<any> {
		try {
			const headers = [
				"URL",
				"Source",
				"Status",
				"Title",
				"Description",
				"Enrichment Title",
				"Enrichment Summary",
				"Emails",
				"Verified Email Status",
				"Score",
			];
			const rows = leads.map((lead) => [
				lead.url,
				lead.source,
				lead.status,
				lead.scrap_info?.title ?? "",
				lead.scrap_info?.desc ?? "",
				lead.enrich_info?.title_guess ?? "",
				lead.enrich_info?.summary ?? "",
				(lead.scrap_info?.emails ?? []).join(", "),
				lead?.verify_email_status ?? "",
				leadScoringService.scoreLead(lead).toString(),
			]);
			const payloadArray = rows.map((row) =>
				Object.fromEntries(headers.map((h, i) => [h, row[i]]))
			);
			const resp = await fetch("/api/forward-webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ webhookUrl, data: payloadArray }),
			});
			if (!resp.ok) {
				const _text = await resp.text();
				throw new Error(
					`Webhook export failed: ${resp.status} ${resp.statusText}.`
				);
			}
			return { success: true };
		} catch (error) {
			console.error("Error exporting to webhook:", error);
			throw error;
		}
	}

	// Main export function
	export(options: LeadExportOptions): Promise<any> | undefined {
		const { format, leads, webhookUrl } = options;
		if (format === "csv") {
			this.exportToCSV(leads);
			return;
		}
		if (format === "zapier" || format === "ghl") {
			if (!webhookUrl) {
				throw new Error("Missing webhook URL");
			}
			return this.exportToWebhook(leads, webhookUrl);
		}
		throw new Error("Unsupported export format");
	}
}

export const leadExportService = new LeadExportService();
