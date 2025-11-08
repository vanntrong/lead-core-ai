# Implementation Tasks

## 1. Configuration & Setup

- [ ] 1.1 Configure Google OAuth provider in Supabase Dashboard
  - Navigate to Authentication > Providers > Google
  - Enable Google provider
  - Add Client ID from environment variable
  - Add Client Secret from Google Cloud Console
- [ ] 1.2 Configure authorized redirect URIs in Supabase
  - Development: `http://localhost:3000/auth/callback`
  - Staging: `https://staging.leadcoreai.com/auth/callback` (if exists)
  - Production: `https://leadcoreai.com/auth/callback`
- [ ] 1.3 Update Google Cloud Console OAuth 2.0 Client
  - Add authorized JavaScript origins (localhost, production domain)
  - Add authorized redirect URIs matching Supabase configuration
  - Verify OAuth consent screen is configured
  - Confirm scopes include: email, profile, openid
- [ ] 1.4 Verify environment variables
  - Confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` exists in .env.local
  - Add `GOOGLE_CLIENT_SECRET` if not managed by Supabase
  - Update .env.example with OAuth-related variables
- [ ] 1.5 Test OAuth configuration in Supabase dashboard
  - Use "Test Connection" feature if available
  - Verify no configuration errors

## 2. Backend Implementation

- [x] 2.1 Create OAuth callback route
  - Create `src/app/auth/callback/route.ts`
  - Implement GET handler for OAuth redirect
  - Exchange authorization code for session using `exchangeCodeForSession`
  - Handle error cases (missing code, exchange failure)
  - Redirect to dashboard on success, login on failure
- [x] 2.2 Add Google OAuth method to AuthService
  - Open `src/services/auth.service.ts`
  - Add `signInWithGoogle()` method
  - Use `supabase.auth.signInWithOAuth({ provider: "google" })`
  - Configure redirect URL and query parameters
  - Return OAuth URL or handle redirect
- [ ] 2.3 Handle OAuth user profile data
  - Verify user metadata is populated from Google profile
  - Test that `full_name`, `avatar_url`, and `email` are stored
  - Ensure email is marked as verified for OAuth users
- [ ] 2.4 Test foreign key relationships
  - Verify OAuth users can create leads (user_id foreign key)
  - Verify OAuth users can create invoices
  - Test RLS policies work with OAuth-created user IDs
- [x] 2.5 Add error logging for OAuth failures
  - Log OAuth errors with Supabase error codes
  - Include user-friendly error messages
  - Add monitoring for OAuth failure rate

## 3. Frontend Hooks & State Management

- [x] 3.1 Create `useGoogleOAuth` hook
  - Open `src/hooks/use-auth.ts`
  - Add `useGoogleOAuth` hook with `signInWithGoogle` method
  - Implement loading state management
  - Implement error state management
  - Add success redirect logic
- [x] 3.2 Add OAuth error handling in hook
  - Handle timeout errors
  - Handle permission denial errors
  - Handle configuration errors
  - Display user-friendly error messages via toast
- [x] 3.3 Export `useGoogleOAuth` from hooks
  - Ensure hook is exported and importable
  - Update any hook barrel exports

## 4. UI Implementation - Login Page

- [x] 4.1 Add Google OAuth button to login page
  - Open `src/app/login/page.tsx`
  - Import `useGoogleOAuth` hook
  - Add "Continue with Google" button above login form
  - Include Google logo icon in button
  - Apply existing design system styles (Ultracite + Tailwind)
- [x] 4.2 Add visual divider between OAuth and form
  - Add horizontal line with "Or continue with email" text
  - Match styling from existing design patterns
- [x] 4.3 Implement button click handler
  - Call `signInWithGoogle()` from hook on button click
  - Show loading state on button while OAuth initiates
  - Disable button during loading
- [x] 4.4 Handle OAuth errors on login page
  - Display error alert if OAuth fails
  - Parse URL error parameter from callback redirect
  - Show appropriate error message based on error type
- [ ] 4.5 Test login page responsive design
  - Verify OAuth button displays correctly on mobile
  - Test tablet and desktop layouts
  - Ensure accessibility (keyboard navigation, screen readers)

## 5. UI Implementation - Signup Page

- [x] 5.1 Add Google OAuth button to signup page
  - Open `src/app/signup/page.tsx`
  - Import `useGoogleOAuth` hook
  - Add "Sign up with Google" button above signup form
  - Include Google logo icon in button
  - Apply consistent styling with login page
- [x] 5.2 Add visual divider between OAuth and form
  - Add horizontal line with "Or sign up with email" text
  - Match styling from login page
- [x] 5.3 Implement button click handler
  - Call `signInWithGoogle()` from hook on button click
  - Show loading state on button while OAuth initiates
  - Disable button during loading
- [x] 5.4 Handle OAuth errors on signup page
  - Display error alert if OAuth fails
  - Parse URL error parameter from callback redirect
  - Show appropriate error message based on error type
- [ ] 5.5 Test signup page responsive design
  - Verify OAuth button displays correctly on mobile
  - Test tablet and desktop layouts
  - Ensure accessibility (keyboard navigation, screen readers)

## 6. OAuth Callback Implementation

- [x] 6.1 Implement callback route logic
  - Extract `code` parameter from URL
  - Extract `next` parameter for redirect (default: `/dashboard`)
  - Extract `error` parameter if OAuth failed
- [x] 6.2 Handle successful OAuth callback
  - Call `supabase.auth.exchangeCodeForSession(code)`
  - Create and store session
  - Check if user is admin via `getAdminEmails()`
  - Redirect admin to `/admin/dashboard/scraper-logs`
  - Redirect regular user to `/dashboard`
- [x] 6.3 Handle failed OAuth callback
  - Log error details for debugging
  - Redirect to `/login?error=oauth_failed`
  - Pass error type in URL parameter
- [x] 6.4 Handle edge cases
  - Missing code parameter → redirect to login with error
  - Invalid or expired code → redirect to login with error
  - Session exchange timeout → redirect to login with error

## 7. Testing & Validation

### Manual Testing
- [ ] 7.1 Test new user signup with Google OAuth
  - Click "Sign up with Google" on signup page
  - Complete Google OAuth consent
  - Verify redirect to dashboard
  - Verify user created in Supabase auth.users table
  - Verify user metadata populated (name, email, avatar)
- [ ] 7.2 Test existing user login with Google OAuth
  - Create user with email/password first
  - Click "Continue with Google" with same email
  - Verify account linking works
  - Verify redirect to dashboard
  - Verify session is active
- [ ] 7.3 Test OAuth flow cancellation
  - Click "Continue with Google"
  - Cancel on Google consent screen
  - Verify redirect to login page
  - Verify error message displayed
  - Verify no session created
- [ ] 7.4 Test OAuth permission denial
  - Click "Continue with Google"
  - Deny email or profile permissions
  - Verify redirect to login with error
  - Verify error message explains permission required
- [ ] 7.5 Test OAuth with multiple Google accounts
  - Click "Continue with Google"
  - Switch Google accounts during OAuth
  - Verify correct account is used
  - Verify session matches selected account
- [ ] 7.6 Test session persistence after OAuth login
  - Login with Google OAuth
  - Close browser and reopen
  - Verify session persists
  - Verify user remains logged in
- [ ] 7.7 Test logout after OAuth login
  - Login with Google OAuth
  - Click logout button
  - Verify redirect to login page
  - Verify session destroyed
  - Verify protected routes redirect to login

### Cross-Browser Testing
- [ ] 7.8 Test OAuth in Chrome
- [ ] 7.9 Test OAuth in Firefox
- [ ] 7.10 Test OAuth in Safari
- [ ] 7.11 Test OAuth in Edge
- [ ] 7.12 Test OAuth on mobile Safari (iOS)
- [ ] 7.13 Test OAuth on mobile Chrome (Android)

### Error Scenario Testing
- [ ] 7.14 Test with invalid Google OAuth configuration
  - Temporarily break OAuth config in Supabase
  - Verify user-friendly error message
  - Verify error is logged
- [ ] 7.15 Test OAuth timeout
  - Delay OAuth response (network throttling)
  - Verify timeout error handling
  - Verify user can retry
- [ ] 7.16 Test OAuth with unverified email (edge case)
  - If possible, test with unverified Google account
  - Verify behavior matches design decisions

### Integration Testing
- [ ] 7.17 Verify OAuth user can create leads
  - Login with Google OAuth
  - Navigate to lead creation
  - Create a lead
  - Verify lead.user_id foreign key works
- [ ] 7.18 Verify OAuth user can access subscriptions
  - Login with Google OAuth
  - Navigate to pricing/checkout
  - Verify Stripe integration works
  - Verify invoice.user_id foreign key works
- [ ] 7.19 Verify RLS policies work for OAuth users
  - Create lead with OAuth user A
  - Login with OAuth user B
  - Verify user B cannot see user A's leads
- [ ] 7.20 Verify admin detection works for OAuth users
  - Add OAuth email to `NEXT_PUBLIC_ADMIN_EMAILS`
  - Login with that Google account
  - Verify redirect to admin dashboard
  - Verify admin UI is accessible

## 8. Code Quality & Linting

- [x] 8.1 Run Biome linter on modified files
  - `pnpm biome check src/app/login/page.tsx`
  - `pnpm biome check src/app/signup/page.tsx`
  - `pnpm biome check src/app/auth/callback/route.ts`
  - `pnpm biome check src/services/auth.service.ts`
  - `pnpm biome check src/hooks/use-auth.ts`
- [x] 8.2 Fix any linting errors
- [x] 8.3 Run Biome formatter
  - `pnpm biome format --write src/`
- [x] 8.4 Check for TypeScript errors
  - `pnpm tsc --noEmit`
  - Fix any type errors
- [x] 8.5 Verify no unused imports
- [x] 8.6 Verify proper error handling (no unhandled promises)

## 9. Documentation

- [ ] 9.1 Update README.md
  - Add OAuth setup instructions
  - Document Google Cloud Console configuration steps
  - Document Supabase configuration steps
- [ ] 9.2 Update .env.example
  - Add comments for OAuth-related variables
  - Include example values
- [ ] 9.3 Document OAuth error codes
  - Create error code reference document
  - List common OAuth errors and solutions
- [ ] 9.4 Update PROJECT_OVERVIEW.md
  - Add Google OAuth to authentication section
  - Document OAuth flow architecture
- [ ] 9.5 Add inline code comments
  - Document complex OAuth logic
  - Explain callback handling
  - Document security considerations

## 10. Security Review

- [ ] 10.1 Verify PKCE flow is enabled
  - Confirm Supabase uses PKCE by default
  - Test authorization code exchange
- [ ] 10.2 Verify state parameter is used
  - Confirm CSRF protection is active
  - Test state parameter validation
- [ ] 10.3 Verify HTTP-only cookies
  - Inspect session storage mechanism
  - Confirm tokens not in localStorage
- [ ] 10.4 Review redirect URI validation
  - Confirm only whitelisted URIs are allowed
  - Test invalid redirect URI handling
- [ ] 10.5 Review error message security
  - Ensure no sensitive data in error messages
  - Verify stack traces not exposed to users
- [ ] 10.6 Test account linking security
  - Verify only verified emails can link accounts
  - Test unverified email linking (should fail)

## 11. Monitoring & Observability

- [ ] 11.1 Add OAuth success/failure logging
  - Log successful OAuth logins with user ID
  - Log failed OAuth attempts with error codes
  - Do not log sensitive user data
- [ ] 11.2 Set up OAuth error alerting
  - Configure alerts for high OAuth failure rate
  - Monitor Google service availability
- [ ] 11.3 Add OAuth analytics tracking
  - Track OAuth button clicks
  - Track OAuth completion rate
  - Track OAuth vs email/password usage
- [ ] 11.4 Document monitoring dashboard
  - List key metrics to monitor
  - Document alert thresholds

## 12. Deployment

- [ ] 12.1 Deploy to staging environment
  - Push code to staging branch
  - Verify deployment successful
  - Run smoke tests in staging
- [ ] 12.2 Test OAuth in staging environment
  - Complete full OAuth flows
  - Verify callback URLs work in staging
  - Test error scenarios
- [ ] 12.3 Update production Google OAuth config
  - Add production redirect URI to Google Cloud Console
  - Add production redirect URI to Supabase
  - Verify production domain is authorized
- [ ] 12.4 Deploy to production
  - Push code to main branch
  - Verify deployment successful
  - Monitor error logs during rollout
- [ ] 12.5 Verify production OAuth works
  - Test OAuth login in production
  - Verify callback redirect works
  - Monitor OAuth success rate
- [ ] 12.6 Announce OAuth feature
  - Notify users via email (if applicable)
  - Update marketing site
  - Update onboarding documentation

## 13. Post-Deployment Validation

- [ ] 13.1 Monitor OAuth adoption rate
  - Track percentage of logins using OAuth
  - Compare signup completion rates
- [ ] 13.2 Monitor OAuth error rate
  - Watch for spikes in OAuth failures
  - Investigate any configuration issues
- [ ] 13.3 Collect user feedback
  - Monitor support tickets related to OAuth
  - Gather user satisfaction data
- [ ] 13.4 Review analytics data
  - Analyze OAuth funnel drop-off points
  - Identify UX improvements
- [ ] 13.5 Document lessons learned
  - Record any issues encountered
  - Document solutions and workarounds

## 14. Archive Change Proposal

- [ ] 14.1 Verify all tasks completed
  - Ensure every checkbox is marked
  - Confirm all requirements are implemented
- [ ] 14.2 Update OpenSpec specs
  - Move authentication capability to openspec/specs/
  - Remove ADDED/MODIFIED markers
  - Make spec reflect current state
- [ ] 14.3 Archive change proposal
  - Run `openspec archive add-google-oauth-login --yes`
  - Verify change moved to archive/
  - Confirm validation passes

## Dependencies & Blockers

### External Dependencies
- Google Cloud Console access (for OAuth credential management)
- Supabase Dashboard access (for provider configuration)
- Production domain DNS must resolve (for production OAuth testing)

### Internal Dependencies
- No code dependencies on other features
- Existing `authService` must remain functional
- Existing session management must remain unchanged

### Potential Blockers
- Google OAuth credentials not yet created → Create in Google Cloud Console
- Supabase OAuth provider disabled → Enable in Supabase Dashboard
- Production domain not configured → Add to Google/Supabase allowed URIs
- Firewall blocking OAuth callback → Configure network rules
