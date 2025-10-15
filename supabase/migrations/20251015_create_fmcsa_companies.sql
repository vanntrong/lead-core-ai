-- Create FMCSA Companies table
-- This table stores FMCSA (Federal Motor Carrier Safety Administration) company data
-- for quick lookup without hitting external APIs

CREATE TABLE IF NOT EXISTS public.fmcsa_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name TEXT NOT NULL,
    dba_name TEXT,
    dot_number TEXT UNIQUE,
    mc_number TEXT,
    
    -- Physical Address
    physical_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Contact Information
    telephone TEXT,
    email_address TEXT,
    
    -- Business Information
    entity_type TEXT,
    operating_status TEXT,
    carrier_operation TEXT,
    
    -- Fleet Information
    total_drivers INTEGER,
    total_power_units INTEGER,
    
    -- Safety Information
    safety_rating TEXT,
    safety_rating_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_fmcsa_legal_name ON public.fmcsa_companies USING gin(to_tsvector('english', legal_name));
CREATE INDEX IF NOT EXISTS idx_fmcsa_dba_name ON public.fmcsa_companies USING gin(to_tsvector('english', dba_name));
CREATE INDEX IF NOT EXISTS idx_fmcsa_dot_number ON public.fmcsa_companies(dot_number);
CREATE INDEX IF NOT EXISTS idx_fmcsa_mc_number ON public.fmcsa_companies(mc_number);
CREATE INDEX IF NOT EXISTS idx_fmcsa_state ON public.fmcsa_companies(state);
CREATE INDEX IF NOT EXISTS idx_fmcsa_city ON public.fmcsa_companies(city);
CREATE INDEX IF NOT EXISTS idx_fmcsa_operating_status ON public.fmcsa_companies(operating_status);

-- Create a combined text search index for company names
CREATE INDEX IF NOT EXISTS idx_fmcsa_company_search ON public.fmcsa_companies 
    USING gin(to_tsvector('english', COALESCE(legal_name, '') || ' ' || COALESCE(dba_name, '')));

-- Enable Row Level Security
ALTER TABLE public.fmcsa_companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read fmcsa_companies"
    ON public.fmcsa_companies
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow service role to insert/update/delete (for data management)
CREATE POLICY "Allow service role full access to fmcsa_companies"
    ON public.fmcsa_companies
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_fmcsa_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fmcsa_companies_updated_at
    BEFORE UPDATE ON public.fmcsa_companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fmcsa_companies_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.fmcsa_companies IS 'Stores FMCSA company data for trucking/logistics leads';
COMMENT ON COLUMN public.fmcsa_companies.dot_number IS 'US DOT Number - unique identifier';
COMMENT ON COLUMN public.fmcsa_companies.mc_number IS 'MC/MX/FF Number - operating authority number';
COMMENT ON COLUMN public.fmcsa_companies.safety_rating IS 'FMCSA safety rating (Satisfactory, Conditional, Unsatisfactory, etc.)';
