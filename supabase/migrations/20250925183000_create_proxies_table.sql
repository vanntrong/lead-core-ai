-- Create proxy_status enum for proxies
DROP TYPE IF EXISTS proxy_status;
CREATE TYPE proxy_status AS ENUM ('active', 'inactive', 'error');

-- Create proxies table
CREATE TABLE proxies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  port INT NOT NULL,
  username TEXT,
  password TEXT,
  status proxy_status DEFAULT 'inactive' NOT NULL,
  avg_response_ms FLOAT,
  error_count_24h INT DEFAULT 0,
  total_count_24h INT DEFAULT 0
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(host, port)
);

-- Indexes for performance
CREATE INDEX idx_proxies_status ON proxies(status);
CREATE INDEX idx_proxies_host_port ON proxies(host, port);
CREATE INDEX idx_proxies_error_count_24h ON proxies(error_count_24h);
CREATE INDEX idx_proxies_total_count_24h ON proxies(total_count_24h);

-- RLS (Row Level Security)
ALTER TABLE proxies ENABLE ROW LEVEL SECURITY;

-- RLS policies (adjust as needed)
CREATE POLICY "Enable read access for authenticated users" ON proxies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON proxies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_proxies_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proxies_updated_at BEFORE UPDATE ON proxies
  FOR EACH ROW EXECUTE FUNCTION update_proxies_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE proxies IS 'Proxy hosts and monitoring data.';
COMMENT ON COLUMN proxies.host IS 'Proxy host (e.g., dc.oxylabs.io).';
COMMENT ON COLUMN proxies.port IS 'Proxy port (e.g., 8001).';
COMMENT ON COLUMN proxies.status IS 'Current status: active, inactive, error.';
COMMENT ON COLUMN proxies.avg_response_ms IS 'Average response time in ms.';
COMMENT ON COLUMN proxies.error_count_24h IS 'Number of errors in the last 24 hours.';
COMMENT ON COLUMN proxies.last_checked_at IS 'Timestamp of last heartbeat/check.';
COMMENT ON COLUMN proxies.created_at IS 'Timestamp when proxy was added.';
COMMENT ON COLUMN proxies.updated_at IS 'Timestamp when proxy was last updated.';
