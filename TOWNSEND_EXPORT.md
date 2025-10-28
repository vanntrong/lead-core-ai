# TownSend Export Feature

This document explains how the TownSend export feature works in the LeadCore AI application.

## Overview

The TownSend export feature allows users to export their leads directly to TownSend as audiences for targeting and engagement. This integration is implemented entirely on the server side for security.

## Architecture

### 1. Database Schema

A new table `user_api_keys` has been created to securely store user API keys:

```sql
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    service_name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, service_name)
);
```

### 2. Backend Services

**TownSend Service** (`src/services/townsend.service.ts`):
- `getUserApiKey(userId)` - Retrieves the user's TownSend API key
- `saveUserApiKey(userId, apiKey)` - Saves or updates the API key
- `exportLeadsToAudience(apiKey, leads, audienceName)` - Exports leads to TownSend
- `verifyApiKey(apiKey)` - Validates an API key before saving

**Lead Export Service** (`src/services/lead-export.service.ts`):
- Updated to support `"townsend"` as a new export format
- `exportToTownSend(leads, audienceName)` - Client-side method to initiate export

### 3. API Routes

**Export Route** (`/api/townsend/export`):
- Method: POST
- Body: `{ leads: Lead[], audienceName?: string }`
- Handles the actual export to TownSend
- Retrieves user's API key from database
- Returns success/error with message

**API Key Management Route** (`/api/townsend/api-key`):
- GET: Check if user has an API key configured
- POST: Save/update API key (validates before saving)
- DELETE: Remove API key

### 4. Frontend Components

**TownSend API Key Dialog** (`src/components/leads/townsend-api-key-dialog.tsx`):
- Modal dialog for entering/updating TownSend API key
- Validates and saves the API key
- Shows helpful instructions

**Export Leads Dialog** (`src/components/leads/export-leads-dialog.tsx`):
- Updated to include TownSend as an export option
- Shows API key configuration UI when not configured
- Optional audience name field

## Usage Flow

1. **First Time Setup**:
   - User opens Export Leads dialog
   - Selects "TownSend" as export format
   - Clicks "Configure TownSend API Key"
   - Enters API key in the modal
   - System verifies the key with TownSend API
   - Key is saved to database if valid

2. **Exporting Leads**:
   - User selects leads (via filters or all)
   - Opens Export Leads dialog
   - Selects "TownSend" format
   - Clicks "Export" button
   - System filters for leads with verified emails only
   - System retrieves API key from database
   - Sends verified leads to TownSend API as an array
   - Displays success message with count (including skipped count if any)
   - Displays error message if no verified emails found or API error occurs

## Error Handling

The system handles various error scenarios:

1. **Rate Limits**: When TownSend API returns 429 status, the error message from the `message` field is displayed
2. **Invalid API Key**: Validated before saving, prevents invalid keys
3. **Missing API Key**: Clear UI prompt to configure the key
4. **No Verified Emails**: If no leads have verified emails, a clear error message is displayed
5. **Network Errors**: Caught and displayed to user
6. **Server Errors**: Proper error messages returned from API

## Environment Variables

Required environment variable:

```env
TOWN_SEND_HOST=https://your-townsend-host.com
```

This should be set in your `.env.local` file (for development) or in your hosting platform's environment variables (for production).

## Security Considerations

1. **API keys are stored in the database** with Row Level Security (RLS) enabled
2. **All API calls are server-side** - client never sees or handles the API key directly
3. **API keys are validated** before being saved
4. **User-specific**: Each user can only access their own API keys

## Database Migration

To enable this feature, run the migration:

```bash
supabase migration up 20251023_create_user_api_keys.sql
```

Or apply it manually to your database.

## Type Definitions

The `user_api_keys` table has been added to the database types in:
- `database.types.ts`
- `src/types/database.ts`

## Testing

To test the feature:

1. Ensure `TOWN_SEND_HOST` is set in environment
2. Configure a valid TownSend API key
3. Select some leads
4. Export to TownSend with a custom audience name
5. Verify the audience is created in TownSend

## API Payload Format

When exporting to TownSend, the following payload is sent as an **array of audience members**:

```typescript
[
  {
    name: "Company Title",
    email: "first@email.com",
    description: "Company Description", // optional
    tags: "shopify|retail" // optional, pipe-separated
  },
  {
    name: "Another Company",
    email: "second@email.com",
    description: "Another Description",
    tags: "etsy|handmade"
  }
  // ... more leads
]
```

### Field Mapping

- **name**: Lead's business title (from `scrap_info.title` or `enrich_info.title_guess`)
- **email**: First verified email from the lead (from `scrap_info.emails[0]`)
- **description**: Lead's description (from `scrap_info.desc` or `enrich_info.summary`)
- **tags**: Pipe-separated tags including source and business type (e.g., "shopify|retail")

### Filtering Rules

**Only leads with verified emails are exported:**
- Lead must have `verify_email_status === "verified"`
- Lead must have at least one email in `scrap_info.emails`
- Leads without verified emails are automatically skipped

The export will show a count of skipped leads if any were filtered out.

## Future Enhancements

Potential improvements:
- Batch export for large lead lists
- Export history/logs
- Sync status checking
- Webhook notifications from TownSend
- Multiple TownSend account support

