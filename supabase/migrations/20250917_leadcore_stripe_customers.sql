-- LeadCore AI - Stripe Customers Table Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TYPE IF EXISTS stripe_customer_status;
CREATE TYPE stripe_customer_status AS ENUM ('active', 'inactive', 'canceled');

CREATE TABLE stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- reference to auth.users or user_profiles
      CONSTRAINT fk_leads_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id),
    stripe_customer_id TEXT NOT NULL,
    status stripe_customer_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_status ON stripe_customers(status);

COMMENT ON TABLE stripe_customers IS 'Stripe customer mapping for LeadCore AI.';
COMMENT ON COLUMN stripe_customers.stripe_customer_id IS 'Stripe customer ID.';
COMMENT ON COLUMN stripe_customers.status IS 'Stripe customer status.';

-- Enable Row Level Security
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to access only their own stripe_customers rows
CREATE POLICY "Users can access their own Stripe customers" ON stripe_customers
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_stripe_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_stripe_customers_updated_at ON stripe_customers;
CREATE TRIGGER set_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_customers_updated_at();
