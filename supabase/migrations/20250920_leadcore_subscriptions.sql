-- Migration: Create subscriptions table for Stripe

DROP TYPE IF EXISTS subscription_status;
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'unpaid');

-- 1. Table definition
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    usage_limit_id UUID NULL,
    plan_tier plan_tier NOT NULL,
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    stripe_price_id TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, plan_tier),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (usage_limit_id) REFERENCES usage_limits(id) ON DELETE SET NULL
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_tier ON subscriptions(plan_tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(subscription_status);

-- 2. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to SELECT only their own subscriptions
CREATE POLICY "Users can select their own subscriptions" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);
