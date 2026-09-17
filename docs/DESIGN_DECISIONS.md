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

## Maintenance rule

Add an entry only after a product/design direction is approved and would affect
future UI work. Update an existing entry when the direction is replaced.

