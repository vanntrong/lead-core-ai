-- Add location_search field to leads table
-- This field stores pre-computed normalized location search terms
-- to handle variations like "NY", "New York", "new york", "ny", "United States", "US", "us", etc.

ALTER TABLE leads 
ADD COLUMN location_search TEXT[];

-- Create GIN index for efficient array searching
CREATE INDEX idx_leads_location_search ON leads USING gin(location_search);

-- Comment
COMMENT ON COLUMN leads.location_search IS 'Pre-computed array of normalized location search terms for flexible searching (e.g., ["ny", "new york", "us", "united states"])';

