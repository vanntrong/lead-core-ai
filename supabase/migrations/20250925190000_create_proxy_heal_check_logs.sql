-- Create proxy_heal_check_log_status enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proxy_heal_check_log_status') THEN
    CREATE TYPE proxy_heal_check_log_status AS ENUM ('success', 'failed');
  END IF;
END $$;

-- Create proxy_heal_check_logs table
CREATE TABLE proxy_heal_check_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proxy_host TEXT NOT NULL,
  proxy_port INT NOT NULL,
  proxy_ip TEXT,
  status proxy_heal_check_log_status NOT NULL,
  duration INTEGER, -- Duration in milliseconds
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_proxy_heal_check_logs_status ON proxy_heal_check_logs(status);
CREATE INDEX idx_proxy_heal_check_logs_created_at ON proxy_heal_check_logs(created_at);
CREATE INDEX idx_proxy_heal_check_logs_proxy_host ON proxy_heal_check_logs(proxy_host);

-- Add RLS (Row Level Security)
ALTER TABLE proxy_heal_check_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (adjust as needed based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON proxy_heal_check_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON proxy_heal_check_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_proxy_heal_check_logs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proxy_heal_check_logs_updated_at BEFORE UPDATE ON proxy_heal_check_logs
  FOR EACH ROW EXECUTE FUNCTION update_proxy_heal_check_logs_updated_at_column();

COMMENT ON TABLE proxy_heal_check_logs IS 'Logs for tracking proxy health check usage, status, and errors.';
COMMENT ON COLUMN proxy_heal_check_logs.created_at IS 'Timestamp when the proxy health check was executed.';
COMMENT ON COLUMN proxy_heal_check_logs.proxy_host IS 'Proxy host (e.g., dc.oxylabs.io) used for the health check.';
COMMENT ON COLUMN proxy_heal_check_logs.proxy_port IS 'Proxy port (e.g., 8001) used for the health check.';
COMMENT ON COLUMN proxy_heal_check_logs.proxy_ip IS 'Actual public IP used for the health check, checked via api.ipify.org.';
COMMENT ON COLUMN proxy_heal_check_logs.status IS 'Status of the proxy health check: success, failed, banned, or timeout.';
COMMENT ON COLUMN proxy_heal_check_logs.error IS 'Error message if the proxy health check failed or was blocked.';
