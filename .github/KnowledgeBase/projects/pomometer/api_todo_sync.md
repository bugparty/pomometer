# Todo Sync API

## Overview

The **Todo Sync API** is the core sync surface between client Redux state and cloud D1 data for todos and sub-todos.

**Highlights:**

- **Offline-first** — local changes succeed first; network catches up in the background.
- **Incremental sync** — upload operation logs instead of full snapshots.
- **Eventual consistency** — `lastSyncTime` and op replay help converge across devices.

---

## Core types

### `TodoItem`

**Purpose:** shared todo shape.

**Shape:**

```typescript
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  deleted: boolean;
  focus: boolean;
  createdDate: string;
  updatedDate: string;
  subItems: SubTodoItem[];
  userId: string;
}
```

**Lifecycle:**

- **Created:** client-side or returned on full fetch.
- **Owned by:** Redux on the client and DB on the server.
- **Removed:** soft-delete in UI first; server may purge later by policy.

### `SyncOperation`

**Purpose:** one replayable change.

**Shape:**

```typescript
interface SyncOperation {
  type: string;
  payload: any;
  timestamp: string;
}
```

**Lifecycle:**

- **Created:** on each user action.
- **Queued:** local pending queue until acknowledged.
- **Dropped:** after successful sync and acknowledgment.

---

## Functions / methods

### `GET /api/todos`

**Purpose:** full list for first login, local reset, or forced reconciliation.

**Contract:**

```http
GET /api/todos
Authorization: Bearer {token}
```

**Parameters:**

- Bearer token required; 401 if missing.

**Returns:**

- Full `todos` and new `lastSyncTime` on success.

**Example:**

```typescript
const response = await fetch('/api/todos', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
```

**Caution:**

- Heavy — not for high-frequency polling.
- Client should replace local state wholesale, not half-merge with stale data.

---

### `POST /api/todos/sync`

**Purpose:** upload pending ops and receive server ops since last sync.

**Contract:**

```http
POST /api/todos/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "operations": SyncOperation[],
  "lastSyncTime": string
}
```

**Parameters:**

- `operations` — local queue.
- `lastSyncTime` — last confirmed sync instant.

**Returns:**

- `serverOperations` and new `lastSyncTime` on success; errors on hard conflicts.

**Example:**

```typescript
await fetch('/api/todos/sync', {
  method: 'POST',
  body: JSON.stringify({
    operations: localPendingOps,
    lastSyncTime: localLastSyncTime,
  }),
});
```

**Caution:**

- Server should be idempotent where possible so retries do not double-apply.
- Avoid concurrent sync requests from the client — they can scramble queue state.

---

## Best practices

1. Prefer incremental sync day-to-day; full fetch only for init or repair.
2. Keep optimistic UI — do not block the interface on the server round-trip.
3. On failure, defer remote work, do not roll back successful local edits unless product requires it.

---

## Common patterns

### Offline queue + background flush

```typescript
dispatch(toggleTodo(todoId));

syncQueue.push({
  type: 'TOGGLE_TODO',
  payload: { id: todoId, completed: true },
  timestamp: new Date().toISOString(),
});

if (isOnline) {
  debouncedFlushSyncQueue();
}
```
