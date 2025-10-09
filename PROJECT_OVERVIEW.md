# LeadCore AI - Project Overview

## 📋 Table of Contents
- [Project Summary](#project-summary)
- [Mission & Purpose](#mission--purpose)
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [User Workflow](#user-workflow)
- [Pricing & Business Model](#pricing--business-model)
- [Key Components](#key-components)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Important Notes](#important-notes)

---

## 🎯 Project Summary

**LeadCore AI** is a SaaS platform that automates B2B lead generation by scraping e-commerce platforms (Shopify, WooCommerce, Etsy) and B2B software directories (G2). It enriches scraped data using AI (Claude by Anthropic), verifies email addresses, scores leads, and allows users to export qualified leads to CSV, Google Sheets, or via webhooks (Zapier/GHL).

**Target Audience**: Business owners, sales teams, marketing agencies, and logistics managers looking for qualified leads from specific e-commerce and SaaS platforms.

---

## 🎯 Mission & Purpose

### What Problem Does This Solve?

**Manual lead generation is time-consuming and inefficient:**
- Sales teams waste hours manually finding potential clients on Shopify, Etsy, G2, etc.
- Contact information is scattered across websites and hard to verify
- No systematic way to qualify and score leads at scale
- Exporting and integrating lead data into CRMs requires manual copy-pasting

### The Solution

LeadCore AI automates the entire lead generation pipeline:
1. **Scrape** - Automatically extract business information from e-commerce platforms
2. **Enrich** - Use AI to generate company summaries and infer business context
3. **Verify** - Validate email addresses to ensure deliverability
4. **Score** - Rank leads based on data quality and verification status
5. **Export** - Seamlessly integrate leads into your existing workflows

---

## 💡 Solution Overview

### Core Value Proposition

> "Find, enrich, and export leads from Shopify, G2, Etsy & more — in seconds."

LeadCore AI transforms a URL into a fully qualified lead record containing:
- Scraped website metadata (title, description, emails)
- AI-generated business summary and company type
- Verified email status
- Lead quality score (0-100)
- Export-ready format for CRMs and marketing tools

### Key Differentiators

1. **Multi-Platform Support**: Shopify, WooCommerce, Etsy, and G2 in one tool
2. **AI-Powered Enrichment**: Claude 3.7 Sonnet generates contextual business insights
3. **Real-Time Verification**: Email validation using Apify actors
4. **Smart Lead Scoring**: Weighted scoring system for lead prioritization
5. **Flexible Export**: CSV, Google Sheets, Zapier, webhooks
6. **Usage-Based Pricing**: Tiered plans from trial (25 leads) to unlimited

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router with React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + Ultracite design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form + Zod validation
- **Animations**: tw-animate-css

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Functions (Deno runtime)

### External Services
- **AI/ML**: Anthropic Claude 3.7 Sonnet (for lead enrichment)
- **Scraping**: 
  - Cheerio (for direct web scraping)
  - Apify Actors (for specialized scrapers: Etsy, G2)
- **Email Verification**: Apify Email Verifier actor
- **Payments**: Stripe (subscriptions, invoices, webhooks)
- **Proxy Management**: Custom proxy rotation system
- **OAuth**: Google OAuth for Sheets export

### Development Tools
- **Code Quality**: Biome (linter + formatter)
- **Package Manager**: pnpm 10.15.1
- **Type Safety**: TypeScript 5
- **Build**: Next.js Turbopack

---

## 🏗️ Architecture

### Application Structure

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                   │
│  (React 19 + TanStack Query + Zustand)             │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼─────────┐  ┌──────▼──────────┐
│  Next.js API    │  │  Supabase Auth  │
│     Routes      │  │   & Database    │
└───────┬─────────┘  └──────┬──────────┘
        │                   │
        │         ┌─────────┴─────────────┐
        │         │                       │
┌───────▼─────────▼─────┐        ┌───────▼──────────┐
│  Service Layer         │        │  Supabase Edge   │
│  - Scraping           │        │    Functions     │
│  - Enrichment Proxy   │        │  - enrich-job    │
│  - Lead Management    │        │  - proxy-check   │
│  - Stripe Integration │        │  - stripe-hook   │
└───────┬───────────────┘        └──────────────────┘
        │
        └──────┬──────────────────────┬──────────────┐
               │                      │              │
      ┌────────▼────────┐    ┌───────▼────────┐   ┌▼────────┐
      │  Anthropic API  │    │  Apify Actors  │   │ Stripe  │
      │  (Claude 3.7)   │    │  (Scraping +   │   │   API   │
      └─────────────────┘    │  Verification) │   └─────────┘
                             └────────────────┘
```

### Database Schema (Key Tables)

#### `leads` (Core Entity)
```typescript
{
  id: uuid
  user_id: uuid (FK to auth.users)
  url: text
  source: enum (shopify, etsy, g2, woocommerce)
  status: enum (pending, scraped, enriching, enriched, error, scrap_failed)
  scrap_info: jsonb {
    title: string
    desc: string
    emails: string[]
  }
  enrich_info: jsonb {
    summary: string
    title_guess: string
  }
  verify_email_info: jsonb[]
  verify_email_status: enum (verified, invalid, unknown)
  flagged: boolean
  score: number (calculated)
  created_at: timestamp
}
```

#### `subscriptions`
```typescript
{
  id: uuid
  user_id: uuid
  stripe_subscription_id: text
  plan_tier: enum (trial, basic, pro, unlimited)
  status: enum (active, canceled, past_due, trialing)
  current_period_start: timestamp
  current_period_end: timestamp
  usage_limit_id: uuid (FK to usage_limits)
}
```

#### `usage_limits`
```typescript
{
  id: uuid
  subscription_id: uuid
  current_leads: number
  max_leads: number | null
  sources: string[] (e.g., ["shopify", "g2"])
  csv_export: boolean
  sheets_export: boolean
  zapier_export: boolean
}
```

#### `proxies` (Admin Managed)
```typescript
{
  id: uuid
  host: text
  port: number
  username: text
  password: text
  status: enum (active, banned, error)
  last_used: timestamp
  success_rate: number
}
```

#### Admin Logging Tables
- `scraper_logs` - Tracks scraping operations (success/failure rates)
- `proxy_logs` - Tracks proxy usage and bans
- `proxy_heal_check_logs` - Health checks for proxy rotation

---

## ⚙️ Core Features

### 1. Multi-Source Lead Scraping

**Supported Platforms:**
- **Shopify**: Scrapes store contact pages, product pages
- **WooCommerce**: Extracts store metadata from WooCommerce sites
- **Etsy**: Uses Apify actor (`axlymxp~etsy-shop-scraper`)
- **G2**: Uses Apify actor (`omkar-cloud~g2-product-scraper`)

**Scraping Methods:**
- **Direct HTTP + Cheerio**: For Shopify/WooCommerce (faster, uses proxy rotation)
- **Apify Actors**: For Etsy/G2 (specialized scrapers with built-in anti-bot measures)

**Data Extracted:**
- Page title and meta description
- All email addresses (using regex + mailto: links)
- Additional metadata based on source

**Error Handling:**
- Timeout detection
- SSL errors → proxy marked as banned
- Rate limiting detection
- Detailed error logging for debugging

### 2. AI-Powered Lead Enrichment

**Technology**: Anthropic Claude 3.7 Sonnet

**Enrichment Process:**
```
Scraped Data → Claude Prompt → JSON Response
                                    ↓
                            {
                              "summary": "3-4 sentence business description",
                              "title_guess": "Short company category (max 6 words)"
                            }
```

**Prompt Engineering:**
- Structured prompt asks Claude to summarize business model
- Infers company type from scraped metadata
- Returns strict JSON format (validated and parsed)

**Background Processing:**
- Supabase Edge Function `enrich-job` runs as scheduled cron
- Processes leads in `scraped` status → `enriching` → `enriched`
- One lead at a time per user to respect API rate limits

### 3. Email Verification

**Provider**: Apify Email Verifier (`fatihtahta~email-verifier-free-to-use`)

**Verification Levels:**
- **Syntax Check**: Valid email format
- **Domain Check**: MX records exist
- **Deliverability**: SMTP validation (optional)

**Status Types:**
- `verified` - Email is valid and deliverable
- `invalid` - Email is malformed or domain doesn't exist
- `unknown` - Could not verify (timeout, rate limit)

**Result Storage:**
```typescript
verify_email_info: [
  {
    input_email: "contact@example.com",
    status: "valid" | "invalid" | "unknown",
    risk: "low" | "medium" | "high",
    result: "deliverable" | "undeliverable"
  }
]
```

### 4. Lead Scoring System

**Scoring Algorithm** (Defined in `lead-score.weights.json`):

```json
{
  "verified_email": 40,
  "tech_signals": 30,
  "enrichment_quality": 30
}
```

**Scoring Rules:**
- **+40 points**: Email verified as deliverable
- **+30 points**: Has tech signals (title + description present)
- **+30 points**: Successfully enriched by AI

**Score Ranges:**
- 0-49: Low quality lead
- 50-69: Medium quality lead
- 70-89: High quality lead
- 90-100: Premium lead

**Usage**: Used for lead filtering, dashboard stats, and export prioritization.

### 5. Proxy Management System

**Purpose**: Rotate proxies to avoid IP bans during scraping

**Components:**
- Admin panel to add/manage proxies
- `proxies` table stores proxy credentials and status
- Round-robin selection: `getNextProxy()` rotates based on `last_used`
- Health check cron job (`proxy-heal-check`) validates proxy status
- Automatic banning on repeated failures

**Logging:**
- `proxy_logs`: Tracks every scraping request (success/failure/timeout)
- `proxy_heal_check_logs`: Records proxy health checks
- Admin dashboard displays proxy performance metrics

### 6. Export System

**Export Formats:**

#### CSV Export
- Downloads `.csv` file with lead data
- Columns: URL, Source, Status, Title, Description, Enrichment, Emails, Score
- Available on all plans

#### Google Sheets Export
- OAuth2 integration with Google APIs
- Creates new spreadsheet or appends to existing
- Requires `sheets_export: true` in plan (Pro/Unlimited)

#### Zapier/Webhook Export
- POST request to user-provided webhook URL
- JSON payload with lead data
- Available on Unlimited plan only

**Export Service** (`lead-export.service.ts`):
- Centralized export logic
- Handles CSV generation, Google Sheets API calls, webhook delivery
- Error handling for failed exports

---

## 👥 User Workflow

### New User Journey

```
1. Landing Page
   ↓
2. Sign Up (Email/Password or Google OAuth)
   ↓
3. Checkout Page → Select Plan (Trial/Basic/Pro/Unlimited)
   ↓
4. Stripe Payment (Subscription created)
   ↓
5. Dashboard Access Granted
```

### Lead Generation Workflow

```
1. User enters URL + selects source (Shopify/Etsy/G2/Woo)
   ↓
2. Frontend validates usage limits (current_leads < max_leads)
   ↓
3. Backend scrapes URL:
   - Direct scraping (Shopify/Woo) with proxy rotation
   - Apify actor (Etsy/G2)
   ↓
4. Scraped data saved to database (status: "scraped")
   ↓
5. Supabase cron job picks up lead for enrichment
   ↓
6. Claude API generates summary + title_guess
   ↓
7. Email verification via Apify (if emails found)
   ↓
8. Lead status updated to "enriched"
   ↓
9. User views lead in dashboard with score
   ↓
10. User exports lead to CSV/Sheets/Webhook
```

### Dashboard Features

**Lead Management:**
- Paginated lead table with filters (source, status, verification status)
- Search by URL
- Date range filtering
- Lead detail modal with enrichment data

**Statistics:**
- Total leads
- Verified emails count
- Enriched leads count
- Score distribution (70+, 90+)
- Error count
- Source breakdown chart

**Actions:**
- Add new lead
- Export leads (CSV/Sheets/Webhook)
- Flag leads for moderation
- Delete leads

---

## 💰 Pricing & Business Model

### Subscription Tiers

| Plan       | Price/Month | Leads/Month | Sources        | Exports               |
|------------|-------------|-------------|----------------|-----------------------|
| **Trial**  | $7.00       | 25          | 1 source       | CSV only              |
| **Basic**  | $97.00      | 100         | 1 source       | CSV only              |
| **Pro**    | $297.00     | 500         | Unlimited      | CSV + Google Sheets   |
| **Unlimited** | $497.00  | Unlimited   | Unlimited      | CSV + Sheets + Zapier |

**Pricing Configuration**: `/src/config/pricing-plans.json`

**Stripe Integration:**
- Subscription-based billing (monthly)
- Webhooks handle subscription lifecycle:
  - `checkout.session.completed` → Create subscription
  - `customer.subscription.updated` → Update plan
  - `invoice.payment_succeeded` → Record payment
  - `customer.subscription.deleted` → Cancel subscription

**Usage Limits Enforcement:**
- `usage_limits` table tracks current usage vs. plan limits
- Frontend checks limits before allowing lead creation
- Backend validates limits in `lead.service.ts`

**Upgrade Flow:**
- User clicks "Upgrade" button
- Redirects to Stripe Checkout with new plan's `priceId`
- Old subscription canceled, new subscription created

---

## 🔑 Key Components

### Service Layer (`/src/services/`)

#### `scrape.service.ts`
- Direct HTTP scraping with Cheerio
- Proxy rotation integration
- Email extraction (regex + mailto links)
- Platform-specific validation (Shopify, WooCommerce)
- Error handling and logging

#### `apify.service.ts`
- Wrapper for Apify API
- Runs actors synchronously with timeout
- Used for Etsy, G2 scraping and email verification

#### `lead.service.ts`
- CRUD operations for leads
- Pagination and filtering
- Lead statistics calculation
- Creates leads with scraping and logging

#### `lead-scoring.service.ts`
- Implements weighted scoring algorithm
- Scores individual leads or batches
- Used in exports and dashboards

#### `subscription.service.ts`
- Fetches user's active subscription
- Checks plan limits before operations
- Integrates with Stripe for plan changes

#### `stripe.service.ts`
- Creates Stripe customers and subscriptions
- Handles checkout sessions
- Cancels subscriptions
- Fetches customer portal link

#### `usage-limit.service.ts`
- Increments lead count when new lead created
- Validates if user has reached plan limit
- Resets counters on billing cycle

### Supabase Edge Functions (`/supabase/functions/`)

#### `enrich-job/` (Scheduled Cron)
- Runs every minute (or configured interval)
- Queries leads with `status: "scraped"`
- Sends scraped data to Claude for enrichment
- Updates lead with `enrich_info` JSON
- Triggers email verification if emails found

#### `proxy-heal-check/` (Scheduled Cron)
- Queries all active proxies
- Tests each proxy with sample HTTP request
- Updates proxy status (active/banned/error)
- Logs results to `proxy_heal_check_logs`

#### `stripe-webhook/`
- Receives webhooks from Stripe
- Validates webhook signature
- Handles subscription events (created, updated, deleted)
- Creates/updates invoices on payment success

### Frontend Components (`/src/components/`)

#### `dashboard-layout.tsx`
- Wrapper for authenticated pages
- Displays navigation, sidebar, and user info
- Shows current plan badge

#### `pricing-plans.tsx`
- Renders pricing cards
- Highlights current plan
- Redirects to Stripe Checkout on selection

#### `leads/` (Lead Management)
- Lead table with pagination
- Lead creation modal
- Lead detail modal with enrichment data
- Export dialog (CSV/Sheets/Webhook)

#### `ui/` (Shared Components)
- Radix UI wrappers (Button, Dialog, Badge, etc.)
- Form components (Input, Select, Label)
- Follows design system from `.github/instructions/design.instructions.md`

### Hooks (`/src/hooks/`)

#### `use-leads.ts`
- React Query hooks for lead CRUD
- `useLeads()` - Paginated lead fetching
- `useLeadStats()` - Dashboard statistics
- `useCreateLead()` - Mutation for adding leads

#### `use-subscription.ts`
- `useUserActiveSubscription()` - Fetches user's plan
- `useUpgradeSubscription()` - Mutation for plan changes

#### `use-auth.ts`
- `useAuth()` - Returns current user and auth state
- Wrapper around Supabase auth

---

## 🚀 Development Setup

### Prerequisites
- Node.js 20+
- pnpm 10.15.1+
- Supabase CLI
- Stripe CLI (for webhook testing)

### Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Apify
APIFY_TOKEN=your_apify_token

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Google OAuth (for Sheets export)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Admin
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Database Setup

```bash
# Initialize Supabase locally
supabase init

# Run migrations
supabase db reset

# Start Supabase services
supabase start
```

### Stripe Webhook Testing

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🌐 Deployment

### Vercel Deployment

**Main Branch Auto-Deploy:**
- Push to `main` branch triggers automatic deployment
- Vercel builds with Turbopack
- Environment variables configured in Vercel dashboard

**Manual Deploy:**
```bash
pnpm build
vercel --prod
```

### Supabase Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy enrich-job
```

### Cron Jobs Setup

Configure in Supabase Dashboard:
- `enrich-job`: Every 1 minute
- `proxy-heal-check`: Every 15 minutes

---

## 📝 Important Notes

### Design System
- Follows `.github/instructions/design.instructions.md`
- Stripe-inspired UI (clean, trustworthy, consumer-friendly)
- Uses Tailwind CSS with custom Ultracite utilities
- Indigo/Purple primary colors

### Code Quality
- TypeScript strict mode enabled
- Biome for linting and formatting (config in `biome.json`)
- React Query for data fetching (no unnecessary re-renders)
- Zustand for local state management (minimal usage)

### Security
- Row-level security (RLS) enabled on all Supabase tables
- API routes validate authentication before operations
- Stripe webhook signature verification
- Proxy credentials encrypted in database

### Scalability Considerations
- Proxy rotation prevents IP bans at scale
- Background job processing prevents API rate limits
- Pagination on all large datasets
- Efficient database queries with proper indexing

### Admin Features
- Admin panel accessible at `/admin/dashboard`
- Manage proxies, view logs, moderate leads
- Admin emails configured via `NEXT_PUBLIC_ADMIN_EMAILS`
- Separate from user dashboard

### Known Limitations
- Enrichment is queued (not instant) due to Claude API rate limits
- Proxy rotation requires manual proxy addition
- Google Sheets export requires user OAuth consent
- Apify actors may have usage limits on free tier

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe API**: https://stripe.com/docs/api
- **Anthropic Claude**: https://docs.anthropic.com/claude/reference
- **Apify Actors**: https://apify.com/store
- **Next.js 15**: https://nextjs.org/docs

---

## 🤝 Support & Maintenance

For questions or issues, check:
1. README.md for basic setup
2. This document for architecture understanding
3. Code comments in service files
4. Supabase logs for runtime errors
5. Vercel logs for deployment issues

**Project Owner**: vanntrong (GitHub: @vanntrong)
