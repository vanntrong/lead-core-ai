import { supabase } from "@/lib/supabase";
import type { Database } from "../../database.types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

export class SubscriptionService {
  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Subscription[]) || [];
  }

  /**
   * Get active subscription for a user
   */
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();
    if (error) return null;
    return (data as Subscription) || null;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(sub: SubscriptionInsert): Promise<string | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([sub])
      .select("id")
      .single();
    if (error) throw error;
    return data?.id || null;
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(id: string, sub: SubscriptionUpdate): Promise<boolean> {
    const { error } = await supabase
      .from("subscriptions")
      .update(sub)
      .eq("id", id);
    return !error;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("subscriptions")
      .update({ subscription_status: "canceled", canceled_at: new Date().toISOString() })
      .eq("id", id);
    return !error;
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);
    return !error;
  }
}

export const subscriptionService = new SubscriptionService();
