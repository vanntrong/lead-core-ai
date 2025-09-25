-- Create scraper_logs table to track scraping activities

-- Create enum for scraper status
DROP TYPE IF EXISTS scraper_status;
CREATE TYPE scraper_status AS ENUM ('success', 'fail');

CREATE TABLE scraper_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    source lead_source NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER, -- Duration in milliseconds
    status scraper_status NOT NULL,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_scraper_logs_timestamp ON scraper_logs(timestamp);
CREATE INDEX idx_scraper_logs_source ON scraper_logs(source);
CREATE INDEX idx_scraper_logs_status ON scraper_logs(status);
CREATE INDEX idx_scraper_logs_created_at ON scraper_logs(created_at);

-- Add RLS (Row Level Security) if needed
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (adjust as needed based on your auth requirements)
CREATE POLICY "Enable read access for authenticated users" ON scraper_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON scraper_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scraper_logs_updated_at BEFORE UPDATE ON scraper_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE scraper_logs IS 'Logs for tracking web scraping activities across different sources';
COMMENT ON COLUMN scraper_logs.timestamp IS 'When the scraping operation was executed';
COMMENT ON COLUMN scraper_logs.source IS 'Source platform being scraped (Shopify, WooCommerce, G2, Etsy)';
COMMENT ON COLUMN scraper_logs.url IS 'The URL that was scraped';
COMMENT ON COLUMN scraper_logs.duration IS 'Duration of the scraping operation in milliseconds';
COMMENT ON COLUMN scraper_logs.status IS 'Status of the scraping operation (success or fail)';
COMMENT ON COLUMN scraper_logs.error IS 'Error message if the scraping operation failed';