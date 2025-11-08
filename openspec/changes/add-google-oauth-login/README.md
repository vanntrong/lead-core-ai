# Add Google OAuth Login

This change proposal adds Google OAuth 2.0 authentication to LeadCore AI's existing Supabase Auth system.

## Overview

**Change ID**: `add-google-oauth-login`

**Status**: Proposal (Not Yet Approved)

**Created**: November 8, 2025

**Type**: Feature Addition (Non-Breaking)

## Quick Summary

Adds "Continue with Google" / "Sign up with Google" buttons to login and signup pages, enabling users to authenticate using their Google accounts via Supabase Auth's OAuth provider.

## Files in This Proposal

- **proposal.md**: Why this change is needed, what changes, and impact analysis
- **design.md**: Technical architecture, ADRs, security considerations, and data flow
- **tasks.md**: Step-by-step implementation checklist with testing and validation
- **specs/authentication/spec.md**: Specification deltas (ADDED/MODIFIED requirements)

## Key Features

- One-click login/signup with Google OAuth 2.0
- Automatic account linking for users with matching verified emails
- Pre-verified email addresses (no confirmation email needed)
- Seamless integration with existing Supabase Auth
- No breaking changes to existing email/password authentication

## Implementation Highlights

### Backend
- New OAuth callback route: `/auth/callback`
- New `signInWithGoogle()` method in `AuthService`
- Server-side PKCE flow for security

### Frontend
- Google OAuth button on login page
- Google OAuth button on signup page
- New `useGoogleOAuth` hook for state management
- Loading states and error handling

### Configuration
- Google OAuth provider enabled in Supabase
- Redirect URIs configured in Google Cloud Console
- Environment variables verified

## Success Criteria

- [ ] 30%+ of new signups use Google OAuth within first month
- [ ] Zero OAuth-related security incidents
- [ ] No increase in authentication support tickets
- [ ] Seamless account linking for existing users

## Next Steps

1. **Review**: Team reviews proposal, design, and tasks
2. **Approve**: Product owner approves the change
3. **Implement**: Developer follows tasks.md checklist
4. **Test**: Complete manual testing in staging
5. **Deploy**: Roll out to production with monitoring
6. **Archive**: Move to `changes/archive/` after deployment

## Related Documentation

- [Supabase Auth with OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Project Overview](../../../PROJECT_OVERVIEW.md)

## Questions or Feedback

Contact the development team with any questions about this proposal.
