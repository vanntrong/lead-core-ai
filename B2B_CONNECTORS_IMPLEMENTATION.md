# B2B Connectors Implementation Summary

## Overview
Successfully implemented 3 new B2B data connectors for LeadCore AI platform, enabling lead generation from:
1. **Google Places API** - Local businesses (restaurants, retail, services)
2. **NPI Registry** - Healthcare providers (doctors, dentists, clinics)
3. **FMCSA Database** - Trucking companies and carriers

## Files Created

### 1. Service Layer
- **`/src/services/google-places.service.ts`**
  - Google Places API integration
  - Searches local businesses by keyword + location
  - Extracts emails from business websites
  - Returns formatted lead data with contact info

- **`/src/services/npi-registry.service.ts`**
  - NPI Registry (NPPES) API integration
  - Searches healthcare providers by name, taxonomy, location
  - Free public API (no key required)
  - Provides structured healthcare provider data

- **`/src/services/fmcsa.service.ts`**
  - FMCSA SAFER database scraping
  - Searches carriers by company name or DOT/MC numbers
  - HTML parsing from public database
  - Returns trucking company contact details

### 2. Configuration
- **`/src/constants/vertical-presets.ts`**
  - 12 Google Places presets (restaurants, retail, legal, etc.)
  - 10 NPI Registry presets (physicians, dentists, therapists, etc.)
  - 8 FMCSA presets (freight, hazmat, household movers, etc.)
  - Quick-fill templates for common vertical searches

## Files Modified

### 1. Core Services
- **`/src/services/scrape.service.ts`**
  - Added imports for 3 new services
  - Updated `scrape()` method to route new source types
  - Added 3 new scraping methods:
    - `googlePlacesScrape()` - parses google_places:// URLs
    - `npiRegistryScrape()` - parses npi_registry:// URLs
    - `fmcsaScrape()` - parses fmcsa:// URLs

### 2. UI Components
- **`/src/components/leads/add-lead-dialog.tsx`**
  - Added 3 new source options in dropdown
  - Added conditional UI sections for each source
  - Integrated preset buttons for quick vertical selection
  - Preset buttons auto-fill URL field with proper format

- **`/src/components/leads/lead-filters.tsx`**
  - Added 3 new filter options for source filtering

### 3. Constants & Types
- **`/src/constants/saas-source.ts`**
  - Added `google_places`, `npi_registry`, `fmcsa` to saasSource
  - Added color configurations:
    - Google Places: blue
    - NPI Registry: teal
    - FMCSA: amber

- **`/database.types.ts`**
  - Updated `lead_source` enum to include:
    - `"google_places"`
    - `"npi_registry"`
    - `"fmcsa"`

### 4. Environment Configuration
- **`/.env.example`**
  - Added `GOOGLE_PLACES_API_KEY` variable

## URL Format Patterns

### Google Places
```
google_places://search?keyword=restaurants&location=New York, NY
```

### NPI Registry
```
npi_registry://search?provider=Smith&taxonomy=dentist&location=California
```

### FMCSA
```
fmcsa://search?company=ABC Trucking
fmcsa://search?dot=123456
fmcsa://search?mc=789012
```

## Integration Pattern

All 3 services follow the existing codebase pattern:

1. **Service Singleton**: Each service exports a singleton instance
2. **URL Protocol**: Uses custom protocol format (source://search?params)
3. **Central Router**: `scrape.service.ts` routes by source type
4. **Error Handling**: Consistent error format with `errorType` field
5. **Lead Format**: Returns standardized lead object structure

## Features Implemented

### 1. Preset Templates
- Users can click preset buttons instead of manual input
- Preset buttons auto-populate search parameters
- Organized by vertical/industry
- Speeds up lead generation for common use cases

### 2. Source-Specific UI
- Conditional form fields based on selected source
- Different input patterns for each connector:
  - Google Places: keyword + location
  - NPI Registry: provider name + specialty + location
  - FMCSA: company name OR DOT/MC number

### 3. Color Coding
- Each source has unique badge color in lead list
- Helps users quickly identify lead source at a glance

## API Requirements

### Google Places API
- **Required**: API key from Google Cloud Console
- **Setup**: Enable Places API in GCP project
- **Cost**: Pay-per-use (first $200/month free with GCP credits)
- **Env Var**: `GOOGLE_PLACES_API_KEY`

### NPI Registry
- **Required**: None (public API)
- **Cost**: Free
- **Rate Limits**: Generous (no key needed)

### FMCSA Database
- **Required**: None (web scraping)
- **Cost**: Free
- **Rate Limits**: Best practice rate limiting implemented

## Testing Checklist

- [ ] Test Google Places search with valid API key
- [ ] Test NPI Registry search (no key required)
- [ ] Test FMCSA search with DOT/MC numbers
- [ ] Verify preset buttons populate URL correctly
- [ ] Test lead creation from all 3 sources
- [ ] Verify source badges display correct colors
- [ ] Test source filtering in lead list
- [ ] Verify lead enrichment works with new sources
- [ ] Test CSV export includes new source types
- [ ] Verify subscription limits apply to new sources

## Known Issues & Lint Warnings

As requested, lint errors were ignored during implementation. The following need to be fixed:

1. **Readonly properties**: Regex patterns defined inline
2. **Numeric separators**: Large numbers in coordinate bounds
3. **Any types**: Error handling uses `any` type
4. **CSS class ordering**: Tailwind class order in add-lead-dialog
5. **Block statements**: Conditional statements need braces

## Next Steps

1. **Add Google Places API Key** to environment variables
2. **Run Lint Fix**: Fix CSS class ordering and code style issues
3. **Database Migration** (when ready):
   ```sql
   ALTER TYPE lead_source ADD VALUE 'google_places';
   ALTER TYPE lead_source ADD VALUE 'npi_registry';
   ALTER TYPE lead_source ADD VALUE 'fmcsa';
   ```
4. **Update Pricing Plans**: Consider if new sources should be gated by plan tier
5. **Testing**: Manual testing of all 3 new connectors
6. **Documentation**: Update user-facing docs with new source options

## Usage Examples

### Add Lead via Google Places
1. Click "Add Lead" button
2. Select "Google Places" from source dropdown
3. Click preset "Restaurants - NYC" OR manually enter:
   - Keyword: "italian restaurant"
   - Location: "Brooklyn, NY"
4. Click "Add Lead"

### Add Lead via NPI Registry
1. Click "Add Lead" button
2. Select "NPI Registry" from source dropdown
3. Click preset "Dentists - California" OR manually enter:
   - Provider: (leave blank for all)
   - Taxonomy: "dentist"
   - Location: "Los Angeles, CA"
4. Click "Add Lead"

### Add Lead via FMCSA
1. Click "Add Lead" button
2. Select "FMCSA" from source dropdown
3. Click preset "Hazmat Carriers" OR manually enter:
   - Company Name: "ABC Trucking"
4. Click "Add Lead"

## Architecture Decision Records

### Why Protocol-Based URLs?
Following existing pattern (e.g., `g2://search?company=...`), new sources use custom protocols. This allows:
- Clean separation of search parameters
- Easy parsing in scrape service
- Consistent URL validation
- Future-proof for additional parameters

### Why Preset Buttons?
User research (from existing codebase patterns) suggests quick-start templates improve UX:
- Reduces user input errors
- Speeds up common workflows
- Helps users discover vertical use cases
- Maintains flexibility for custom searches

### Why These 3 Sources First?
Strategic selection based on:
1. **Google Places**: Broad appeal, any local business vertical
2. **NPI Registry**: Healthcare is massive B2B market
3. **FMCSA**: Transportation/logistics is underserved by existing tools

## Performance Considerations

- **Google Places**: Rate limited by API quotas (handled by Google)
- **NPI Registry**: Free public API, minimal rate limits
- **FMCSA**: Web scraping adds latency, implemented retry logic
- All services use async/await for non-blocking operations
- Error handling includes exponential backoff

## Security Notes

- Google Places API key stored in server-side env var only
- No client-side exposure of API keys
- FMCSA scraping follows robots.txt guidelines
- NPI Registry uses official public API
- All external requests validated and sanitized

---

**Implementation Date**: 2024-01-XX  
**Implemented By**: Development Team  
**Status**: Ready for Testing  
**Database Migration**: Pending
