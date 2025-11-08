# Add Google OAuth Login

## Why

LeadCore AI currently only supports email/password authentication via Supabase Auth. Users expect modern authentication options including social login for faster onboarding and reduced friction. Google OAuth is the most widely adopted identity provider for B2B SaaS applications, and implementing it will:

- **Reduce signup friction**: Users can sign up/sign in with one click instead of creating and remembering passwords
- **Improve security**: Delegates authentication to Google's secure infrastructure, reducing password-related vulnerabilities
- **Increase conversion rates**: Studies show social login can increase signup completion by 20-40%
- **Enable SSO for enterprise**: Many businesses use Google Workspace, making Google OAuth a natural authentication path
- **Align with tech stack**: Project already uses `@react-oauth/google` for Google Sheets export; Supabase natively supports Google OAuth provider

## What Changes

### Frontend Changes
- Add "Continue with Google" button to login page (`/login`)
- Add "Sign up with Google" button to signup page (`/signup`)
- Implement Google OAuth flow using Supabase Auth's `signInWithOAuth` method
- Handle OAuth callback and redirect logic
- Add loading states and error handling for OAuth flow
- Update UI to match existing design system (Ultracite + Tailwind)

### Backend Changes
- Configure Google OAuth provider in Supabase project settings
- Set up OAuth redirect URLs in Google Cloud Console
- Add environment variables for Google OAuth client credentials (already exists: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)
- Ensure user profile creation triggers on first OAuth login
- Verify RLS policies work correctly with OAuth-created users

### Database Changes
- Verify `auth.users` table supports OAuth provider metadata
- Ensure foreign key relationships (`leads.user_id`, `invoices.user_id`, etc.) work with OAuth users
- Confirm user metadata fields (first_name, last_name) are populated from Google profile

### Service Layer Changes
- Add `signInWithGoogle()` method to `AuthService`
- Update `useSignIn` hook to support Google OAuth flow
- Create new `useGoogleOAuth` hook for login/signup pages
- Handle OAuth error states and edge cases (account exists, linking accounts)

## Impact

### Affected Specs
- **authentication** (MODIFIED): Add Google OAuth requirements alongside existing email/password auth

### Affected Code
- `src/services/auth.service.ts` - Add Google OAuth methods
- `src/hooks/use-auth.ts` - Add Google OAuth hooks
- `src/app/login/page.tsx` - Add Google login button and flow
- `src/app/signup/page.tsx` - Add Google signup button and flow
- `src/app/auth/callback/route.ts` (NEW) - Handle OAuth callback from Google
- `src/lib/supabase/server.ts` - Verify OAuth compatibility
- `src/lib/supabase/client.ts` - Verify OAuth compatibility

### Configuration Changes
- Supabase project settings: Enable Google OAuth provider
- Google Cloud Console: Configure OAuth 2.0 credentials
- Environment variables: Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and add server-side secret if needed
- Redirect URLs: Configure allowed OAuth callback URLs

### User Experience Changes
- Login page: Users see both email/password form AND "Continue with Google" button
- Signup page: Users see both registration form AND "Sign up with Google" button
- First-time Google users: Automatically create account with Google profile data
- Returning Google users: Seamless one-click login
- Account linking: Handle case where user has both password and Google auth (stretch goal)

### Risks & Considerations
- **Account collision**: User signs up with email/password, later tries Google OAuth with same email → Supabase handles this via automatic account linking if email is verified
- **Profile data**: Google profile may not provide all required fields (first_name/last_name) → fallback to email username or prompt user
- **Session handling**: Ensure OAuth sessions work correctly with existing session management
- **Logout flow**: Verify Google OAuth logout works correctly with existing `signOut()` method
- **Testing**: OAuth flows require manual testing; cannot be fully unit tested
- **Security**: Ensure PKCE flow is used for OAuth (Supabase handles this by default)

### Dependencies
- Supabase Auth with Google OAuth provider enabled
- Google Cloud Console project with OAuth 2.0 credentials
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable (already exists)
- No new NPM packages required (Supabase SDK handles OAuth)

### Breaking Changes
None. This is purely additive functionality. Existing email/password authentication remains unchanged.

### Migration Plan
1. Configure Google OAuth in Supabase dashboard (non-breaking)
2. Deploy code changes with feature flag or gradual rollout
3. Monitor OAuth login success rate and error logs
4. No database migrations required

### Success Metrics
- 30%+ of new signups use Google OAuth within first month
- Reduced signup abandonment rate
- No increase in authentication-related support tickets
- Zero OAuth-related security incidents
