# Project learning

*(Pomometer-specific lessons that do not belong in the global [`Learning.md`](../../Learning.md) but are worth revisiting as a team.)*

## How to use

- General patterns: [`../../Learning.md`](../../Learning.md)
- Individual bug write-ups: [`./bugs.md`](./bugs.md)
- Cross-cutting rules, constraints, and evolving notes: this file

## Current themes

### Sync

- Multi-device sync, Google Tasks sync, conflict protection, throttling, echo filtering.

### API boundaries

- Shared client/server helpers, third-party API parameter placement, auth constraints.

### Environment and secrets

- Derive local config from `.env.example`; keep secrets in `.env.local` or platform secrets.
- Treat anything shipped to the browser as public; never store secrets in client-exposed env vars.

### Maintenance

- When a one-off bug becomes a long-term rule, promote it from `bugs.md` to here.

## Evolved rules

### Google Tasks sync must be fail-safe

- Local protection must not depend on remote sync succeeding first.
- After a local update, enter a protection window immediately; if Google Tasks calls fail afterward, stale remote data must not overwrite local state.

### Third-party latency needs layered defenses

- “Newer timestamp wins” alone is not enough; combine cooldowns, skip lists, timestamp checks, etc.
- Assume third-party APIs are delayed and briefly inconsistent.
