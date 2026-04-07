# Google Tasks API

## Overview

The **Google Tasks API** connects Pomometer’s todos to Google Tasks so signed-in users can sync with Google.

**Highlights:**

- **Single consent** — identity and Tasks scopes requested during Google sign-in to avoid a second prompt.
- **User-scoped sync** — client and server use the same auth model for the user’s Tasks data.
- **Progressive enhancement** — token storage can evolve without changing how features call Tasks.

---

## Core types

### `googleAccessToken`

**Purpose:** short-lived credential for the current user’s Google Tasks calls.

**Lifecycle:**

- **Created:** returned by the backend after Google OAuth succeeds.
- **Held by:** client session for immediate use; server reads when calling Google APIs.
- **Invalidated:** sign-out, expiry, or revoked consent.

---

## Functions / methods

### Google OAuth scopes

**Purpose:** define what is requested at login.

**Current scopes:**

```text
openid
email
profile
https://www.googleapis.com/auth/tasks
```

**Rationale:**

- `openid` / `email` / `profile` for identity.
- `tasks` for read/write Google Tasks.
- One round is smoother than “login first, Tasks later.”

---

### `src/app/api/auth/google/oauth/route.ts`

**Purpose:** complete OAuth and attach Google access token to the app’s auth response.

**Notes:**

- The UI entry is `ModernGoogleLogin`, not raw Google API calls from screens.
- Prefer helpers in `src/app/lib/googleTasks.ts` over scattered `fetch` to Google.

---

## Best practices

1. Request the full scope set at login; avoid a separate Tasks-only step later.
2. Route Tasks calls through shared helpers; do not build REST URLs in components.
3. Treat token storage as pluggable; business logic should not depend on `localStorage` details.

---

## Caveats

**Security:** `googleAccessToken` still lives in client-accessible storage today → XSS risk.

Possible improvements:

- `httpOnly` cookies for sensitive tokens.
- Refresh tokens and renewal.
- Re-auth and clear error messaging when consent expires.
