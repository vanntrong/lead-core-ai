"use server";

import { scraperLogsAdminService } from "@/services/scraper-logs-admin.service";
import type {
	CreateScraperLogData,
	ScraperLogFilters,
	UpdateScraperLogData,
} from "@/types/scraper_log";

export async function getScraperLogsAdminAction(filters?: ScraperLogFilters) {
	try {
		return await scraperLogsAdminService.getScraperLogs(filters);
	} catch (error) {
		console.error("Error in getScraperLogsAdminAction:", error);
		throw error;
	}
}

export async function getScraperLogByIdAdminAction(id: string) {
	try {
		return await scraperLogsAdminService.getScraperLogById(id);
	} catch (error) {
		console.error("Error in getScraperLogByIdAdminAction:", error);
		throw error;
	}
}

export async function getScraperLogsPaginatedAdminAction(
	filters?: ScraperLogFilters
) {
	try {
		return await scraperLogsAdminService.getScraperLogsPaginated(filters);
	} catch (error) {
		console.error("Error in getScraperLogsPaginatedAdminAction:", error);
		throw error;
	}
}

export async function createScraperLogAdminAction(data: CreateScraperLogData) {
	try {
		const log = await scraperLogsAdminService.createScraperLog(data);
		return log;
	} catch (error) {
		console.error("Error in createScraperLogAdminAction:", error);
		throw error;
	}
}

export async function updateScraperLogAdminAction(data: UpdateScraperLogData) {
	try {
		const log = await scraperLogsAdminService.updateScraperLog(data);
		return log;
	} catch (error) {
		console.error("Error in updateScraperLogAdminAction:", error);
		throw error;
	}
}

export async function deleteScraperLogAdminAction(id: string) {
	try {
		await scraperLogsAdminService.deleteScraperLog(id);
		return { success: true };
	} catch (error) {
		console.error("Error in deleteScraperLogAdminAction:", error);
		throw error;
	}
}

export async function getScraperLogStatsAdminAction() {
	try {
		return await scraperLogsAdminService.getScraperLogStats();
	} catch (error) {
		console.error("Error in getScraperLogStatsAdminAction:", error);
		throw error;
	}
}
