# Technical Design: Google OAuth Integration

## Overview

This document outlines the technical architecture for integrating Google OAuth 2.0 authentication into LeadCore AI using Supabase Auth as the authentication provider. The design leverages Supabase's native OAuth support to minimize custom code while ensuring security and maintainability.

## Architecture Decision Records

### ADR-1: Use Supabase Auth Google Provider Instead of Direct OAuth
**Decision**: Use Supabase's built-in Google OAuth provider rather than implementing OAuth flow directly with Google APIs.

**Rationale**:
- Supabase Auth handles OAuth token exchange, session management, and security (PKCE flow)
- Reduces implementation complexity and security risk
- Maintains consistency with existing email/password authentication
- Automatic account linking when email matches
- Built-in token refresh and session management

**Alternatives Considered**:
- Direct integration with Google OAuth 2.0 using `@react-oauth/google` (currently used only for Google Sheets API)
  - Rejected: Would require custom session management, token storage, and user record creation
  - Would duplicate authentication logic across two systems
- NextAuth.js
  - Rejected: Would require replacing entire Supabase Auth system; too much refactoring

### ADR-2: Use Server-Side OAuth Callback Route
**Decision**: Implement OAuth callback handling in a Next.js API route (`/auth/callback/route.ts`) rather than client-side.

**Rationale**:
- Supabase Auth PKCE flow requires server-side code exchange for security
- Prevents exposure of sensitive tokens in browser
- Enables server-side session creation before redirect
- Follows Supabase Auth best practices for OAuth flows

**Implementation**:
```typescript
// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return redirect(next);
    }
  }

  // Return to login with error
  return redirect("/login?error=oauth_failed");
}
```

### ADR-3: Separate `useGoogleOAuth` Hook for Login/Signup
**Decision**: Create a new `useGoogleOAuth` hook separate from existing `useGoogleAuth` (which is for Google Sheets API).

**Rationale**:
- `useGoogleAuth` in `use-google-api.ts` is specifically for Google Sheets API access tokens
- OAuth for authentication has different scope requirements and token lifecycle
- Separation of concerns: authentication vs. API access
- Avoids confusion and reduces coupling

**Implementation**:
```typescript
// src/hooks/use-auth.ts
export const useGoogleOAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const signInWithGoogle = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });
    
    if (error) {
      setIsLoading(false);
      toast.error("Failed to sign in with Google");
      return;
    }
    
    // User is redirected to Google OAuth consent screen
  };
  
  return { signInWithGoogle, isLoading };
};
```

### ADR-4: Automatic Account Linking via Email
**Decision**: Rely on Supabase's automatic account linking when OAuth email matches existing account.

**Rationale**:
- Supabase automatically links OAuth identity to existing account if:
  - Email addresses match
  - Email is verified in both systems
- Prevents duplicate accounts for same user
- No custom account linking logic required
- Standard OAuth behavior expected by users

**Edge Cases**:
- User signs up with password, then tries Google OAuth → Linked automatically
- User has unverified email account, then uses Google OAuth → New account created (acceptable)
- User wants to use different email for OAuth → Allowed, creates separate account

### ADR-5: OAuth Button UI Pattern
**Decision**: Place OAuth buttons above email/password form with visual divider.

**Rationale**:
- Industry standard pattern (GitHub, GitLab, Vercel, etc.)
- Prioritizes faster OAuth flow over traditional form
- Clear visual separation prevents confusion
- Matches existing design system (Ultracite + Tailwind)

**UI Structure**:
```tsx
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>
    {/* OAuth Buttons Section */}
    <div className="space-y-3">
      <Button onClick={signInWithGoogle} variant="outline" fullWidth>
        <GoogleIcon /> Continue with Google
      </Button>
    </div>
    
    {/* Divider */}
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-500">Or continue with email</span>
      </div>
    </div>
    
    {/* Email/Password Form */}
    <form>...</form>
  </CardContent>
</Card>
```

## Data Flow

### OAuth Sign-In Flow
```
1. User clicks "Continue with Google" button
   ↓
2. Client: useGoogleOAuth.signInWithGoogle() called
   ↓
3. Client: supabase.auth.signInWithOAuth({ provider: "google" }) initiated
   ↓
4. Client: User redirected to Google OAuth consent screen
   ↓
5. Google: User authorizes LeadCore AI
   ↓
6. Google: Redirect to /auth/callback?code=xxx
   ↓
7. Server: API route exchanges code for session
   ↓
8. Server: Session cookie set in response
   ↓
9. Server: Redirect to /dashboard
   ↓
10. Client: User authenticated, session active
```

### New User Creation Flow
```
1. User completes OAuth (steps 1-7 above)
   ↓
2. Supabase checks if user exists by email
   ↓
3. If not exists:
   - Create user in auth.users
   - Set email_verified = true
   - Populate user_metadata:
     - full_name (from Google profile)
     - avatar_url (from Google profile)
     - provider = "google"
   ↓
4. Session created and user redirected
```

### Session Management
- OAuth sessions are stored identically to email/password sessions
- Session tokens stored in HTTP-only cookies (handled by Supabase)
- Token refresh handled automatically by Supabase client
- `auth.uid()` in RLS policies works for both auth types
- Logout via `supabase.auth.signOut()` works for both auth types

## Configuration Requirements

### Supabase Dashboard Configuration
1. Navigate to Authentication > Providers > Google
2. Enable Google provider
3. Add Google OAuth credentials:
   - Client ID: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (already exists)
   - Client Secret: From Google Cloud Console
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://leadcoreai.com/auth/callback`

### Google Cloud Console Configuration
1. Navigate to APIs & Services > Credentials
2. Create/update OAuth 2.0 Client ID
3. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://leadcoreai.com`
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://leadcoreai.com/auth/callback`
5. Configure OAuth consent screen:
   - App name: LeadCore AI
   - User support email: support@leadcoreai.com
   - Scopes: email, profile, openid

### Environment Variables
```bash
# Already exists - used for both Sheets API and OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx

# Add if not exists (Supabase may handle this internally)
GOOGLE_CLIENT_SECRET=xxx
```

## Security Considerations

### OAuth Flow Security
- **PKCE Flow**: Supabase implements PKCE (Proof Key for Code Exchange) by default
- **State Parameter**: Supabase handles state parameter for CSRF protection
- **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies, not localStorage
- **Token Refresh**: Automatic token refresh prevents session expiry issues

### Account Security
- **Email Verification**: Google OAuth emails are pre-verified
- **Account Linking**: Only links accounts with matching verified emails
- **Session Expiry**: Sessions expire after configurable timeout (default: 1 hour)
- **Logout**: Clears session and invalidates refresh tokens

### Error Handling
- Never expose internal error details to users
- Log OAuth errors with Supabase error codes
- Provide user-friendly error messages
- Monitor OAuth failure rate in production

## Testing Strategy

### Manual Testing Required
- OAuth flows cannot be fully automated due to Google consent screen
- Test cases:
  1. New user signs up with Google
  2. Existing user signs in with Google
  3. User cancels OAuth flow
  4. User denies permissions
  5. OAuth with existing email/password account
  6. Session persistence after OAuth login
  7. Logout after OAuth login

### Error Scenarios to Test
- Google service unavailable
- Invalid OAuth configuration
- Expired authorization code
- Network timeout during OAuth
- User switches Google account mid-flow

## Performance Considerations

- OAuth redirect adds ~2-3 seconds to login flow (Google consent screen)
- First-time users: Slightly faster than email/password (no email confirmation)
- Returning users: Much faster than email/password (one click)
- No impact on existing email/password users
- Session management overhead same for both auth types

## Migration & Rollout

### Phase 1: Configuration (Non-Breaking)
1. Configure Google OAuth in Supabase dashboard
2. Update Google Cloud Console settings
3. Test in staging environment

### Phase 2: Code Deployment
1. Deploy code changes to staging
2. Manual QA of OAuth flows
3. Deploy to production with monitoring

### Phase 3: Monitoring
1. Track OAuth login adoption rate
2. Monitor OAuth error rate
3. Watch for account linking issues
4. Collect user feedback

### Rollback Plan
- If critical OAuth bug discovered:
  1. Remove OAuth buttons from UI (no backend changes needed)
  2. Investigate and fix issue
  3. Redeploy with fix
- No database rollback needed (OAuth users stored in same auth.users table)

## Future Enhancements

### Stretch Goals (Not in Current Scope)
- Add additional OAuth providers (GitHub, Microsoft)
- Allow users to link multiple OAuth providers to one account
- OAuth for existing logged-in users (account linking UI)
- Display connected OAuth providers in account settings
- Allow disconnecting OAuth provider (if password is set)

### Known Limitations
- Users cannot change OAuth email after signup
- No way to merge duplicate accounts (Google vs email/password with different emails)
- Admin panel doesn't distinguish OAuth users from password users (acceptable)
