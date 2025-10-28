# TownSend Export Update Summary

## Changes Made

Updated the TownSend export feature to match the TownSend API requirements:

### 1. Updated Payload Format

**Before:**
```typescript
{
  name: "Audience Name",
  leads: [...]
}
```

**After:**
```typescript
[
  {
    name: string,
    email: string,
    description?: string,
    tags?: string  // pipe-separated: "tag1|tag2"
  }
]
```

### 2. Email Verification Filter

**New Feature**: Only leads with verified emails are exported.

The system now:
- Filters leads to only include those with `verify_email_status === "verified"`
- Ensures each lead has at least one email in `scrap_info.emails`
- Counts and reports skipped leads (those without verified emails)
- Shows clear error if no leads have verified emails

### 3. Field Mapping

Each exported lead includes:

- **name**: Business title from `scrap_info.title` or `enrich_info.title_guess` (required)
- **email**: First email from `scrap_info.emails[0]` (required)
- **description**: From `scrap_info.desc` or `enrich_info.summary` (optional)
- **tags**: Pipe-separated string combining:
  - Lead source (e.g., "shopify", "etsy", "g2")
  - Business type (if available)
  - Example: "shopify|retail"

### 4. Removed Audience Name

The audience name parameter has been removed since the new API format doesn't use it. The export now sends an array of audience members directly.

### 5. Updated UI Messages

- Export info now mentions "leads with verified emails"
- Success messages show count of exported leads and skipped leads
- Clear error message when no verified emails are found

## Files Modified

1. `src/services/townsend.service.ts`
   - Updated `TownSendAudiencePayload` interface
   - Added email verification filtering
   - Changed payload to array format
   - Removed `audienceName` parameter
   - Added tags generation from source and business_type

2. `src/app/api/townsend/export/route.ts`
   - Removed `audienceName` from request body
   - Updated service call

3. `src/services/lead-export.service.ts`
   - Removed `audienceName` from options interface
   - Updated method signature
   - Simplified export call

4. `src/components/leads/export-leads-dialog.tsx`
   - Removed audience name input field
   - Updated schema (removed audienceName)
   - Updated info text to mention verified emails requirement
   - Simplified UI for TownSend option

5. `TOWNSEND_EXPORT.md`
   - Updated documentation to reflect new payload format
   - Added filtering rules section
   - Updated field mapping details

## Success Message Example

```
Successfully exported 45 leads to TownSend (3 leads skipped - no verified email)
```

Or if all leads have verified emails:
```
Successfully exported 45 leads to TownSend
```

## Error Messages

### No Verified Emails
```
No leads with verified emails found to export
```

### Rate Limit
```
TownSend API rate limit exceeded. Please try again later.
```
(Or custom message from TownSend's response.message field)

## Testing Checklist

- ✅ Leads with verified emails are exported
- ✅ Leads without verified emails are skipped
- ✅ Payload format matches array structure
- ✅ Tags are properly formatted with pipe separator
- ✅ Optional fields (description, tags) handled correctly
- ✅ Error messages clear and helpful
- ✅ Success message shows skipped count when applicable
- ✅ No linter errors

## API Call Example

**Endpoint:** POST `{TOWN_SEND_HOST}/api/v1/audiences`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {api_key}
```

**Body:**
```json
[
  {
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "description": "Leading provider of innovative solutions",
    "tags": "shopify|ecommerce"
  },
  {
    "name": "Tech Startup Inc",
    "email": "hello@techstartup.com",
    "description": "Cutting-edge technology company",
    "tags": "g2|software"
  }
]
```

## Database Impact

No database changes required - only filtering logic changed in the application layer.

