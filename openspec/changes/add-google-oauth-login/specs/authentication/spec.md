# Authentication Capability

## MODIFIED Requirements

### Requirement: User Authentication via Email and Password
The system SHALL authenticate users using email and password credentials through Supabase Auth.

#### Scenario: User signs in with valid email and password
- **WHEN** a user submits the login form with valid email and password
- **THEN** the system authenticates via `authService.signIn()`
- **AND** a session is created and stored in Supabase Auth
- **AND** the user is redirected to `/dashboard` (or `/admin/dashboard/scraper-logs` for admins)

#### Scenario: User signs up with email, password, and profile data
- **WHEN** a user submits the signup form with email, password, first name, and last name
- **THEN** the system creates a new account via `authService.signUp()`
- **AND** user metadata includes `first_name` and `last_name`
- **AND** a confirmation email is sent
- **AND** the user is redirected to confirm email instruction page

#### Scenario: User signs in with incorrect credentials
- **WHEN** a user submits login form with invalid email or password
- **THEN** the system returns authentication error
- **AND** an error alert is displayed to the user
- **AND** no session is created

## ADDED Requirements

### Requirement: User Authentication via Google OAuth
The system SHALL authenticate users using Google OAuth 2.0 through Supabase Auth's Google provider.

#### Scenario: User clicks "Continue with Google" button on login page
- **WHEN** a user clicks the "Continue with Google" button
- **THEN** the system initiates OAuth flow via `authService.signInWithGoogle()`
- **AND** the user is redirected to Google's OAuth consent screen
- **AND** after Google authorization, user is redirected to `/auth/callback`
- **AND** the callback handler exchanges OAuth code for session
- **AND** the user is redirected to `/dashboard` (or `/admin/dashboard/scraper-logs` for admins)

#### Scenario: User clicks "Sign up with Google" button on signup page
- **WHEN** a user clicks the "Sign up with Google" button
- **THEN** the system initiates OAuth flow via `authService.signInWithGoogle()`
- **AND** if user doesn't have an existing account, a new account is created
- **AND** user metadata is populated from Google profile (name, email, avatar)
- **AND** the user is redirected to `/dashboard`
- **AND** no email confirmation is required (Google email is pre-verified)

#### Scenario: Existing user signs in with Google OAuth
- **WHEN** a user with an existing account clicks "Continue with Google"
- **THEN** the system authenticates the user via OAuth
- **AND** Supabase links the OAuth identity to existing account if emails match
- **AND** the user is signed in and redirected to `/dashboard`

#### Scenario: Google OAuth flow fails or is cancelled
- **WHEN** Google OAuth authorization fails or user cancels
- **THEN** the user is redirected back to login page
- **AND** an error message is displayed explaining the failure
- **AND** no session is created

#### Scenario: User denies required Google permissions
- **WHEN** user denies email or profile permissions during OAuth
- **THEN** the authentication fails
- **AND** user is redirected to login with error message
- **AND** the system logs the permission denial for debugging

### Requirement: OAuth Callback Handler
The system SHALL provide an OAuth callback route at `/auth/callback` that handles Google OAuth redirects.

#### Scenario: OAuth callback receives valid authorization code
- **WHEN** Google redirects to `/auth/callback` with authorization code
- **THEN** Supabase Auth exchanges code for access and refresh tokens
- **AND** a user session is created
- **AND** user is redirected to appropriate dashboard

#### Scenario: OAuth callback receives error from Google
- **WHEN** Google redirects to `/auth/callback` with error parameter
- **THEN** the system logs the error
- **AND** user is redirected to login page with error message
- **AND** no session is created

### Requirement: Google OAuth Button UI
The system SHALL display a "Continue with Google" button on login page and "Sign up with Google" button on signup page.

#### Scenario: User views login page
- **WHEN** user navigates to `/login`
- **THEN** page displays email/password form
- **AND** page displays "Continue with Google" button with Google logo
- **AND** button is styled consistently with existing design system

#### Scenario: User views signup page
- **WHEN** user navigates to `/signup`
- **THEN** page displays registration form
- **AND** page displays "Sign up with Google" button with Google logo
- **AND** a divider separates OAuth button from email/password form
- **AND** button is styled consistently with existing design system

### Requirement: OAuth Session Management
The system SHALL manage OAuth-created sessions identically to email/password sessions.

#### Scenario: User with OAuth session accesses protected route
- **WHEN** an OAuth-authenticated user navigates to `/dashboard`
- **THEN** the system validates the session via Supabase Auth
- **AND** RLS policies apply based on `auth.uid()`
- **AND** user data is fetched correctly

#### Scenario: User with OAuth session signs out
- **WHEN** an OAuth-authenticated user clicks logout
- **THEN** the system calls `authService.signOut()`
- **AND** the session is destroyed
- **AND** user is redirected to `/login`
- **AND** subsequent requests are unauthenticated

### Requirement: OAuth User Profile Data
The system SHALL populate user metadata from Google OAuth profile on first login.

#### Scenario: New user signs up via Google OAuth
- **WHEN** a new user completes Google OAuth flow
- **THEN** Supabase Auth creates user record in `auth.users`
- **AND** user metadata includes `first_name`, `last_name`, `email`, and `avatar_url` from Google
- **AND** user's email is automatically marked as verified
- **AND** foreign key relationships (leads, invoices) work correctly with new user ID

#### Scenario: Google profile is missing first or last name
- **WHEN** Google OAuth returns profile without full name
- **THEN** the system attempts to parse display name into first/last name
- **OR** falls back to email username as first name
- **AND** user can update profile information in account settings

### Requirement: OAuth Error Handling
The system SHALL provide clear error messages for OAuth failures.

#### Scenario: OAuth flow times out
- **WHEN** OAuth authorization takes longer than 5 minutes
- **THEN** the session creation fails
- **AND** user is redirected to login with "Authentication timeout" error
- **AND** user can retry OAuth flow

#### Scenario: Google service is unavailable
- **WHEN** Google OAuth endpoints return 5xx errors
- **THEN** the system displays "Google login unavailable" error
- **AND** user is advised to use email/password login
- **AND** error is logged for monitoring

#### Scenario: Supabase OAuth configuration is invalid
- **WHEN** Supabase cannot complete OAuth due to misconfiguration
- **THEN** the system logs configuration error details
- **AND** user sees generic "Authentication failed" message
- **AND** error includes Supabase error code for debugging
