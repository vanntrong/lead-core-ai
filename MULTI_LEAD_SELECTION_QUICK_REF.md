# Multi-Lead Selection - Quick Reference

## Before vs After

### OLD FLOW (Single Lead)
```
1. User enters search criteria
2. Click "Add Lead" 
3. System scrapes and automatically saves FIRST result only
4. Dialog closes
5. User sees 1 new lead in table
```

### NEW FLOW (Multiple Leads with Selection)
```
1. User enters search criteria
2. Click "Search Leads"
3. System scrapes up to 20 results
4. Results shown in table with checkboxes
5. User selects which leads to keep
6. Click "Save Selected Leads (X)"
7. Only selected leads are saved
8. Dialog closes
9. User sees selected leads in table
```

## UI Changes

### Search Phase
- Button changed from "Add Lead" → "Search Leads"
- Shows loading spinner: "Searching..."
- No automatic save

### Results Phase
- **New Table View** with columns:
  - ☐ Save checkbox
  - Business Name
  - Description  
  - Email
  - Phone
  - Address

- **New Controls**:
  - "Select All" / "Deselect All" button
  - Selection counter: "5 of 10 selected"
  - "Save Selected Leads (5)" button
  - "← Back to Search" link

### Better UX
- All results pre-selected by default
- Hover to see full text (truncated fields)
- Disabled save button if nothing selected
- Clear error messages
- Wider dialog to fit table

## API Changes

### New Server Actions
```typescript
// Scrape without saving
scrapeLeadsAction(data: CreateLeadData)
// Returns: { success, results, message }

// Save selected leads
bulkCreateLeadsAction(leads: Array<{url, source, scrapInfo}>)
// Returns: { success, count, message }
```

### New Service Methods
```typescript
// LeadService
scrapeLeads(data) → Array<ScrapedLead>
bulkCreateLeads(leads) → Array<Lead>

// ScrapeService  
scrapeMultiple(url, source, maxResults) → ScrapeMultipleResults

// Source Services
searchPlacesMultiple(params, maxResults) → GooglePlacesSearchMultipleResult
searchProviderMultiple(params, maxResults) → NPISearchMultipleResult
searchCarrierMultiple(params, maxResults) → FMCSASearchMultipleResult
```

## Key Rules

1. **Always show as many valid leads as possible** - Give user control
2. **Pre-select all by default** - Optimize for "save all" use case
3. **Clear, readable table format** - Easy to scan and compare
4. **Checkbox per row** - Individual control
5. **Select All button** - Convenience feature
6. **Disabled save if empty** - Prevent confusion

## Component Architecture

```
AddLeadDialog
├── Search Form (Phase 1)
│   ├── Source Selector
│   ├── Source-Specific Fields
│   │   ├── Google Places (keyword, location)
│   │   ├── NPI Registry (provider, taxonomy, location)
│   │   └── FMCSA (company, DOT, MC)
│   └── "Search Leads" Button
│
└── Results Table (Phase 2)
    ├── Selection Controls
    │   ├── "Select All" Button
    │   └── Counter ("5 of 10 selected")
    ├── Data Table
    │   └── Rows with checkboxes
    ├── "Back to Search" Link
    └── "Save Selected Leads (X)" Button
```

## Example Usage

### Google Places Search
```typescript
// User enters:
keyword: "coffee shops"
location: "Seattle, WA"

// System returns 15 results
// User sees table with 15 coffee shops
// User unchecks 3 low-rated ones
// Clicks "Save Selected Leads (12)"
// 12 leads added to database
```

### NPI Registry Search  
```typescript
// User enters:
taxonomy: "dentist"
location: "California"

// System returns 20 results (max)
// User sees table with 20 dentists
// User keeps all selected
// Clicks "Save Selected Leads (20)"
// 20 leads added to database
```

## Error Handling

### Validation Errors
- Shown immediately in form
- Prevents scraping attempt
- Clear field-level messages

### Scraping Errors
- Alert banner at top
- Specific error message
- Option to try again

### Save Errors
- Alert banner at top
- Usage limit exceeded → Upgrade prompt
- Other errors → Retry allowed

## Performance Considerations

- Scrapes up to 20 results (configurable)
- Parallel API calls where possible
- Efficient bulk insert (single query)
- Optimistic UI updates
- Table virtualization for large result sets (future)

## Backward Compatibility

- Old sources (Shopify, Etsy, G2, WooCommerce) still supported
- They return 1 result, shown in table
- Same selection flow applies
- No breaking changes to existing functionality
