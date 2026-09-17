# Geenie Mobile Working Guide

## Start every task with context

Before changing behavior, read:

1. `docs/ARCHITECTURE.md`
2. `docs/DESIGN_DECISIONS.md` for UI work, or the relevant feature document
3. `git status --short` and recent relevant commits

When the sibling `geenie-admin` repository is available in the workspace, read
its `docs/PROJECT_CONTEXT.md` and `docs/MOBILE_API.md` before changing mobile
data behavior or API assumptions.

## Implementation rules

- Keep API access inside feature services; screens and components should not
  call admin endpoints directly.
- Preserve the current feature boundaries for bundles, player, auth, music, and
  settings.
- Update the appropriate docs in the same change when mobile architecture,
  API usage, or approved design direction changes.

## Expo SDK 57

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
