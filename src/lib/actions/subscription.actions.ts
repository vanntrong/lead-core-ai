"use server";

import { subscriptionService } from "@/services/subscription.service";
import { revalidatePath } from "next/cache";

export async function getSubscriptionsAction() {
  try {
    return await subscriptionService.getUserSubscriptions();
  } catch (error) {
    console.error("Error in getSubscriptionsAction:", error);
    throw error;
  }
}

export async function getActiveSubscriptionAction() {
  try {
    return await subscriptionService.getUserActiveSubscription();
  } catch (error) {
    console.error("Error in getActiveSubscriptionAction:", error);
    throw error;
  }
}

export async function cancelSubscriptionAction() {
  try {
    const result = await subscriptionService.cancelSubscription();
    revalidatePath("/dashboard/usage-invoices");
    return {
      success: result,
      message: "Subscription cancelled successfully"
    };
  } catch (error: any) {
    console.error("Error in cancelSubscriptionAction:", error);
    return {
      success: false,
      message: error?.message || "Failed to cancel subscription. Please try again.",
    }
  }
}
