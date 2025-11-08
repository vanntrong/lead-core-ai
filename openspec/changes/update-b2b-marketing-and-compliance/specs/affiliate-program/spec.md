# Affiliate Program Capability

## ADDED Requirements

### Requirement: Rewardful Footer Link
The footer SHALL include a prominent link "Affiliate Program – Earn 30% Recurring" that directs users to the Rewardful signup URL.

#### Scenario: User clicks affiliate program link
- **WHEN** a user clicks the "Affiliate Program – Earn 30% Recurring" link in the footer
- **THEN** the user is navigated to the Rewardful signup URL in a new tab

### Requirement: Rewardful Tracking Script on Checkout Pages
The system SHALL load the Rewardful tracking script on all checkout-related pages to ensure affiliate conversions are tracked.

#### Scenario: User visits checkout page
- **WHEN** a user navigates to any checkout page (`/checkout`, `/checkout-success`)
- **THEN** the Rewardful tracking script is loaded and initialized
- **AND** the script can capture referral tokens from URL parameters

#### Scenario: User completes purchase with referral token
- **WHEN** a referred user completes a purchase
- **THEN** the conversion is attributed to the referring affiliate via Rewardful

### Requirement: Rewardful Integration with Stripe
The Rewardful service SHALL be connected to the same Stripe account used for subscriptions to enable commission tracking on recurring payments.

#### Scenario: Affiliate earns commission on subscription
- **WHEN** a referred user subscribes to a paid plan
- **THEN** the affiliate earns 30% recurring commission on each payment
- **AND** the commission is tracked in Rewardful dashboard
