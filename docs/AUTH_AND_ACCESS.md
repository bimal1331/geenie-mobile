# Auth And Access

This document explains how the mobile app currently authenticates users and how
that maps to app-owned data.

## High-level flow

```text
Guest user
  -> no auth session
  -> can browse guest-safe mobile features

Signed-in user
  -> Supabase Auth session
  -> public.users profile
  -> user-owned data such as user_settings
```

## Current sign-in method

Today the mobile app uses Supabase email OTP:

```text
Profile screen
  -> sendEmailOtp(email)
  -> verifyEmailOtp(email, code)
  -> Supabase Auth session
  -> AuthProvider resolves public.users profile
```

Relevant code:

- [src/features/auth/services/auth-service.ts](/Users/bimalkumar/code/geenie/geenie-mobile/src/features/auth/services/auth-service.ts)
- [src/features/auth/components/auth-provider.tsx](/Users/bimalkumar/code/geenie/geenie-mobile/src/features/auth/components/auth-provider.tsx)
- [src/features/auth/components/profile-auth-panel.tsx](/Users/bimalkumar/code/geenie/geenie-mobile/src/features/auth/components/profile-auth-panel.tsx)

## Session model inside the app

The mobile app now keeps an app-owned auth session shape in state instead of
storing the raw Supabase `Session`.

That session exposes:

- `userId`
- `email`
- `displayName`
- `avatarUrl`
- `provider`

This keeps Supabase-specific session details boxed into the auth service layer
and makes future auth-provider migration easier.

## User data flow

```text
Supabase Auth
  auth.users
      |
      | trigger / sync path
      v
public.users
      |
      +--> public.user_settings
      +--> future favorites / playlists / library / progress
```

### Signed-in settings sync

Playback settings work in two stages:

1. local settings hydrate from device storage
2. if a user is signed in, settings sync to `public.user_settings`

Relevant code:

- [src/features/settings/store/settings-store.ts](/Users/bimalkumar/code/geenie/geenie-mobile/src/features/settings/store/settings-store.ts)
- [src/features/settings/components/settings-sync-provider.tsx](/Users/bimalkumar/code/geenie/geenie-mobile/src/features/settings/components/settings-sync-provider.tsx)

## Relation to admin users

Mobile users and admin users can look identical in:

- `auth.users`
- `public.users`

The difference is that admins also have a row in `public.admin_users`, which
the admin dashboard checks before allowing dashboard access.

So auth method does not define role. Authorization comes from app tables.
