# Proposal Summary: Update B2B Marketing and Compliance

## 📋 Overview

This proposal addresses the requirements to strengthen LeadCore AI's B2B positioning, improve support accessibility, promote the affiliate program, and ensure legal compliance.

## 📁 Proposal Location

`openspec/changes/update-b2b-marketing-and-compliance/`

## 🎯 Change Scope

### 4 Capabilities Affected

1. **contact-support** - New contact page, footer updates, social links
2. **affiliate-program** - Rewardful integration and promotion
3. **marketing-copy** - B2B-first messaging, pricing updates, TownSend nav
4. **legal-compliance** - Cookie banner, legal pages accessibility

### Key Files to Modify

- `src/app/page.tsx` - Hero headline, sub-headline, benefits, nav
- `src/components/footer.tsx` - Email, social icons, affiliate link, copyright
- `src/config/pricing-plans.ts` - Pricing descriptions
- `src/app/send/page.tsx` - **NEW** TownSend early access page
- `src/components/ui/cookie-banner.tsx` - **NEW** Cookie consent component
- `src/app/layout.tsx` - Integrate cookie banner
- `src/app/contact/page.tsx` - Verify existing implementation
- `src/components/rewardfull-script.tsx` - Verify checkout integration

## 📊 Requirements Summary

### Contact & Support (6 requirements)
- Contact page with form → `support@leadcoreai.com`
- Header & footer navigation links
- Footer support email display
- Social media icons (X, LinkedIn, Email)
- Footer copyright with $TOWN branding

### Affiliate Program (3 requirements)
- Footer link: "Affiliate Program – Earn 30% Recurring"
- Rewardful tracking script on checkout pages
- Rewardful + Stripe integration verification

### Marketing Copy (7 requirements)
- Hero headline: "Live B2B lead generation made simple."
- Hero sub: Mentions Google Places, NPI, FMCSA, G2, Capterra
- Hero CTAs: "Start for $97 →" + "Watch demo"
- Benefits bullets (B2B-focused)
- TownSend nav item → `/send` route
- Pricing card copy updates (Trial $7, Basic $97, Pro $297, Unlimited $497)
- Fix/remove dead "authors/features" button

### Legal Compliance (3 requirements)
- Cookie consent banner (Accept/Manage buttons)
- All legal pages linked in footer
- Legal pages exist: `/privacy`, `/terms`, `/legal`, `/about`, `/contact`

## ✅ Implementation Tasks

Total: 60 tasks across 6 phases

1. **Contact & Support** - 8 tasks
2. **Affiliate Program** - 7 tasks
3. **Marketing Copy** - 14 tasks
4. **Legal & Compliance** - 15 tasks
5. **Testing & Validation** - 10 tasks
6. **Documentation & Deployment** - 10 tasks

## 🔍 Validation Status

✅ Proposal structure validated:
- All scenarios use `#### Scenario:` format (37 scenarios total)
- All requirements use `### Requirement:` format (19 requirements total)
- Each requirement has at least one scenario
- Proper `## ADDED|MODIFIED|REMOVED Requirements` sections
- Tasks are ordered and checkboxed
- Proposal.md includes Why, What Changes, and Impact sections

## 🚀 Next Steps

1. **Review this proposal** - Ensure all requirements match expectations
2. **Get approval** - Do not start implementation until approved
3. **Execute tasks sequentially** - Follow tasks.md checklist
4. **Update task checkboxes** - Mark tasks complete as you go
5. **Archive after deployment** - Move to `changes/archive/` when done

## 📝 Notes

- The contact form and legal pages already exist but may need verification
- Rewardful script component exists but needs checkout integration check
- Pricing plans exist but need description updates to match B2B sources
- Cookie banner is a new component that needs creation
- TownSend `/send` route is new and needs full implementation
- Dead "authors/features" button needs investigation and fix/removal

## 📞 Support

For questions about this proposal:
- Email: `support@leadcoreai.com`
- Reference: `update-b2b-marketing-and-compliance`
