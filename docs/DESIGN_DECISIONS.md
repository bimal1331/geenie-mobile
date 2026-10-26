# Mobile Design Decisions

This document records approved, durable interface decisions. It is not a
backlog or a changelog.

## 2026-09-17 — Bundle discovery layout

**Decision:** Explore uses **Minimal List With Image Strips**; Library uses a
compact saved-bundle row.

- Each bundle is a compact vertical collection card with a shallow,
  full-width cover-image strip in Explore.
- Content uses the existing warm editorial theme: serif title, concise
  description, affirmation count, optional Premium badge, and circular
  chevron affordance.
- Library uses a smaller square cover, title, affirmation count, optional
  Premium badge, and understated chevron. It opens bundle detail rather than
  starting playback from the list.
- The shared list-card component supports both variants so Explore and Library
  remain visually aligned while retaining their distinct roles.

**Bundle Detail:** Uses the same bundle cover image in a roomier 16:9 hero
directly below the detail heading. One uploaded cover image is the editorial
source; screens use different display crops rather than separate images.

**Reference mocks:** `docs/design/explore-mocks/`

**Why:** The selected direction stays close to the earlier interface while
giving cover art more presence and keeping the catalog scannable.

## 2026-10-26 — Explore topic sections

**Decision:** Explore presents editorial topic sections as a compact category
list. Tapping a category opens its own screen, where its bundles use the
approved image-strip cards. The app uses directly assigned bundle tags supplied
by the API; only tags marked as Explore categories become category rows, and
their editorial order is preserved.

A bundle may appear in multiple relevant sections. Tags remain the shared
vocabulary for future bundle and affirmation search, rather than creating a
separate category taxonomy. Until topics have been assigned, Explore keeps its
ungrouped list so published bundles never disappear.

## 2026-09-22 — Premium access presentation

**Decision:** Premium bundles remain discoverable in Explore and Library. A
viewer without an active entitlement sees a lock badge, can still save the
bundle when signed in, and can read its first five affirmations on the detail
screen. Playback is unavailable until the server returns the bundle as
unlocked. The mobile app uses the API's `isLocked` flag as the single playback
gate; `isPremium` remains only editorial labeling. When a preview omits more
affirmations, a continuation card directly below the five previews communicates
the remaining count and the Premium value.

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

## 2026-10-14 — Home daily practice

**Decision:** Home is the personal starting point for regular listening through
**Your daily rhythm**. Signed-in users can create up to three named practices,
each pairing a published, accessible bundle with a local time, selected days,
and an optional reminder.

- Home prioritizes the next practice and a one-tap **Play now** action, then
  shows later scheduled practices.
- A scheduled practice that has passed today is shown in a clearly labeled
  **Missed today** section only when the user has not listened to that bundle
  enough times that day. It remains a gentle one-tap invitation, clears at
  midnight, and never creates a backlog from prior days.
- Home does not use a large greeting or supporting copy; the next practice and
  each later practice use separate surfaces rather than one shared schedule
  card, so they remain visually distinct and scannable.
- Home's top-level Progress, Daily Rhythm, and Continue Listening modules use
  deliberate vertical separation. Within Daily Rhythm, a missed practice has a
  warm alert treatment, the next practice is the strongest surface, and later
  practices are quieter compact rows. Continue Listening starts after a subtle
  divider rather than blending into the practice list.
- The practice builder uses a simple named moment, time, day chips, bundle
  selection, and reminder toggle; it does not introduce per-practice playback
  duration in the first version.
- Guests see the value of the feature and are directed to sign in rather than
  receiving a device-only plan that cannot be restored.
- Tapping a reminder opens the scheduled bundle; it never starts audio
  automatically.

## 2026-10-15 — Continue listening

**Decision:** Home offers one device-local **Continue listening** item for an
incomplete bundle. It resumes at the current affirmation, not at a position
within an audio track. The record is cleared when the bundle finishes and the
bundle is fetched again before resuming, preserving current availability,
premium access, and audio URLs without requiring a progress API.
When a bundle is still loaded in the active app session, the global mini-player
is the sole resume control and Home suppresses the duplicate card.

## 2026-10-22 — Listening progress

**Decision:** Signed-in listening progress records a bundle once its audio has
genuinely started; it does not require every affirmation to finish. Home uses a
compact weekly listening-days card that opens calendar-based Practice History.
History groups play events by day and retains multiple listens of the same
bundle. Practice slots may reuse a bundle, so progress never assigns a play to
a particular slot or launch surface.

## Maintenance rule

Add an entry only after a product/design direction is approved and would affect
future UI work. Update an existing entry when the direction is replaced.
