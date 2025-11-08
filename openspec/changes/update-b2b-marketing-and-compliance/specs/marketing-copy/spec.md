# Marketing Copy Capability

## MODIFIED Requirements

### Requirement: Hero Section Headline
The homepage hero section SHALL display the headline "Live B2B lead generation made simple."

#### Scenario: User visits homepage
- **WHEN** a user lands on the homepage
- **THEN** the main headline reads "Live B2B lead generation made simple."

### Requirement: Hero Section Sub-headline
The homepage hero section SHALL display a sub-headline emphasizing B2B data sources: "Find, enrich, and export verified business leads from Google Places, NPI, FMCSA, G2 & Capterra — in seconds."

#### Scenario: User reads hero sub-headline
- **WHEN** a user views the hero section
- **THEN** the sub-headline explicitly mentions Google Places, NPI, FMCSA, G2, and Capterra
- **AND** emphasizes speed ("in seconds")

### Requirement: Hero Call-to-Action Buttons
The homepage hero section SHALL include two CTA buttons: "Start for $97 →" (primary) and "Watch demo" (secondary).

#### Scenario: User clicks Start for $97 CTA
- **WHEN** a user clicks "Start for $97 →"
- **THEN** the user is navigated to `/signup` page

#### Scenario: User clicks Watch demo CTA
- **WHEN** a user clicks "Watch demo"
- **THEN** a demo dialog or video is displayed

### Requirement: Benefits Bullets Section
The homepage SHALL include a benefits section with four key B2B-focused bullets.

#### Scenario: User views benefits section
- **WHEN** a user scrolls to the benefits section
- **THEN** the following bullets are visible:
  - "Scrape B2B in seconds — Google Places (trades), NPI (clinics), FMCSA (trucking), plus Shopify / G2 / Capterra."
  - "Enrich with AI precision — Claude: ICP fit, tech stack, contact/title guess."
  - "Verify before you send — real-time email & domain checks."
  - "Export anywhere — CSV, Google Sheets (service account), Zapier/GHL."

## ADDED Requirements

### Requirement: Navigation Item for TownSend
The main navigation SHALL include a new menu item "Send 150 Cold Emails" that routes to `/send` and displays TownSend early access information.

#### Scenario: User clicks Send 150 Cold Emails nav item
- **WHEN** a user clicks "Send 150 Cold Emails" in the main navigation
- **THEN** the user is navigated to `/send` page

#### Scenario: User views TownSend page
- **WHEN** a user visits `/send`
- **THEN** the page displays copy explaining TownSend: "TownSend is our sending engine (150/day) with warm-up, rotation, and stop-on-reply. Coming soon — request early access."
- **AND** includes a "Request Early Access" button that opens `mailto:support@leadcoreai.com?subject=TownSend%20Early%20Access`

### Requirement: Pricing Card Copy Updates
The pricing cards SHALL reflect B2B-first positioning with updated descriptions.

#### Scenario: User views Trial pricing card
- **WHEN** a user views the Trial plan card
- **THEN** the description reads: "Trial $7: 1 source (incl. Places / NPI / FMCSA), 25 leads, CSV export."

#### Scenario: User views Basic pricing card
- **WHEN** a user views the Basic plan card
- **THEN** the description reads: "Basic $97: 1 active source / 100 leads/mo, CSV."

#### Scenario: User views Pro pricing card
- **WHEN** a user views the Pro plan card
- **THEN** the description reads: "Pro $297: All sources / 500 leads/mo, CSV + Sheets (or hide Sheets if not ready)."

#### Scenario: User views Unlimited pricing card
- **WHEN** a user views the Unlimited plan card
- **THEN** the description reads: "Unlimited $497: All sources / unlimited, CSV + Sheets + Zapier/Webhooks, priority support."

## REMOVED Requirements

### Requirement: Dead Authors/Features Button Link
The dead "authors/features" button SHALL be either linked to the Benefits section or removed entirely.

**Reason**: The button currently does nothing and creates a poor user experience.

**Migration**: Remove the button or add `href="#features"` to link to the Benefits section.

#### Scenario: Dead button is removed
- **WHEN** a user views the homepage
- **THEN** the "authors/features" button is no longer present

#### Scenario: Dead button is linked to Benefits section
- **WHEN** a user clicks the "authors/features" button
- **THEN** the page scrolls to the Benefits section
