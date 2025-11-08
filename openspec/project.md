# Project Context

## Purpose

**LeadCore AI** is a SaaS platform that automates B2B lead generation by scraping e-commerce platforms (Shopify, WooCommerce, Etsy) and B2B software directories (G2). The platform enriches scraped data using AI (Claude by Anthropic), verifies email addresses, scores leads, and allows users to export qualified leads to CSV, Google Sheets, or via webhooks (Zapier/GHL).

**Target Audience**: Business owners, sales teams, marketing agencies, and logistics managers looking for qualified leads from specific e-commerce and SaaS platforms.

**Core Value Proposition**: Transform a URL into a fully qualified lead record containing scraped metadata, AI-generated business summaries, verified email status, and quality scores - all export-ready for CRMs and marketing tools.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 with App Router (React 19.1.0)
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 4 with Ultracite design system
- **UI Components**: Radix UI primitives (Alert Dialog, Dropdown, Select, Tabs, etc.)
- **State Management**: Zustand 5.0.8
- **Data Fetching**: TanStack React Query v5.86.0
- **Forms**: React Hook Form 7.62.0 with Zod 4.1.5 validation
- **Animations**: tw-animate-css 1.3.8
- **Progress Bars**: @bprogress/next 3.2.12

### Backend
- **Runtime**: Node.js 20+ with Next.js API Routes
- **Database**: Supabase PostgreSQL with Row-Level Security
- **Authentication**: Supabase Auth (email/password + Google OAuth via @react-oauth/google)
- **Storage**: Supabase Storage for file uploads
- **Edge Functions**: Supabase Functions (Deno runtime) for background jobs

### External Services
- **AI/ML**: Anthropic Claude 3.7 Sonnet (@anthropic-ai/sdk 0.62.0) for lead enrichment
- **Scraping**: Cheerio 1.1.2 (direct HTTP scraping) + Apify 3.4.5 actors (specialized scrapers)
- **Email Verification**: Apify Email Verifier actor
- **Payments**: Stripe 18.5.0 (@stripe/stripe-js 7.9.0) for subscriptions and invoicing
- **Email**: Mailgun.js 12.1.1 for transactional emails
- **OAuth**: Google OAuth for Sheets export integration

### Development Tools
- **Code Quality**: Biome 2.2.2 (linter + formatter)
- **Package Manager**: pnpm 10.15.1
- **Build**: Next.js with Turbopack (--turbopack flag)
- **Local Dev**: Supabase CLI 2.40.6
- **Type Safety**: TypeScript with strict null checks

## Project Conventions

### Code Style

**Formatting (Biome)**:
- **Indentation**: Tabs (not spaces)
- **Line Width**: Default (80 characters)
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: ES5 style

**Naming Conventions**:
- **Files**: kebab-case for all files (`lead-scoring.service.ts`, `use-leads.ts`)
- **Components**: PascalCase (`DashboardLayout`, `PricingPlans`)
- **Services**: PascalCase classes with camelCase methods (`LeadService`, `createLead()`)
- **Hooks**: camelCase with `use` prefix (`useLeads`, `useSubscription`)
- **Types/Interfaces**: PascalCase (`Lead`, `LeadFilters`, `PaginatedLeadResponse`)
- **Constants**: SCREAMING_SNAKE_CASE or camelCase objects (`APIFY_BASE_URL`, `pricingPlans`)

**Imports**:
- Use path alias `@/` for all internal imports (configured in tsconfig.json)
- Order: external packages → internal modules → types → styles
- No namespace imports unless necessary (performance rule)

**Linter Rules** (Biome):
- `noUnusedImports`: error
- `noUnusedVariables`: error
- `useExhaustiveDependencies`: warn
- `noConsole`: off (allowed for logging)
- `noExplicitAny`: off (use when necessary, but prefer proper typing)
- `useConst`: error
- `useTemplate`: error (prefer template literals over concatenation)

### Architecture Patterns

**Service Layer Pattern**:
- All business logic lives in `/src/services/` directory
- Services are classes with static or instance methods
- Services handle Supabase queries, external API calls, and data transformation
- Example: `LeadService`, `SubscriptionService`, `ApifyService`

**API Route Structure**:
- Next.js API routes in `/src/app/api/`
- Use HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`
- Validate request bodies with Zod schemas
- Always check authentication via Supabase client
- Return consistent JSON responses with error handling

**React Query Hooks**:
- Custom hooks in `/src/hooks/` use TanStack Query
- Use `useQuery` for data fetching, `useMutation` for writes
- Implement optimistic updates and cache invalidation
- Example: `useLeads()`, `useSubscription()`

**Component Organization**:
- Page components in `/src/app/[route]/page.tsx`
- Shared components in `/src/components/`
- Feature-specific components grouped by domain (`/components/leads/`, `/components/affiliates/`)
- UI primitives in `/components/ui/` (Radix-based, Ultracite-styled)

**Database Access**:
- Always use `createClient()` from `@/lib/supabase/server` in API routes
- Use `createBrowserClient()` from `@/lib/supabase/client` in client components
- Never expose service role key to client
- Leverage Row-Level Security (RLS) policies for data isolation

**Error Handling**:
- Services return `{ success: boolean, data?: T, error?: string }`
- API routes catch errors and return appropriate HTTP status codes
- Frontend uses React Query's error states
- Log errors to `scraper_logs` or similar admin tables for debugging

### Testing Strategy

**Current State**: No automated tests implemented yet

**Future Strategy** (to be implemented):
- Unit tests for service layer functions (Jest/Vitest)
- Integration tests for API routes
- E2E tests for critical user flows (Playwright)
- Type safety as primary validation mechanism (strict TypeScript)

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code
- Feature branches: `feature/[name]` or direct commits to main for small changes
- No formal PR process mentioned (likely solo or small team)

**Commit Conventions**:
- Not strictly enforced (no commitlint/husky detected)
- Use descriptive commit messages following conventional commits style recommended

## Domain Context

**Lead Generation Pipeline**:
1. **Scraping**: Extract business data from URLs (Shopify, WooCommerce, Etsy, G2)
2. **Enrichment**: AI generates company summaries and business type classifications
3. **Verification**: Email addresses validated for deliverability
4. **Scoring**: Lead quality score (0-100) based on data completeness and verification
5. **Export**: CSV, Google Sheets, Zapier webhooks, GHL integration

**Lead Lifecycle States**:
- `pending`: Just created, awaiting scrape
- `scraped`: Data extracted successfully
- `enriching`: AI enrichment in progress
- `enriched`: Full data pipeline completed
- `error`: General failure
- `scrap_failed`: Scraping specifically failed

**Scoring Algorithm** (weighted system):
- Email verification: 40 points (verified), 0 (invalid/unknown)
- Scrap info completeness: 30 points max (title, description, emails)
- Enrichment quality: 20 points max (summary, title_guess length)
- Location data: 10 points max (city, state, country)

**Subscription Model**:
- **Trial**: 25 leads, limited sources
- **Basic**: 250 leads/month, Shopify + WooCommerce, CSV export
- **Pro**: 2,500 leads/month, all sources, all export options
- **Unlimited**: No lead limits, all features, priority support
- Usage tracked via `usage_limits` table (current_leads vs max_leads)

**Proxy System**:
- Custom proxy rotation for anti-bot measures
- Proxies stored in `proxies` table with health status
- Automatically marks proxies as banned on SSL/timeout errors
- Health checks logged in `proxy_heal_check_logs`

## Important Constraints

**Rate Limits**:
- Anthropic API: Respect tier limits for Claude 3.7 Sonnet
- Apify: Varies by actor (Etsy, G2, Email Verifier)
- Supabase: Free tier has request limits, consider upgrading for production
- Stripe: Webhook signature validation required

**Data Privacy**:
- Scraped data contains PII (emails, business info)
- Must comply with GDPR/CCPA if targeting EU/CA users
- Implement data retention policies (future)
- Users own their lead data (RLS enforced by user_id)

**Performance**:
- Scraping can be slow (5-30 seconds per lead)
- AI enrichment is asynchronous (background job via Supabase Functions)
- Use background processing for bulk operations
- Proxy rotation adds latency

**Cost Optimization**:
- Claude API calls are expensive (optimize prompts)
- Apify credits consumed per actor run
- Proxy service has monthly costs
- Monitor Supabase storage usage for large datasets

**Security**:
- Never expose Supabase service role key
- Validate all user inputs (Zod schemas)
- Implement rate limiting on API routes (future)
- Secure Stripe webhook endpoint with signature verification

## External Dependencies

**Critical Services**:
- **Anthropic API**: AI enrichment (Claude 3.7 Sonnet) - Outage blocks enrichment pipeline
- **Apify Platform**: Specialized scrapers (Etsy, G2) - Downtime affects those sources
- **Supabase**: Database, auth, storage, functions - Single point of failure
- **Stripe**: Payment processing - Outage blocks subscriptions/upgrades
- **Mailgun**: Transactional emails - Affects user notifications

**Optional Services**:
- **Google OAuth**: Sheets export only - Users can still export CSV
- **Proxy Providers**: Rotating proxies for scraping - Fallback to direct requests if needed

**API Keys Required**:
- `ANTHROPIC_API_KEY`: Claude API access
- `APIFY_API_TOKEN`: Apify actor execution
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`: Payment processing
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Database access
- `MAILGUN_API_KEY` + `MAILGUN_DOMAIN`: Email delivery
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth

**Third-Party Actor IDs** (Apify):
- Etsy Scraper: `axlymxp~etsy-shop-scraper`
- G2 Scraper: `omkar-cloud~g2-product-scraper`
- Email Verifier: `fatihtahta~email-verifier-free-to-use`

**Database Migrations**:
- Managed via Supabase CLI (`supabase/migrations/`)
- Apply with `supabase db push`
- Version controlled in Git
