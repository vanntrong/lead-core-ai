# Location-Based Preset Search Feature Implementation

## Overview
This document details the implementation of location-based preset searches for the LeadCore AI dashboard. Users can now search for leads by business type and location using queries like:
- "HRT clinics in Austin"
- "Dentists in London"
- "Plumbers in Denver"
- "Trucking companies in Ohio"

The implementation includes flexible location searching that supports multiple formats (e.g., "LA", "Los Angeles", "Austin, TX", "Ohio").

## Files Modified and Created

### 1. Database Migration
**File**: `/supabase/migrations/20251013_add_location_to_leads.sql`
- Added location fields to the `leads` table:
  - `city` - City where the business is located
  - `state` - State/province where the business is located
  - `country` - Country where the business is located
  - `location_full` - Full location string for flexible searching
  - `business_type` - Type of business (e.g., "dentist", "plumber")
- Created indexes for efficient searching on all location fields
- Created GIN indexes for full-text search capabilities

### 2. Database Types
**File**: `/database.types.ts`
- Updated the `leads` table type definitions to include the new fields:
  - `business_type`, `city`, `state`, `country`, `location_full`
- Updated for all three operations: Row, Insert, Update

### 3. TypeScript Types
**File**: `/src/types/lead.ts`
- Updated `LeadScrapInfo` interface to include location data:
  - `address`, `city`, `state`, `country`, `location_full`
  - `business_type`, `rating`, `website`
- Updated `LeadFilters` interface to support location filtering:
  - `city`, `state`, `country`, `location`, `business_type`

### 4. Location Utilities
**File**: `/src/utils/location.ts` (NEW)
A comprehensive utility module for parsing and normalizing location data:

**Functions**:
- `parseGooglePlacesLocation()` - Parse location from Google Places addresses
- `parseNPIRegistryLocation()` - Parse location from NPI Registry addresses
- `parseFMCSALocation()` - Parse location from FMCSA addresses
- `parseLocationFromURL()` - Extract location from URL parameters
- `normalizeCity()` - Normalize city names (handles "LA" → "Los Angeles", etc.)
- `normalizeState()` - Normalize state codes (handles 2-letter codes and full names)
- `normalizeCountry()` - Normalize country names
- `extractBusinessType()` - Intelligently extract business type from titles/descriptions

**Features**:
- Handles common city abbreviations (LA, NYC, SF, etc.)
- Converts state abbreviations to full names and vice versa
- Supports flexible location formats
- Extracts business types from content using keyword matching

### 5. Lead Service Updates
**File**: `/src/services/lead.service.ts`

**New Method**: `extractLocationData()`
- Extracts location information from URL parameters and scrap_info
- Integrates with location utilities for normalization
- Returns structured location data for database storage

**Updated Method**: `createLead()`
- Now extracts location data before inserting leads
- Stores city, state, country, location_full, and business_type in database

**Updated Methods**: `getLeads()` and `getLeadsPaginated()`
- Added support for location-based filtering:
  - Filter by `city` (case-insensitive, partial match)
  - Filter by `state` (case-insensitive, partial match)
  - Filter by `country` (case-insensitive, partial match)
  - Filter by `location` (searches location_full field)
  - Filter by `business_type` (case-insensitive, partial match)

### 6. Preset Search Component
**File**: `/src/components/leads/preset-search.tsx` (NEW)

A consumer-friendly UI component featuring:

**Popular Preset Searches**:
- Quick-click buttons for common searches
- Pre-configured business type and location combinations
- Instant search on click

**Custom Search Form**:
- Business type dropdown with 16 common types
- Custom business type input option
- Location input with helpful examples
- Smart validation and user feedback

**Design Features**:
- Matches the existing design system (Stripe-inspired)
- Uses indigo/purple gradient accents
- Clean, professional layout with proper spacing
- Helpful tip section explaining flexible location search

**Business Types Supported**:
- HRT clinic, dentist, doctor, plumber, electrician
- Trucking company, restaurant, retail store, law firm
- Accountant, real estate, gym, salon, spa
- Auto repair, veterinarian, and custom types

### 7. Dashboard Integration
**File**: `/src/app/dashboard/page.tsx`
- Added `PresetSearch` component to main dashboard
- Implemented `handlePresetSearch()` to navigate to leads page with filters
- Shows success toast when initiating search

**File**: `/src/app/dashboard/leads/page.tsx`
- Added `PresetSearch` component to leads management page
- Implemented `handlePresetSearch()` to apply filters directly
- Added URL parameter handling for incoming preset searches
- Integrated with existing filter system

### 8. Lead Filters Enhancement
**File**: `/src/components/leads/lead-filters.tsx`
- Added expandable location filters section:
  - Location input (flexible search)
  - City input (specific city search)
  - State input (state/province search)
  - Business type input
- Improved organization with categorized filter sections
- Better labeling and user guidance

## How Location Data is Captured

### For Google Places Leads
1. Location parsed from URL parameters (`location` field)
2. Address from API response stored in `scrap_info.address`
3. City, state, country extracted from formatted address
4. Business type extracted from place types

### For NPI Registry Leads
1. Location parsed from URL parameters (`city`, `state`)
2. Address from provider information stored
3. Normalized and stored in location fields
4. Business type set to "healthcare provider"

### For FMCSA Leads
1. Location parsed from carrier address
2. City, state extracted from physical address
3. Business type set to "trucking company"

### For Existing Sources (Shopify, Etsy, G2, WooCommerce)
- Location data will be empty initially
- Can be enriched in future updates
- Business type extracted from page content

## User Experience Flow

### Scenario 1: Quick Preset Search
1. User opens dashboard
2. Sees preset search component with popular searches
3. Clicks "Dentists in London"
4. Redirected to leads page with filters applied
5. Sees filtered results matching the search

### Scenario 2: Custom Search
1. User opens dashboard
2. Selects "plumber" from business type dropdown
3. Enters "Denver" or "Denver, CO" in location field
4. Clicks "Search Leads" button
5. Sees filtered results on leads page

### Scenario 3: Flexible Location Search
User can search with any of these formats:
- "LA" or "Los Angeles" (both work)
- "Austin" or "Austin, TX" (both work)
- "Texas" or "TX" (state-level search)
- "Ohio" (entire state)

## Database Query Examples

### Search for dentists in Los Angeles
```sql
SELECT * FROM leads 
WHERE business_type ILIKE '%dentist%' 
AND (city ILIKE '%los angeles%' OR city ILIKE '%la%')
```

### Search by state
```sql
SELECT * FROM leads 
WHERE state ILIKE '%TX%' -- Finds "TX" or "Texas"
```

### Flexible location search
```sql
SELECT * FROM leads 
WHERE location_full ILIKE '%austin%' -- Finds anything with "austin"
```

## Performance Considerations

1. **Indexes**: All location fields have B-tree indexes for efficient lookups
2. **GIN Indexes**: Full-text search indexes for flexible matching
3. **Case-insensitive**: Uses ILIKE for user-friendly searches
4. **Partial Matching**: Supports partial matches for flexibility

## Future Enhancements

### Potential Improvements:
1. **Auto-complete**: Add location auto-complete using Google Places API
2. **Saved Searches**: Allow users to save favorite preset searches
3. **Location Enrichment**: Automatically enrich existing leads with location data
4. **Geolocation**: Add lat/long for map-based visualization
5. **Distance Search**: "Find dentists within 50 miles of Austin"
6. **Popular Locations**: Show trending locations/business types

### Additional Features:
- Export filtered results
- Bulk operations on filtered leads
- Advanced boolean search (AND/OR combinations)
- Industry-specific presets (healthcare, logistics, retail)

## Testing Recommendations

### Manual Testing Checklist:
- [ ] Test preset search buttons on dashboard
- [ ] Test custom search with various business types
- [ ] Test location variations (LA, Los Angeles, etc.)
- [ ] Test state abbreviations (TX, CA) vs full names
- [ ] Test URL parameter passing between pages
- [ ] Test filter combinations (location + status + source)
- [ ] Test clearing filters
- [ ] Verify data is stored correctly in database
- [ ] Test with different lead sources
- [ ] Verify mobile responsiveness

### Edge Cases to Test:
- Empty search fields
- Very long location names
- International locations
- Special characters in business types
- Multiple results vs no results
- Pagination with filters applied

## Migration Instructions

### To apply the database changes:
```bash
# Reset the database to apply new migration
npx supabase db reset

# Or apply migration to remote database
npx supabase db push
```

### To update TypeScript types:
```bash
# Generate new types from database
npx supabase gen types typescript --local > database.types.ts
```

## Design Compliance

This implementation follows the project's design guidelines:
- ✅ Consumer-friendly language and UI
- ✅ Stripe-inspired clean design
- ✅ Proper color palette (indigo/purple gradients)
- ✅ Consistent spacing and typography
- ✅ Mobile-responsive layout
- ✅ Helpful tooltips and examples
- ✅ Clear call-to-action buttons

## Accessibility

The implementation includes:
- Proper semantic HTML structure
- Clear labels for form inputs
- Keyboard navigation support
- ARIA attributes where needed
- Color contrast compliance
- Screen reader friendly

## Summary

This feature enables users to quickly find leads by combining business type and location, making the platform more powerful and user-friendly. The flexible search capabilities handle various input formats, making it intuitive for non-technical users. The implementation is scalable, performant, and ready for future enhancements.
