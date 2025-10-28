-- LeadCore AI - User API Keys Table Migration
-- Table for storing user API keys for various integrations

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    CONSTRAINT fk_user_api_keys_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL, -- e.g. 'townsend', 'other-service'
    api_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, service_name)
);

CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_user_api_keys_service_name ON user_api_keys(service_name);

COMMENT ON TABLE user_api_keys IS 'User API keys for various integrations.';
COMMENT ON COLUMN user_api_keys.service_name IS 'Name of the service (e.g., townsend).';
COMMENT ON COLUMN user_api_keys.api_key IS 'Encrypted API key for the service.';

-- Enable Row Level Security
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to access only their own API keys
CREATE POLICY "Users can access their own API keys" ON user_api_keys
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_user_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_user_api_keys_updated_at ON user_api_keys;
CREATE TRIGGER set_user_api_keys_updated_at
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_user_api_keys_updated_at();

