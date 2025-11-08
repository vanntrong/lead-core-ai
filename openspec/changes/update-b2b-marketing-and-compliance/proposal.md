# Update B2B Marketing and Compliance

## Why

LeadCore AI needs to strengthen its B2B positioning, provide clear support channels, incentivize affiliates, and ensure legal compliance with cookie regulations. Currently, the platform lacks a dedicated contact page, the Rewardful affiliate program isn't prominently featured, the hero copy doesn't emphasize B2B sources (Google Places, NPI, FMCSA), and there's no cookie consent banner.

## What Changes

- Add dedicated `/contact` page with form submitting to `support@leadcoreai.com`
- Update footer to include social links (X, LinkedIn, Email), affiliate program link, and `support@leadcoreai.com` email
- Add Rewardful affiliate program link in footer: "Affiliate Program – Earn 30% Recurring"
- Verify Rewardful tracking script loads on checkout pages
- Update hero headline to "Live B2B lead generation made simple"
- Update hero sub-headline to highlight Google Places, NPI, FMCSA, G2, and Capterra
- Update benefits bullets to emphasize B2B-first positioning
- Update pricing card descriptions to match B2B sources ($7 Trial, $97 Basic, $297 Pro, $497 Unlimited)
- Add new navigation item "Send 150 Cold Emails" → `/send` route with TownSend early access copy
- Fix or remove dead "authors/features" button link
- Add cookie consent banner with "Accept" and "Manage" (link to `/privacy`) buttons
- Ensure all legal pages (`/privacy`, `/terms`, `/legal`, `/about`, `/contact`) exist and are linked in footer

## Impact

- **Affected specs**: `contact-support`, `affiliate-program`, `marketing-copy`, `legal-compliance`
- **Affected code**: 
  - `src/app/page.tsx` (hero, benefits, nav)
  - `src/components/footer.tsx` (links, email, social, affiliate)
  - `src/app/contact/page.tsx` and `ContactForm.tsx` (already exist, may need verification)
  - `src/app/send/page.tsx` (new route)
  - `src/config/pricing-plans.ts` (descriptions update)
  - `src/components/ui/cookie-banner.tsx` (new component)
  - `src/app/layout.tsx` or providers (integrate cookie banner)
  - `src/components/rewardfull-script.tsx` (verify checkout integration)
