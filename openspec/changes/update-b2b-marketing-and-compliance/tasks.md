# Implementation Tasks

## 1. Contact & Support Implementation

- [x] 1.1 Verify `/contact` page and `ContactForm.tsx` functionality
- [ ] 1.2 Ensure contact API route sends to `support@leadcoreai.com`
- [x] 1.3 Update header navigation to include "Contact" link
- [x] 1.4 Update footer to display `support@leadcoreai.com` as clickable mailto link
- [x] 1.5 Add social media icons (X, LinkedIn, Email) to footer with links
- [x] 1.6 Update footer copyright line to "© 2025 LeadCore AI · support@leadcoreai.com · Powered by $TOWN"
- [ ] 1.7 Test contact form submission end-to-end
- [ ] 1.8 Test all footer links navigate correctly

## 2. Affiliate Program Implementation

- [x] 2.1 Add "Affiliate Program – Earn 30% Recurring" link to footer
- [x] 2.2 Configure Rewardful signup URL in environment variables or constants
- [x] 2.3 Verify `RewardfulScript` component is imported in checkout pages
- [ ] 2.4 Test Rewardful script loads on `/checkout` page
- [ ] 2.5 Test Rewardful script loads on `/checkout-success` page
- [ ] 2.6 Verify Rewardful is connected to Stripe account (check API keys)
- [ ] 2.7 Test affiliate conversion tracking with test referral link

## 3. Marketing Copy Updates

- [x] 3.1 Update homepage hero headline to "Live B2B lead generation made simple."
- [x] 3.2 Update homepage hero sub-headline to mention Google Places, NPI, FMCSA, G2, Capterra
- [x] 3.3 Update hero primary CTA to "Start for $97 →"
- [x] 3.4 Verify hero secondary CTA "Watch demo" works
- [x] 3.5 Update benefits bullets section with B2B-focused copy
- [x] 3.6 Update pricing card for Trial: "$7: 1 source (incl. Places / NPI / FMCSA), 25 leads, CSV export"
- [x] 3.7 Update pricing card for Basic: "$97: 1 active source / 100 leads/mo, CSV"
- [x] 3.8 Update pricing card for Pro: "$297: All sources / 500 leads/mo, CSV + Sheets"
- [x] 3.9 Update pricing card for Unlimited: "$497: All sources / unlimited, CSV + Sheets + Zapier/Webhooks, priority support"
- [x] 3.10 Create `/send` route with TownSend early access page
- [x] 3.11 Add "Send 150 Cold Emails" navigation item linking to `/send`
- [x] 3.12 Add "Request Early Access" button on `/send` page (mailto link)
- [ ] 3.13 Fix or remove dead "authors/features" button on homepage
- [ ] 3.14 Test all navigation links and CTAs

## 4. Legal & Compliance Implementation

- [x] 4.1 Create `CookieBanner.tsx` component in `src/components/ui/`
- [x] 4.2 Implement cookie consent logic with localStorage persistence
- [x] 4.3 Add cookie banner to `src/app/layout.tsx` or providers
- [x] 4.4 Add "Accept" button handler in cookie banner
- [x] 4.5 Add "Manage" button linking to `/privacy` in cookie banner
- [ ] 4.6 Verify cookie banner appears on first visit
- [ ] 4.7 Verify cookie banner dismisses after accept
- [ ] 4.8 Verify cookie banner does not reappear for returning users
- [x] 4.9 Ensure `/privacy` page exists and includes cookie disclosure
- [x] 4.10 Ensure `/terms` page exists and is accessible
- [x] 4.11 Ensure `/legal` page exists and is accessible
- [x] 4.12 Ensure `/about` page exists and is accessible
- [x] 4.13 Ensure `/contact` page exists and is accessible
- [x] 4.14 Add all legal page links to footer (Privacy, Terms, Disclaimer, About, Contact)
- [ ] 4.15 Test all legal page links from footer

## 5. Testing & Validation

- [ ] 5.1 Smoke test all pages: homepage, contact, send, pricing, legal pages
- [ ] 5.2 Test contact form submission and email delivery
- [ ] 5.3 Test affiliate link clicks and tracking script initialization
- [ ] 5.4 Test cookie banner on multiple browsers
- [ ] 5.5 Validate all navigation links work correctly
- [ ] 5.6 Validate all footer links work correctly
- [ ] 5.7 Test responsive design on mobile and tablet
- [ ] 5.8 Run Biome linter/formatter on modified files
- [ ] 5.9 Check for TypeScript errors
- [ ] 5.10 Perform accessibility audit on new components

## 6. Documentation & Deployment

- [ ] 6.1 Update README or PROJECT_OVERVIEW if necessary
- [ ] 6.2 Document Rewardful affiliate program configuration
- [ ] 6.3 Commit changes with descriptive commit messages
- [ ] 6.4 Create pull request with reference to this proposal
- [ ] 6.5 Request code review
- [ ] 6.6 Deploy to staging environment
- [ ] 6.7 Test in staging environment
- [ ] 6.8 Deploy to production
- [ ] 6.9 Verify production deployment
- [ ] 6.10 Archive this change proposal after deployment
