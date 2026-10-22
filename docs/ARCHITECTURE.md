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
  Home        daily rhythm and practice launch point
  Explore     published bundle catalog
  Library     signed-in user's saved bundles
  Profile     email OTP account flow

/bundles/:slug  bundle detail
/player/:slug   bundle player
/practice/:id   create or edit a recurring practice (`new` creates one)
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
- `features/practice`: signed-in recurring bundle plans, Home's daily-rhythm
  surface, and device-local reminder scheduling
- `features/listening`: server-backed listening history and Home progress
  summaries
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

Guests can browse and play free content. The admin API resolves a viewer-specific
`isLocked` field for Premium bundles; locked detail responses contain only five
text previews and no audio URLs. Signing in enables saved bundles and syncs
playback settings to `public.user_settings`.

Practice plans are synced through the mobile API into `public.user_practice_slots`.
The plan itself is server-owned; Expo local-notification identifiers stay on the
device and are rebuilt whenever the signed-in plan is refreshed. This avoids a
push-notification server for explicit user schedules while preserving the plan
across devices and reinstalls.

The canonical mobile API contract lives in the sibling Admin repository at
`geenie-admin/docs/MOBILE_API.md`. Do not duplicate endpoint contracts here;
update that document when changing the backend contract.
