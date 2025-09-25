
-- Create proxy_log_status enum
DROP TYPE IF EXISTS proxy_log_status;
CREATE TYPE proxy_log_status AS ENUM ('success', 'failed', 'banned', 'timeout');

-- Create proxy_logs table
CREATE TABLE proxy_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  web_url TEXT NOT NULL,
  web_source lead_source NOT NULL,
  proxy_host TEXT NOT NULL,      
  proxy_port INT NOT NULL,           
  proxy_ip TEXT,                     
  status proxy_log_status NOT NULL,
  duration INTEGER, -- Duration in milliseconds      
  error TEXT,                       
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_proxy_logs_status ON proxy_logs(status);
CREATE INDEX idx_proxy_logs_created_at ON proxy_logs(created_at);
CREATE INDEX idx_proxy_logs_proxy_host ON proxy_logs(proxy_host);

-- Add RLS (Row Level Security)
ALTER TABLE proxy_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (adjust as needed based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON proxy_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON proxy_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_proxy_logs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proxy_logs_updated_at BEFORE UPDATE ON proxy_logs
  FOR EACH ROW EXECUTE FUNCTION update_proxy_logs_updated_at_column();

COMMENT ON TABLE proxy_logs IS 'Logs for tracking proxy usage, status, and errors.';
COMMENT ON COLUMN proxy_logs.created_at IS 'Timestamp when the proxy request was executed.';
COMMENT ON COLUMN proxy_logs.proxy_host IS 'Proxy host (e.g., dc.oxylabs.io) used for the request.';
COMMENT ON COLUMN proxy_logs.proxy_port IS 'Proxy port (e.g., 8001) used for the request.';
COMMENT ON COLUMN proxy_logs.proxy_ip IS 'Actual public IP used for the request, checked via api.ipify.org.';
COMMENT ON COLUMN proxy_logs.status IS 'Status of the proxy request: success, failed, banned, or timeout.';
COMMENT ON COLUMN proxy_logs.error IS 'Error message if the proxy request failed or was blocked.';
