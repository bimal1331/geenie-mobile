# Geenie Mobile Docs

This folder holds the project documentation for `geenie-mobile`.

## Documents

- [Auth And Access](./AUTH_AND_ACCESS.md)

## Local development

1. Install dependencies:

```bash
npm install
```

2. Pick the right local environment:

```bash
npm run env:sim
npm run env:device
```

3. Start the app:

```bash
npm run start:sim
```

or for a physical iPhone dev client:

```bash
npm run start:device-client
```

## Current stack

- Expo SDK 57
- Expo Router
- Zustand
- Supabase client for auth and user-owned data
- admin-hosted mobile APIs for bundles and music

## Notes

- `AGENTS.md` and `CLAUDE.md` stay at repo root because they are tool-facing
  instruction files, not normal project docs.
