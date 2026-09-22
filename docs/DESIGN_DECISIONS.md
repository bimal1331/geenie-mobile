# Mobile Design Decisions

This document records approved, durable interface decisions. It is not a
backlog or a changelog.

## 2026-09-17 — Bundle discovery layout

**Decision:** Explore and Library use **Minimal List With Image Strips**.

- Each bundle is a compact vertical collection card with a shallow,
  full-width cover-image strip.
- Content uses the existing warm editorial theme: serif title, concise
  description, affirmation count, optional Premium badge, and circular
  chevron affordance.
- The same list component supports this variant so Explore and Library remain
  visually aligned while retaining their different data/auth states.

**Bundle Detail:** Uses the same bundle cover image in a roomier 16:9 hero
directly below the detail heading. One uploaded cover image is the editorial
source; screens use different display crops rather than separate images.

**Reference mocks:** `docs/design/explore-mocks/`

**Why:** The selected direction stays close to the earlier interface while
giving cover art more presence and keeping the catalog scannable.

## 2026-09-22 — Premium access presentation

**Decision:** Premium bundles remain discoverable in Explore and Library. A
viewer without an active entitlement sees a lock badge, can still save the
bundle when signed in, and can read its first five affirmations on the detail
screen. Playback is unavailable until the server returns the bundle as
unlocked. The mobile app uses the API's `isLocked` flag as the single playback
gate; `isPremium` remains only editorial labeling.

## 2026-09-17 — Bundle repeat control

**Decision:** Playback settings use one discrete slider for bundle repetition:
**Once**, 5-minute intervals from **5 min** through **120 min**, and **∞**.

The persisted contract remains more flexible than the current UI: `0` means
play once, `1–120` means repeat for that number of minutes, and `null` means
repeat indefinitely. A timed repeat finishes its current bundle cycle before
stopping. After a bundle finishes, Play starts a fresh run from its first
affirmation.

## 2026-09-18 — Profile scope

**Decision:** Profile is an account-and-returning-listener space, not a second
playback-settings screen. It contains email sign-in/account state and compact
app information. Voice, music, gap,
and repeat controls remain in the player where they can be adjusted while
listening.

## Maintenance rule

Add an entry only after a product/design direction is approved and would affect
future UI work. Update an existing entry when the direction is replaced.
