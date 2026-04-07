# Google Service Account API

## Overview

The **Google Service Account API** covers server-to-server Google Tasks calls for automation, without an end-user session.

**Highlights:**

- **S2S** — background jobs, scripts, admin flows; not tied to a browser session.
- **Cloudflare-friendly** — avoids some `googleapis` runtime issues by signing JWTs and calling REST directly.
- **Isolation** — private keys only in server secret stores.

---

## Core types

### `ServiceAccountJWT`

**Purpose:** signed assertion exchanged for a short-lived access token at Google’s token endpoint.

**Lifecycle:**

- **Created:** server reads the private key and mints per request (current design).
- **Owned by:** server only.
- **Disposed:** after token exchange; implementation refreshes on demand rather than long-lived cache.

---

## Functions / methods

### `POST /api/google-tasks-service`

**Purpose:** controlled proxy for tests or internal use of the service account.

**Contract:**

```http
POST /api/google-tasks-service
Content-Type: application/json

{
  "action": "create-task" | "list",
  "tasklistId"?: string,
  "title"?: string
}
```

**Returns:** Google Tasks data for the service account on success.

**Example:**

```typescript
await fetch('/api/google-tasks-service', {
  method: 'POST',
  body: JSON.stringify({
    action: 'create-task',
    tasklistId: '@default',
    title: 'Automated System Task',
  }),
});
```

**Caution:**

- This is **not** “on behalf of the signed-in user”; it uses the service account’s own resources.
- Tokens are obtained **on demand**; caching/refresh is not fully implemented yet.

---

## Best practices

1. **Do not mix** service account access with user OAuth — different resource ownership.
2. **Keys only in server secrets** (e.g. Cloudflare Secrets).
3. **Treat as an automation channel**, not a general front-end API.

---

## Common patterns

### Internal automation

```typescript
const res = await fetch('/api/google-tasks-service', {
  method: 'POST',
  body: JSON.stringify({ action: 'list' }),
});
```

---

## Caveats

**Production:** PEM newlines in private keys are easy to get wrong.

Recommended:

- Inject via secrets such as `SA_PRIVATE_KEY`.
- Separate test vs. production credentials.
- Add token caching if call volume grows.
