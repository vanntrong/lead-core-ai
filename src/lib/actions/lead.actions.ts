"use server";

import { leadService } from "@/services/lead.service";
import type { CreateLeadData, LeadFilters, UpdateLeadData } from "@/types/lead";
import { revalidatePath } from "next/cache";

export async function getLeadsAction(filters?: LeadFilters) {
  try {
    return await leadService.getLeads(filters);
  } catch (error) {
    console.error("Error in getLeadsAction:", error);
    throw error;
  }
}

export async function getLeadByIdAction(id: string) {
  try {
    return await leadService.getLeadById(id);
  } catch (error) {
    console.error("Error in getLeadByIdAction:", error);
    throw error;
  }
}

export async function getLeadsPaginatedAction(filters?: LeadFilters) {
  try {
    return await leadService.getLeadsPaginated(filters);
  } catch (error) {
    console.error("Error in getLeadsPaginatedAction:", error);
    throw error;
  }
}

export async function createLeadAction(data: CreateLeadData) {
  try {
    const lead = await leadService.createLead(data);
    revalidatePath("/dashboard/leads");
    return {
      id: lead.id,
      success: true,
      message: "Lead created successfully"
    };
  } catch (error: any) {
    console.error("Error in createLeadAction:", error);
    return { success: false, message: error?.message || "Failed to create lead" };
  }
}

export async function updateLeadAction(data: UpdateLeadData) {
  try {
    const lead = await leadService.updateLead(data);
    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${data.id}`);
    return lead;
  } catch (error) {
    console.error("Error in updateLeadAction:", error);
    throw error;
  }
}

export async function deleteLeadAction(id: string) {
  try {
    await leadService.deleteLead(id);
    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteLeadAction:", error);
    throw error;
  }
}

export async function getLeadStatsAction() {
  try {
    return await leadService.getLeadStats();
  } catch (error) {
    console.error("Error in getLeadStatsAction:", error);
    throw error;
  }
}

export async function generateMockLeadsAction() {
  try {
    return await leadService.generateMockLeads();
  } catch (error) {
    console.error("Error in generateMockLeadsAction:", error);
    throw error;
  }
}
