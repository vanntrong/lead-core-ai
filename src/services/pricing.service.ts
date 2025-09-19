import { supabase } from "@/lib/supabase";
import type { PricingPlan, PlanTier, PlanLimits } from "@/types/pricing";

export class PricingService {
  /**
   * Get all active pricing plans
   */
  async getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching pricing plans:', error);
      throw new Error('Failed to fetch pricing plans');
    }

    return data || [];
  }

  /**
   * Get a specific pricing plan by tier
   */
  async getPricingPlanByTier(tier: PlanTier): Promise<PricingPlan | null> {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('tier', tier)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching pricing plan:', error);
      return null;
    }

    return data;
  }

  /**
   * Get user's current subscription limits
   */
  async getUserSubscriptionLimits(userId: string): Promise<PlanLimits> {
    const { data, error } = await supabase
      .rpc('get_user_subscription_limits', {
        user_id_param: userId
      });

    if (error) {
      console.error('Error fetching user subscription limits:', error);
      // Return default free limits
      return {
        sources: 0,
        leads_per_month: 0,
        export_enabled: false,
        zapier_export: false,
        enrichments: false
      };
    }

    return (data as unknown) as PlanLimits;
  }

  /**
   * Check if user can perform a specific action
   */
  async canUserPerformAction(
    userId: string,
    actionType: 'scrape_lead' | 'export_leads' | 'zapier_export' | 'enrich_leads',
    currentUsage: Record<string, any> = {}
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('can_user_perform_action', {
        user_id_param: userId,
        action_type: actionType,
        current_usage: currentUsage
      });

    if (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }

    return data || false;
  }

  /**
   * Get user's current subscription details
   */
  async getUserSubscription(userId: string): Promise<{
    subscription: any;
    pricing_plan: PricingPlan | null;
  } | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        pricing_plan:pricing_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return {
      subscription: data,
      pricing_plan: data.pricing_plan
    };
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(
    userId: string,
    pricingPlanId: string,
    stripeSubscriptionId?: string
  ): Promise<any> {
    // First get the pricing plan details
    const { data: pricingPlan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', pricingPlanId)
      .single();

    if (planError || !pricingPlan) {
      throw new Error('Invalid pricing plan');
    }

    // Create the subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        pricing_plan_id: pricingPlanId,
        plan_tier: pricingPlan.tier,
        price_monthly: pricingPlan.price_monthly,
        status: 'active',
        leads_per_month: (pricingPlan.limits as any)?.leads_per_month,
        sources: Array.isArray((pricingPlan.limits as any)?.sources)
          ? (pricingPlan.limits as any).sources
          : null,
        features: Array.isArray(pricingPlan.features)
          ? (pricingPlan.features as string[])
          : [],
        stripe_price_id: pricingPlan.stripe_price_id,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }

    return data;
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: 'active' | 'canceled' | 'unpaid'
  ): Promise<any> {
    const updateData: any = { status };

    if (status === 'canceled') {
      updateData.canceled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription status:', error);
      throw new Error('Failed to update subscription status');
    }

    return data;
  }

  /**
   * Get user's usage statistics for the current month
   */
  async getUserUsageStats(userId: string): Promise<{
    leads_this_month: number;
    exports_this_month: number;
    enrichments_this_month: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get leads created this month
    const { count: leadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    // Get enriched leads this month
    const { count: enrichmentsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'enriched')
      .gte('updated_at', startOfMonth.toISOString());

    return {
      leads_this_month: leadsCount || 0,
      exports_this_month: 0, // Note: Export tracking not yet implemented
      enrichments_this_month: enrichmentsCount || 0
    };
  }
}

export const pricingService = new PricingService();
