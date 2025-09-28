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
    const result = await leadAdminService.flagLead(id);
    return {
      success: true,
      message: "Lead flagged successfully",
      leadId: result.id,
    }
  } catch (error: any) {
    console.error("Error in flagLeadAdminAction:", error);
    return {
      success: false,
      message: error?.message || "Failed to flag lead. Please try again."
    }
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
    return {
      success: true
    };
  } catch (error: any) {
    console.error("Error in deleteLeadAdminAction:", error);
    return {
      success: false,
      message: error.message || "Failed to delete lead. Please try again."
    };
  }
}
