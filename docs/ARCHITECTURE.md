# Mobile Architecture

## Stack

- Expo SDK 57 with Expo Router
- React Native and Expo Image/Audio
- Zustand for app state and persisted playback settings
- Supabase client for email-OTP authentication and user-owned settings
- Admin-hosted mobile HTTP API for bundles, library behavior, and music catalog

## Navigation

```text
(tabs)
  Home        placeholder for daily listening flow
  Explore     published bundle catalog
  Library     signed-in user's saved bundles
  Profile     email OTP account flow

/bundles/:slug  bundle detail
/player/:slug   bundle player
```

The tab layout also renders the mini-player dock. Root providers initialize
authentication, settings synchronization, and player audio coordination.

## Feature boundaries

- `features/bundles`: catalog/detail data, saved bundles, and bundle screens
- `features/player`: playback session state, audio engines, player screens, and
  the mini-player
- `features/music`: background-music catalog
- `features/auth`: email OTP and app-owned session shape
- `features/settings`: local persistence and signed-in user-settings sync
- `services/api`: authenticated/optional request client for admin-hosted mobile
  endpoints

## Data flow

```text
Explore or Library screen
  -> bundle hooks
  -> bundle service
  -> admin /api/mobile/*
  -> selected bundle detail
  -> player store and audio coordinator
```

Guests can browse and play guest-safe content. Signing in enables saved bundles
and syncs playback settings to `public.user_settings`.

The canonical mobile API contract lives in the sibling Admin repository at
`geenie-admin/docs/MOBILE_API.md`. Do not duplicate endpoint contracts here;
update that document when changing the backend contract.

