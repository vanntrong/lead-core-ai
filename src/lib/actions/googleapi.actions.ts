"use server";

import { googleApiService } from "@/services/googleapi.service";
import type { Lead } from "@/types/lead";

export async function fetchSpreadsheetsAction(token: string) {
	try {
		const files = await googleApiService.fetchSpreadsheets(token);
		return {
			success: true,
			files,
			message: "Fetched spreadsheets successfully",
		};
	} catch (error: any) {
		console.error("Error in fetchSpreadsheetsAction:", error);
		return {
			success: false,
			message: error?.message || "Failed to fetch spreadsheets",
		};
	}
}

export async function createNewSpreadsheetAction(token: string, name: string) {
	try {
		const sheet = await googleApiService.createNewSpreadsheet(token, name);
		return {
			success: true,
			sheet,
			message: "Spreadsheet created successfully",
		};
	} catch (error: any) {
		console.error("Error in createNewSpreadsheetAction:", error);
		return {
			success: false,
			message: error?.message || "Failed to create spreadsheet",
		};
	}
}

export async function exportLeadToSheetAction(
	token: string,
	sheetId: string,
	lead: Lead
) {
	try {
		await googleApiService.exportLeadToSheet(token, sheetId, lead);
		return {
			success: true,
			message: "Lead exported to sheet successfully",
		};
	} catch (error: any) {
		console.error("Error in exportLeadToSheetAction:", error);
		return {
			success: false,
			message: error?.message || "Failed to export lead to sheet",
		};
	}
}

export async function exportLeadsToSheetAction(
	token: string,
	sheetId: string,
	leads: Lead[]
) {
	try {
		await googleApiService.exportLeadsToSheet(token, sheetId, leads);
		return {
			success: true,
			message: "Leads exported to sheet successfully",
		};
	} catch (error: any) {
		console.error("Error in exportLeadsToSheetAction:", error);
		return {
			success: false,
			message: error?.message || "Failed to export leads to sheet",
		};
	}
}
