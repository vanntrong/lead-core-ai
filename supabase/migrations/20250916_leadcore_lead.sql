-- LeadCore AI - Lead Table Migration
-- Table for storing leads and enrichment results

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TYPE IF EXISTS lead_status;
CREATE TYPE lead_status AS ENUM (
    'pending',
    'scraped',
    'enriching',
    'enriched',
    'failed',
    'scrap_failed'
);

DROP TYPE IF EXISTS verify_email_status;
CREATE TYPE verify_email_status AS ENUM (
    'pending',
    'verified',
    'failed'
);

-- Add lead_source enum
DROP TYPE IF EXISTS lead_source;
CREATE TYPE lead_source AS ENUM (
    'shopify',
    'etsy',
    'g2',
    'woocommerce'
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL, -- reference to auth.users or user_profiles
        CONSTRAINT fk_leads_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id),
    source lead_source NOT NULL, -- e.g. 'shopify', 'g2', 'etsy', etc.
    url TEXT NOT NULL,
    status lead_status NOT NULL DEFAULT 'pending',
    verify_email_status verify_email_status NOT NULL DEFAULT 'pending',
    scrap_info JSONB, -- raw scraping info
    enrich_info JSONB, -- enrichment results
    verify_email_info JSONB -- email verification results
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_url ON leads(url);

COMMENT ON TABLE leads IS 'LeadCore AI leads and enrichment results.';
COMMENT ON COLUMN leads.scrap_info IS 'Raw scraping info as JSON.';
COMMENT ON COLUMN leads.enrich_info IS 'Enrichment results as JSON.';

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to access only their own leads
CREATE POLICY "Users can access their own leads" ON leads
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_lead_updated_at ON leads;
CREATE TRIGGER set_lead_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_updated_at();
