"use server";

import { proxyLogsAdminService } from "@/services/proxy-logs-admin.service";
import type { CreateProxyLogData, ProxyLogFilters, UpdateProxyLogData } from "@/types/proxy_log";

export async function getProxyLogsAdminAction(filters?: ProxyLogFilters) {
  try {
    return await proxyLogsAdminService.getProxyLogs(filters);
  } catch (error) {
    console.error("Error in getProxyLogsAdminAction:", error);
    throw error;
  }
}

export async function getProxyLogByIdAdminAction(id: string) {
  try {
    return await proxyLogsAdminService.getProxyLogById(id);
  } catch (error) {
    console.error("Error in getProxyLogByIdAdminAction:", error);
    throw error;
  }
}

export async function getProxyLogsPaginatedAdminAction(filters?: ProxyLogFilters) {
  try {
    return await proxyLogsAdminService.getProxyLogsPaginated(filters);
  } catch (error) {
    console.error("Error in getProxyLogsPaginatedAdminAction:", error);
    throw error;
  }
}

export async function createProxyLogAdminAction(data: CreateProxyLogData) {
  try {
    const log = await proxyLogsAdminService.createProxyLog(data);
    return log;
  } catch (error) {
    console.error("Error in createProxyLogAdminAction:", error);
    throw error;
  }
}

export async function updateProxyLogAdminAction(data: UpdateProxyLogData) {
  try {
    const log = await proxyLogsAdminService.updateProxyLog(data);
    return log;
  } catch (error) {
    console.error("Error in updateProxyLogAdminAction:", error);
    throw error;
  }
}

export async function deleteProxyLogAdminAction(id: string) {
  try {
    await proxyLogsAdminService.deleteProxyLog(id);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProxyLogAdminAction:", error);
    throw error;
  }
}

export async function getProxyLogStatsAdminAction() {
  try {
    return await proxyLogsAdminService.getProxyLogStats();
  } catch (error) {
    console.error("Error in getProxyLogStatsAdminAction:", error);
    throw error;
  }
}
