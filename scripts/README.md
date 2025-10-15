# FMCSA Data Import

This directory contains the script to import FMCSA company data into Supabase.

## Prerequisites

1. **Run the migration first**:
   ```bash
   # Make sure you're connected to your Supabase project
   npx supabase migration up
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory (or use your existing one) with:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

   You can find these values in your Supabase project settings:
   - Dashboard → Project Settings → API
   - Use the **service_role** key (not the anon key)

3. **Install dependencies** (if not already installed):
   ```bash
   npm install @supabase/supabase-js
   ```

## Running the Import Script

### Option 1: Using Node.js directly

```bash
# Load environment variables and run the script
node -r dotenv/config scripts/import-fmcsa-data.js
```

### Option 2: Using environment variables directly

```bash
SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/import-fmcsa-data.js
```

### Option 3: Add to package.json scripts

Add this to your `package.json`:

```json
{
  "scripts": {
    "import-fmcsa": "node -r dotenv/config scripts/import-fmcsa-data.js"
  }
}
```

Then run:
```bash
npm run import-fmcsa
```

## What the Script Does

1. ✅ Reads FMCSA company data from `data/fmcsa.json`
2. ✅ Transforms the data to match the database schema
3. ✅ Checks for existing data in the table
4. ✅ Imports data in batches of 100 records
5. ✅ Shows progress and statistics
6. ✅ Verifies the import was successful

## Expected Output

```
🚀 Starting FMCSA data import...

📖 Reading data from: /path/to/data/fmcsa.json
📊 Found 10 companies to import

🔄 Transforming data...
✅ Data transformation complete

🔍 Checking existing data...

📦 Importing 10 records in 1 batches...

📦 Processing batch 1/1 (10 records)...
✅ Successfully inserted batch 1 (10 records)

✨ Import completed successfully!
   Total records imported: 10
   Duration: 1.23 seconds
   Average: 8.13 records/second

🔍 Verifying import...
   Total records in database: 10

🎉 Import process complete!
```

## Troubleshooting

### Error: Missing environment variables
- Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Use the service_role key, not the anon key

### Error: Table doesn't exist
- Run the migration first: `npx supabase migration up`
- Check that the migration file `20251015_create_fmcsa_companies.sql` exists

### Error: Permission denied
- Make sure you're using the service_role key
- Check your Supabase RLS policies

### Re-running the import
- The script will warn you if data already exists
- To clear the table first:
  ```sql
  DELETE FROM fmcsa_companies;
  ```
  Or use the Supabase dashboard

## Data Schema Mapping

The script maps the JSON fields to the database columns:

| JSON Field | Database Column |
|------------|----------------|
| LegalName | legal_name |
| USDOTNumber | dot_number |
| Telephone | telephone |
| PhysicalAddress | physical_address |
| City | city |
| State | state |
| Zip | zip_code |

## Next Steps

After importing the data:

1. ✅ Verify the data in Supabase dashboard
2. ✅ Test the new `fmcsaDatabaseService` in your application
3. ✅ The old `fmcsaService` is still available as fallback
4. ✅ All existing code has been updated to use the new service

## Adding More Data

To add more FMCSA companies:

1. Add them to `data/fmcsa.json`
2. Run the import script again
3. The script will add new records (it doesn't check for duplicates)

For production use, consider adding:
- Duplicate detection by DOT number
- Update existing records instead of insert
- Incremental imports
