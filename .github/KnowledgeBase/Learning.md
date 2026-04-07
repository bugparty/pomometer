# !!!LEARNING!!!

## Bug Fixes

*(Cross-project bugs and fix patterns go here.)*

## Coding Preferences

- Shared server/client utilities must inject external dependencies (e.g. tokens) via parameters; avoid implicit global state [3]
- Client and server data model field names must stay strictly aligned [2]
- Prefer structured logging when debugging complex state machines [2]
- Avoid mixing complex Tailwind class selectors or fragile `@apply` in plain CSS; prefer semantic class names and native CSS properties.
- Mobile-first: ensure mobile UX is not constrained by desktop-only styles; test on multiple form factors after each change.
- Every sync entry point must apply consistent data protection and conflict handling to tolerate latency from third-party APIs.
- Critical external resource creation must use appropriate concurrency control or layered caching [3]
- When integrating third-party REST APIs, strictly separate where parameters go (query vs body); do not assume [2]
- Local safeguards must be established before remote sync calls; do not rely on third-party API success for state safety [2]
- Frontend env vars are visible by default; secrets belong only in server secrets or private local config [3]

## Refinements

### Explicit dependency injection in shared functions

Separate client and server execution contexts. If a function runs on both sides, do not hard-code `localStorage` or `window` inside it, or SSR and API routes will crash.

### Consistent field naming

When serializing JSON and syncing across frontend and backend, do not use two names for one concept (e.g. `checked` on the client and `completed` on the server), or updates will silently fail.

### Decouple CSS from style tooling

Avoid complex Tailwind selectors in plain CSS (e.g. escaped `lg\:flex-row`) or `@apply`. They may not parse in every pipeline (`Unknown at rule`). Plain CSS properties are safer and more portable.

### Cross-device testing and mobile-first

When changing layout, account for mobile interaction (e.g. minimum ~44px touch targets) and scrolling (avoid global `overflow: hidden` where it breaks mobile). Verify on desktop and mobile after style changes.

### Consistent sync entry points

In bidirectional sync, whether “light” or “full” sync runs, apply the same local protections (e.g. timestamp-based update cooldowns) so delayed third-party responses cannot overwrite fresh local edits.

### Concurrency and caching for external resource creation

During app init or under concurrency, avoid duplicate creates when a third-party API is slow. Use layered caches (e.g. DB + in-memory) and guard before calling create APIs.

### Follow API parameter placement strictly

Read the official docs for path, query, body, and headers. Example: Google Tasks requires `parent` as a **query** parameter when creating a subtask; putting it in the body is ignored and hides bugs.

### Protections must be fail-safe

To stop stale remote data from overwriting newer local state, establish protection right after local updates, not only after third-party sync succeeds. Otherwise network failures, token expiry, or remote flakiness break the whole chain.

### Local D1 migrations (fresh clone or cleared `.wrangler`)

The local Cloudflare D1 file under `.wrangler` starts empty. Until SQL migrations run, Prisma will hit errors like `no such table: main.users` during OAuth callbacks even when token exchange succeeds—`prisma generate` only builds the client; it does not create tables.

After a new clone or if you delete `.wrangler`, apply migrations to the **local** database first:

```bash
pnpm exec wrangler d1 migrations apply pomometer-db --local --config wrangler.jsonc
```
