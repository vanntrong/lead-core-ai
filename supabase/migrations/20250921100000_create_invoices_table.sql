-- Migration: Create invoices table for Stripe billing
DROP TYPE IF EXISTS invoice_status;
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'uncollectible', 'void');

CREATE TABLE invoices (
  id TEXT PRIMARY KEY, -- invoice id (e.g., in_1S9bGjG2...)
  user_id UUID NOT NULL, -- reference to auth.users
  customer_id TEXT NOT NULL, -- Stripe customer
  subscription_id TEXT, -- related subscription
  payment_intent_id TEXT, -- payment intent
  charge_id TEXT, -- charge id
  amount_due BIGINT, -- amount due (cents)
  amount_paid BIGINT, -- amount paid (cents)
  currency TEXT, -- 'usd'
  status invoice_status, -- paid, open, void...
  billing_reason TEXT, -- subscription_create, subscription_cycle...
  period_start TIMESTAMP, -- billing period start
  period_end TIMESTAMP, -- billing period end
  hosted_invoice_url TEXT, -- invoice view link
  invoice_pdf TEXT, -- PDF file link
  created_at TIMESTAMP, -- invoice creation date
  plan_tier plan_tier NOT NULL, -- plan tier (should specify type if known)
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX invoices_customer_id_idx ON invoices(customer_id);
CREATE INDEX invoices_subscription_id_idx ON invoices(subscription_id);
CREATE INDEX invoices_user_id_idx ON invoices(user_id);
CREATE INDEX invoices_created_at_idx ON invoices(created_at);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to access only their own invoices
CREATE POLICY "Allow user access to own invoices" ON invoices
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Allow user insert own invoices" ON invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow user update own invoices" ON invoices
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Allow user delete own invoices" ON invoices
  FOR DELETE USING (user_id = auth.uid());
