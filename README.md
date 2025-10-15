# LeadCoreAI UI

## 1. Install & Start Project

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Create environment config file

Create `.env.local` (or copy from `.env.example`) and fill in the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
APIFY_TOKEN=your_apify_token
NEXT_PUBLIC_ADMIN_EMAILS=your_admin_email
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
ANTHROPIC_API_KEY=your_anthropic_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Geoapify Geocoding API (Required for location search)
# Get free API key: https://myprojects.geoapify.com/
# Free tier: 3,000 requests/day
GEOAPIFY_API_KEY=your_geoapify_api_key
```

### Step 3: Run development server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## 2. Build & Deploy (Vercel)

### Build for production

```bash
npm run build
```

### Deploy to Vercel

- Push code to the main branch.
- Vercel will automatically build and deploy.
- You can also deploy manually via the Vercel dashboard.

## 3. Main Folder Structure

```
├── public/                # Static images, videos, SVGs
├── scripts/               # Utility scripts
├── src/
│   ├── app/               # Next.js app routes & pages
│   ├── components/        # React UI components
│   ├── config/            # App configuration
│   ├── constants/         # Constants
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Shared libraries
│   ├── services/          # API/service logic
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── supabase/              # Supabase config, functions, migrations
├── package.json           # Metadata & scripts
├── tsconfig.json          # TypeScript config
└── ...
```

## 4. Key Feature Locations

- **Scrapers:** `src/services/scrape.service.ts` and related files in `src/services/`
- **Enrichment:** `src/services/lead-scoring.service.ts` and other lead-related services
- **Billing:** `src/services/invoice.service.ts`, `src/services/subscription.service.ts`, Stripe integration in `src/lib/stripe.ts`
- **Exports:** `src/services/lead-export.service.ts`

## 5. Location Geocoding Setup

The application uses **Geoapify Forward Geocoding API** for location search and normalization.

### Quick Setup:
1. Get free API key at: https://myprojects.geoapify.com/
2. Add `GEOAPIFY_API_KEY` to your `.env.local`
3. Restart dev server

### Free Tier Limits:
- ✅ 3,000 requests/day
- ✅ 5 requests/second
- ✅ No credit card required

📖 **Full Guide:** [GEOAPIFY_SETUP.md](./GEOAPIFY_SETUP.md)  
📖 **Migration Details:** [GEOAPIFY_MIGRATION.md](./GEOAPIFY_MIGRATION.md)

## 6. Notes

- Make sure all environment variables are filled in correctly.
- If using Supabase, create a project and get the appropriate keys.
- Stripe is only used for payment features.
- Geoapify API key is required for location-based features.
