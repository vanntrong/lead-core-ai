"use server";

import { leadAdminService } from "@/services/lead-admin.service";
import type { Lead, LeadFilters } from "@/types/lead";

export async function getLeadsPaginatedAction(filters?: LeadFilters) {
  try {
    return await leadAdminService.getLeadsPaginated(filters);
  } catch (error) {
    console.error("Error in getLeadsPaginatedAction:", error);
    throw error;
  }
}

export async function flagLeadAdminAction(id: string) {
  try {
    return await leadAdminService.flagLead(id);
  } catch (error) {
    console.error("Error in flagLeadAdminAction:", error);
    throw error;
  }
}

export async function updateLeadAdminAction(data: Partial<Lead> & { id: string }) {
  try {
    return await leadAdminService.updateLead(data);
  } catch (error) {
    console.error("Error in updateLeadAdminAction:", error);
    throw error;
  }
}

export async function deleteLeadAdminAction(id: string) {
  try {
    await leadAdminService.deleteLead(id);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteLeadAdminAction:", error);
    throw error;
  }
}
