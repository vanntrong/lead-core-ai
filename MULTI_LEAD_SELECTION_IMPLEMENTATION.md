# Multi-Lead Selection Feature - Implementation Summary

## Overview
Updated the lead creation flow to allow users to scrape multiple leads and select which ones to save, rather than automatically saving the first scraped result.

## Key Changes

### 1. Type Definitions (`src/types/lead.ts`)
- **Added `ScrapedLeadResult`**: Interface for scraped lead data before saving
- **Added `BulkCreateLeadsData`**: Interface for bulk lead creation

### 2. Service Layer Updates

#### Google Places Service (`src/services/google-places.service.ts`)
- **Added `searchPlacesMultiple()`**: Returns up to 20 results instead of just 1
- **Modified `searchPlaces()`**: Now uses `searchPlacesMultiple()` internally (legacy support)
- Returns array of business results with full details (name, address, phone, rating, etc.)

#### NPI Registry Service (`src/services/npi-registry.service.ts`)
- **Added `searchProviderMultiple()`**: Returns up to 20 healthcare provider results
- **Modified `searchProvider()`**: Now uses `searchProviderMultiple()` internally
- Supports searching by provider name, specialty/taxonomy, and location

#### FMCSA Service (`src/services/fmcsa.service.ts`)
- **Added `searchCarrierMultiple()`**: Returns multiple trucking company results
- **Modified `searchCarrier()`**: Now uses `searchCarrierMultiple()` internally
- Note: Single DOT/MC lookups still return 1 result; name searches can return multiple

#### Scrape Service (`src/services/scrape.service.ts`)
- **Added `scrapeMultiple()`**: Main method to scrape multiple leads from any source
- **Added source-specific multiple scrape methods**:
  - `googlePlacesScrapeMultiple()`
  - `npiRegistryScrapeMultiple()`
  - `fmcsaScrapeMultiple()`
- Legacy sources (Shopify, Etsy, G2, WooCommerce) return single result wrapped in array
- Returns standardized `ScrapeMultipleResults` interface

### 3. Lead Service (`src/services/lead.service.ts`)
- **Added `scrapeLeads()`**: Scrapes multiple leads without saving to database
  - Validates user subscription and source access
  - Logs scraping operations
  - Returns array of scraped lead data
- **Added `bulkCreateLeads()`**: Saves multiple selected leads to database
  - Checks usage limits before bulk insert
  - Extracts location data for each lead
  - Updates usage counter after successful creation

### 4. Usage Limit Service (`src/services/usage-limit.service.ts`)
- **Added `increCurrentLeadsByCount()`**: Increments lead counter by specified amount
- Validates that bulk operation won't exceed plan limits

### 5. Server Actions (`src/lib/actions/lead.actions.ts`)
- **Added `scrapeLeadsAction()`**: Server action to scrape leads
  - Returns scraped results without saving
  - Handles errors gracefully
- **Added `bulkCreateLeadsAction()`**: Server action to save selected leads
  - Takes array of leads with scrape info
  - Returns count of successfully created leads
  - Revalidates dashboard paths

### 6. UI Component (`src/components/leads/add-lead-dialog.tsx`)

Complete redesign with two-phase flow:

#### Phase 1: Search
- User selects source and enters search criteria
- Clicking "Search Leads" scrapes and displays results
- Shows loading state with spinner

#### Phase 2: Selection & Save
- **Results Table**: Displays all found leads in a table with columns:
  - Save (checkbox)
  - Business Name
  - Description
  - Email
  - Phone
  - Address
- **Select All/Deselect All**: Toggle button for bulk selection
- **Selection Counter**: Shows "X of Y selected"
- **Save Selected Leads Button**: Only enabled when leads are selected
  - Shows count of selected leads in button text
  - Saves only the checked leads
- **Back to Search**: Allows starting a new search

#### Additional Features
- Auto-selects all results by default for convenience
- Truncates long text with ellipsis and shows full text on hover
- Wider dialog (max-w-4xl/5xl) to accommodate table
- Clear error handling and validation messages
- Maintains all source-specific fields (Google Places, NPI, FMCSA)
- Preserves quick preset functionality

### 7. New UI Components
- **Created `src/components/ui/checkbox.tsx`**: Checkbox component using Radix UI
- **Installed `@radix-ui/react-checkbox`**: Required dependency

## User Flow

1. **Open Dialog**: User clicks "Add Lead" button
2. **Select Source**: Choose from available sources (Shopify, Etsy, G2, WooCommerce, Google Places, NPI, FMCSA)
3. **Enter Criteria**: Fill in source-specific search parameters
4. **Search**: Click "Search Leads" button
   - Shows loading state
   - Scrapes up to 20 results
5. **Review Results**: Table displays all found leads
   - All leads pre-selected by default
6. **Select Leads**: 
   - Use checkboxes to select/deselect individual leads
   - Use "Select All" button for bulk selection
7. **Save**: Click "Save Selected Leads (X)" button
   - Only selected leads are saved to database
   - Usage limit is updated accordingly
8. **Success**: Dialog closes and leads table refreshes

## Benefits

### For Users
- **Control**: Users decide which leads to keep
- **Efficiency**: Bulk operations reduce repetitive tasks
- **Visibility**: See all available leads before committing
- **Flexibility**: Can select any combination of results

### For System
- **Better Resource Usage**: Users only save relevant leads
- **Accurate Metrics**: Usage counts reflect actual saved leads
- **Reduced Database Bloat**: No unwanted/duplicate leads saved automatically

## Technical Highlights

- **Backward Compatible**: Old sources (Shopify, Etsy, etc.) still work with single-result logic
- **Scalable**: New sources (Google Places, NPI, FMCSA) support multiple results
- **Type Safe**: Full TypeScript support with proper interfaces
- **Error Handling**: Comprehensive error handling at every layer
- **User Feedback**: Clear loading states, error messages, and success notifications
- **Clean Code**: Maintainable, well-documented, and follows existing patterns

## Files Modified

1. `src/types/lead.ts` - Type definitions
2. `src/services/google-places.service.ts` - Multiple results support
3. `src/services/npi-registry.service.ts` - Multiple results support
4. `src/services/fmcsa.service.ts` - Multiple results support
5. `src/services/scrape.service.ts` - Multiple scraping methods
6. `src/services/lead.service.ts` - Scrape and bulk create methods
7. `src/services/usage-limit.service.ts` - Bulk increment method
8. `src/lib/actions/lead.actions.ts` - New server actions
9. `src/components/leads/add-lead-dialog.tsx` - Complete UI redesign
10. `src/components/ui/checkbox.tsx` - New checkbox component

## Testing Recommendations

1. **Source Testing**: Test each source type (especially new ones: Google Places, NPI, FMCSA)
2. **Selection Testing**: Verify checkbox selection/deselection works correctly
3. **Limit Testing**: Ensure usage limits are properly enforced
4. **Error Scenarios**: Test with invalid inputs, network failures, empty results
5. **Bulk Operations**: Test saving 1, multiple, and maximum number of leads
6. **UI/UX**: Verify responsive design, loading states, and error messages

## Future Enhancements

1. **Pagination**: Support for viewing more than 20 results
2. **Filtering**: In-table filtering/sorting of results
3. **Deduplication**: Warn if selected leads already exist
4. **Batch Operations**: Export selected leads to CSV
5. **Preview**: Detailed preview of lead data before saving
