import type { Lead } from "@/types/lead";

export class GoogleApiService {
	async fetchSpreadsheets(
		token: string
	): Promise<{ id: string; name: string }[]> {
		const res = await fetch(
			"https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&orderBy=modifiedTime desc",
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		if (!res.ok) { throw new Error("Failed to fetch spreadsheets"); }
		const data = await res.json();
		return data.files || [];
	}

	async createNewSpreadsheet(
		token: string,
		name: string
	): Promise<{ id: string; name: string }> {
		if (!token) { throw new Error("No access token provided"); }
		if (!name || name.trim() === "") {
			throw new Error("Please enter a spreadsheet name");
		}
		console.log('token', token)
		const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				properties: { title: name },
				sheets: [
					{
						properties: {
							title: "Leads",
						},
					},
				],
			}),
		});
		console.log(res)
		if (!res.ok) { throw new Error("Failed to create spreadsheet"); }
		const newSheet = await res.json();
		console.log("newSheet", newSheet)
		return { id: newSheet.spreadsheetId, name };
	}

	async exportLeadToSheet(
		token: string,
		sheetId: string,
		lead: Lead
	): Promise<void> {
		if (!token) { throw new Error("No access token provided"); }
		if (!lead) { throw new Error("No lead data to export"); }
		if (!sheetId) { throw new Error("Please select a spreadsheet"); }

		const leadRow = [
			lead.id,
			lead.url,
			lead.source,
			lead.status,
			lead.created_at,
			lead.scrap_info?.title || "N/A",
			lead.scrap_info?.desc || "N/A",
			lead.scrap_info?.emails?.join(", ") || "N/A",
			lead.enrich_info?.title_guess || "N/A",
			lead.enrich_info?.summary || "N/A",
		];
		const range = "Leads";
		const body = { values: [leadRow] };
		const res = await fetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}
		);
		if (!res.ok) { throw new Error("Failed to export data to Google Sheet"); }
	}

	async exportLeadsToSheet(
		token: string,
		sheetId: string,
		leads: Lead[]
	): Promise<void> {
		if (!token) { throw new Error("No access token provided"); }
		if (!leads || leads.length === 0) { throw new Error("No leads data to export"); }
		if (!sheetId) { throw new Error("Please select a spreadsheet"); }

		const leadRows = leads.map((lead) => [
			lead.id,
			lead.url,
			lead.source,
			lead.status,
			lead.created_at,
			lead.scrap_info?.title || "N/A",
			lead.scrap_info?.desc || "N/A",
			lead.scrap_info?.emails?.join(", ") || "N/A",
			lead.enrich_info?.title_guess || "N/A",
			lead.enrich_info?.summary || "N/A",
		]);
		const range = "Leads";
		const body = { values: leadRows };
		const res = await fetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}
		);
		if (!res.ok) { throw new Error("Failed to export leads to Google Sheet"); }
	}
}

export const googleApiService = new GoogleApiService();
