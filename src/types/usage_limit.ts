
export type PlanTier = 'basic' | 'pro' | 'unlimited';
export type SourceType = 'etsy' | 'woocommerce' | 'shopify' | 'g2';

export interface UsageLimit {
  id: string;
  plan_tier: PlanTier;
  sources: SourceType[];
  max_leads: number | null;
  current_leads: number;
  export_enabled: boolean;
  zapier_export: boolean;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLimitInsert {
  plan_tier: PlanTier;
  sources?: SourceType[];
  max_leads?: number | null;
  current_leads?: number;
  export_enabled?: boolean;
  zapier_export?: boolean;
  period_start?: string | null;
  period_end?: string | null;
}

export interface UsageLimitUpdate {
  sources?: SourceType[];
  max_leads?: number | null;
  current_leads?: number;
  export_enabled?: boolean;
  zapier_export?: boolean;
  period_start?: string | null;
  period_end?: string | null;
}
