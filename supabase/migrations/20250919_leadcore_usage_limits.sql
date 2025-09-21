-- Migration: Create usage_limits table for LeadCore AI

-- 1. ENUM types
DROP TYPE IF EXISTS plan_tier;
CREATE TYPE plan_tier AS ENUM ('basic', 'pro', 'unlimited');

-- 2. ENUM type for sources
DROP TYPE IF EXISTS source_type;
CREATE TYPE source_type AS ENUM ('etsy', 'woocommerce', 'shopify', 'g2');

-- 3. Table definition
CREATE TABLE usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_tier plan_tier NOT NULL,
    sources source_type[] DEFAULT '{}',
    max_leads INTEGER NULL,
    user_id UUID NOT NULL,
    current_leads INTEGER NOT NULL DEFAULT 0,
    export_enabled BOOLEAN NOT NULL DEFAULT false,
    zapier_export BOOLEAN NOT NULL DEFAULT false,
    period_start TIMESTAMPTZ NULL,
    period_end TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CHECK (max_leads IS NULL OR current_leads <= max_leads)
);

CREATE INDEX idx_usage_limits_plan_tier ON usage_limits(plan_tier);
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);

-- 4. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_usage_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_usage_limits_updated_at ON usage_limits;
CREATE TRIGGER set_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_limits_updated_at();

-- 5. Rollback
-- To rollback, drop table and type
-- DROP TABLE IF EXISTS usage_limits;
-- DROP TYPE IF EXISTS source_type;

-- Enable RLS for usage_limits
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to access their own usage_limits
CREATE POLICY "Users can access their own usage_limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own usage_limits" ON usage_limits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage_limits" ON usage_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own usage_limits" ON usage_limits
  FOR DELETE USING (auth.uid() = user_id);


