"use server";

import { proxyHealCheckLogsAdminService } from "@/services/proxy-heal-check-logs-admin.service";
import type {
  ProxyHealCheckLogFilters,
  CreateProxyHealCheckLogData,
  UpdateProxyHealCheckLogData,
} from "@/types/proxy_heal_check_log";

export async function getProxyHealCheckLogsAdminAction(filters?: ProxyHealCheckLogFilters) {
  try {
    return await proxyHealCheckLogsAdminService.getLogs(filters);
  } catch (error) {
    console.error("Error in getProxyHealCheckLogsAdminAction:", error);
    throw error;
  }
}

export async function getProxyHealCheckLogByIdAdminAction(id: string) {
  try {
    return await proxyHealCheckLogsAdminService.getLogById(id);
  } catch (error) {
    console.error("Error in getProxyHealCheckLogByIdAdminAction:", error);
    throw error;
  }
}

export async function getProxyHealCheckLogsPaginatedAdminAction(filters?: ProxyHealCheckLogFilters) {
  try {
    return await proxyHealCheckLogsAdminService.getLogsPaginated(filters);
  } catch (error) {
    console.error("Error in getProxyHealCheckLogsPaginatedAdminAction:", error);
    throw error;
  }
}

export async function createProxyHealCheckLogAdminAction(data: CreateProxyHealCheckLogData) {
  try {
    const log = await proxyHealCheckLogsAdminService.createLog(data);
    return log;
  } catch (error) {
    console.error("Error in createProxyHealCheckLogAdminAction:", error);
    throw error;
  }
}

export async function updateProxyHealCheckLogAdminAction(data: UpdateProxyHealCheckLogData) {
  try {
    const log = await proxyHealCheckLogsAdminService.updateLog(data);
    return log;
  } catch (error) {
    console.error("Error in updateProxyHealCheckLogAdminAction:", error);
    throw error;
  }
}

export async function deleteProxyHealCheckLogAdminAction(id: string) {
  try {
    await proxyHealCheckLogsAdminService.deleteLog(id);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProxyHealCheckLogAdminAction:", error);
    throw error;
  }
}

export async function getProxyHealCheckLogStatsAdminAction() {
  try {
    return await proxyHealCheckLogsAdminService.getLogStats();
  } catch (error) {
    console.error("Error in getProxyHealCheckLogStatsAdminAction:", error);
    throw error;
  }
}
