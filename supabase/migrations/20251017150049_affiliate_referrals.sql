-- Create affiliate_referrals table for Rewardful integration
-- Simplified: Just stores the link, all management done in Rewardful portal
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rewardful integration
  rewardful_affiliate_id TEXT UNIQUE, -- Rewardful affiliate ID
  rewardful_link TEXT NOT NULL, -- Unique referral link from Rewardful
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true, -- Whether user is an active affiliate
  joined_at TIMESTAMPTZ DEFAULT NOW(), -- When they became an affiliate
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS uq_affiliate_user_id ON public.affiliate_referrals(user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON public.affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_rewardful_id ON public.affiliate_referrals(rewardful_affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_is_active ON public.affiliate_referrals(is_active);

CREATE OR REPLACE FUNCTION update_affiliate_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger
DROP TRIGGER IF EXISTS affiliate_referrals_set_updated_at ON public.affiliate_referrals;
CREATE TRIGGER affiliate_referrals_set_updated_at
BEFORE UPDATE ON public.affiliate_referrals
FOR EACH ROW EXECUTE FUNCTION public.update_affiliate_referrals_updated_at();

-- RLS policies
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own affiliate data
DROP POLICY IF EXISTS "affiliates_select_own" ON public.affiliate_referrals;
CREATE POLICY "affiliates_select_own"
ON public.affiliate_referrals FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own affiliate record
DROP POLICY IF EXISTS "affiliates_insert_own" ON public.affiliate_referrals;
CREATE POLICY "affiliates_insert_own"
ON public.affiliate_referrals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own affiliate data
DROP POLICY IF EXISTS "affiliates_update_own" ON public.affiliate_referrals;
CREATE POLICY "affiliates_update_own"
ON public.affiliate_referrals FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- No view needed - users manage stats in Rewardful portal

