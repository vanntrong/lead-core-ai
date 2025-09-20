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
