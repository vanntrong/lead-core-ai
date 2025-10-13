-- Add location fields to leads table
-- This enables preset searches like "HRT clinics in Austin", "Dentists in London", etc.

ALTER TABLE leads 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN country TEXT,
ADD COLUMN location_full TEXT, -- Full location string for flexible searching
ADD COLUMN business_type TEXT; -- E.g., "clinic", "dentist", "plumber", "trucking company"

-- Create indexes for location-based searches
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_state ON leads(state);
CREATE INDEX idx_leads_country ON leads(country);
CREATE INDEX idx_leads_business_type ON leads(business_type);
CREATE INDEX idx_leads_location_full ON leads(location_full);

-- Create a GIN index for full-text search on location_full
CREATE INDEX idx_leads_location_full_gin ON leads USING gin(to_tsvector('english', location_full));
CREATE INDEX idx_leads_business_type_gin ON leads USING gin(to_tsvector('english', business_type));

-- Comments
COMMENT ON COLUMN leads.city IS 'City where the business is located';
COMMENT ON COLUMN leads.state IS 'State/province where the business is located';
COMMENT ON COLUMN leads.country IS 'Country where the business is located';
COMMENT ON COLUMN leads.location_full IS 'Full location string for flexible searching (e.g., "Los Angeles, CA, USA")';
COMMENT ON COLUMN leads.business_type IS 'Type of business (e.g., "HRT clinic", "dentist", "plumber")';
