# Contact & Support Capability

## ADDED Requirements

### Requirement: Contact Page with Form Submission
The system SHALL provide a dedicated contact page at `/contact` with a form that allows users to submit inquiries directly to support.

#### Scenario: User submits contact form successfully
- **WHEN** a user fills out the contact form with valid name, email, and message
- **THEN** the form submits via API route to `support@leadcoreai.com`
- **AND** the user receives confirmation feedback
- **AND** an email notification is sent to support

#### Scenario: User submits contact form with invalid email
- **WHEN** a user fills out the contact form with an invalid email format
- **THEN** the form displays a validation error
- **AND** the submission is blocked until the email is valid

### Requirement: Contact Page Accessibility from Navigation
The system SHALL include a "Contact" link in the main header navigation and footer that routes to `/contact`.

#### Scenario: User clicks Contact in header
- **WHEN** a user clicks the "Contact" link in the header navigation
- **THEN** the user is navigated to `/contact` page

#### Scenario: User clicks Contact in footer
- **WHEN** a user clicks the "Contact" link in the footer
- **THEN** the user is navigated to `/contact` page

### Requirement: Footer Support Email Display
The footer SHALL display `support@leadcoreai.com` as a clickable mailto link.

#### Scenario: User clicks support email in footer
- **WHEN** a user clicks the `support@leadcoreai.com` link in the footer
- **THEN** the user's default email client opens with the recipient pre-filled

### Requirement: Footer Social Links
The footer SHALL include icon links for X (Twitter), LinkedIn, and Email.

#### Scenario: User clicks social icon in footer
- **WHEN** a user clicks a social media icon in the footer
- **THEN** the user is navigated to the appropriate social profile in a new tab

### Requirement: Footer Copyright and Branding
The footer SHALL display "© 2025 LeadCore AI · support@leadcoreai.com · Powered by $TOWN" with appropriate formatting and links.

#### Scenario: User views footer
- **WHEN** a user scrolls to the footer
- **THEN** the copyright notice, support email, and $TOWN branding are visible
- **AND** $TOWN is a clickable link to https://www.emailtown.io
