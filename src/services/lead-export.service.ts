import type { Lead } from "../types/lead";
import { leadScoringService } from "@/services/lead-scoring.service"

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
    if (!leads.length) return;

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
      "Score"
    ];
    const rows = leads.map(lead => [
      lead.url,
      lead.source,
      lead.status,
      lead.scrap_info?.title ?? "",
      lead.scrap_info?.desc ?? "",
      lead.enrich_info?.title_guess ?? "",
      lead.enrich_info?.summary ?? "",
      (lead.scrap_info?.emails ?? []).join(", "),
      lead?.verify_email_status ?? "",
      leadScoringService.scoreLead(lead).toString()
    ]);
    const content = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `lead-${leads[0]?.id || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export to Google Sheets (requires OAuth and Google Sheets API)
  async exportToGoogleSheets(leads: Lead[], sheetId: string, accessToken: string): Promise<any> {
    // This is a stub. You need to implement Google Sheets API integration here.
    // See: https://developers.google.com/sheets/api/guides/write-data
    throw new Error("Google Sheets export not implemented");
  }

  // Send leads to Zapier or GHL webhook
  async exportToWebhook(leads: Lead[], webhookUrl: string): Promise<any> {
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
      "Score"
    ];
    const rows = leads.map(lead => [
      lead.url,
      lead.source,
      lead.status,
      lead.scrap_info?.title ?? "",
      lead.scrap_info?.desc ?? "",
      lead.enrich_info?.title_guess ?? "",
      lead.enrich_info?.summary ?? "",
      (lead.scrap_info?.emails ?? []).join(", "),
      lead?.verify_email_status ?? "",
      leadScoringService.scoreLead(lead).toString()
    ]);
    // Gửi toàn bộ leads qua API chuyển tiếp để tránh lỗi CORS
    const payloadArray = rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
    await fetch('/api/forward-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ webhookUrl, data: payloadArray })
    });
    return { success: true };
  }

  // Main export function
  async export(options: LeadExportOptions): Promise<string | void> {
    const { format, leads, webhookUrl, googleSheetId } = options;
    switch (format) {
      case "csv":
        return this.exportToCSV(leads);
      case "google_sheets":
        if (!googleSheetId) throw new Error("Missing Google Sheet ID");
        // You must provide OAuth access token for Google Sheets API
        return this.exportToGoogleSheets(leads, googleSheetId, "YOUR_ACCESS_TOKEN");
      case "zapier":
      case "ghl":
        if (!webhookUrl) throw new Error("Missing webhook URL");
        return this.exportToWebhook(leads, webhookUrl);
      default:
        throw new Error("Unsupported export format");
    }
  }
}

export const leadExportService = new LeadExportService();
