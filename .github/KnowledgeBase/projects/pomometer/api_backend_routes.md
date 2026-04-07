# Backend API routes

## Overview

**Backend API routes** are the Next.js handlers under `src/app/api/` for auth, profile, todos, settings, and related flows.

**Highlights:**

- **Unified auth** — after Google sign-in, app JWT; other routes use Bearer tokens.
- **Shared types** — TypeScript types aligned across client and server.
- **Cloudflare** — implemented as Next.js routes but deployed via OpenNext + Cloudflare.

---

## Core types

### `AuthResponse`

**Purpose:** standard success payload after login.

**Shape:**

```typescript
interface AuthResponse {
  token: string;
  user: UserProfile;
  googleAccessToken?: string;
}
```

**Lifecycle:**

- **Created:** successful `POST /api/auth/google`.
- **Held by:** client session.
- **Cleared:** logout or expiry.

---

## Functions / methods

### `POST /api/auth/google`

**Purpose:** verify Google credentials and issue the app JWT.

**Contract:**

```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google-jwt-token"
}
```

**Parameters:**

- `credential` — token from the Google sign-in flow.

**Returns:**

- `AuthResponse` on success.
- 400 / 401 on failure.

**Example:**

```typescript
const res = await fetch('/api/auth/google', {
  method: 'POST',
  body: JSON.stringify({ credential: response.credential }),
});
```

**Caution:**

- `GOOGLE_CLIENT_ID` must match or audience checks fail.
- `JWT_SECRET` is server-only and must be strong in production.

---

### `GET /api/settings`

**Purpose:** load the current user’s pomodoro and preference settings.

### `POST /api/settings/sync`

**Purpose:** push local settings changes and reconcile with the server.

**Caution:** settings sync should feel like todo sync — one mental model, not two divergent behaviors.

---

### `GET /api/user/profile`

**Purpose:** return the user for the current Bearer token.

**Contract:**

```http
GET /api/user/profile
Authorization: Bearer {token}
```

**Caution:** protected — missing or invalid token fails the request.

---

## Best practices

1. Add new endpoints under `src/app/api/` grouped by resource.
2. Reuse shared auth wrappers; avoid copy-pasting token parsing.
3. Document current behavior and naming, not historical migration paths.

---

## Common patterns

### Protected route

```typescript
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (_req, user) => {
  return Response.json({ success: true, userId: user.id });
});
```
