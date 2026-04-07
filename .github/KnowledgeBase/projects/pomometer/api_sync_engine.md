# Generic Sync Engine

## Overview

The **Generic Sync Engine** is shared client infrastructure for offline queues, retries, debouncing, auth transitions, and multi-model sync.

**Highlights:**

- **Single abstraction** — Todo and Settings no longer each carry a bespoke sync core.
- **Adapter pattern** — “How to call the server” and “How to apply server ops locally” are separate interfaces.
- **Weak-network friendly** — persist locally, queue offline, flush when online.

---

## Core types

### `GenericSyncManager<T>`

**Purpose:** lifecycle for one operation stream’s queue.

**Signature:**

```typescript
class GenericSyncManager<T> {
  constructor(
    storageKey: string,
    apiAdapter: SyncAPI<T>,
    operationHandler: OperationHandler<T>,
    syncIntervalMs: number
  )

  public addOperation(op: T): void;
  public syncToServer(): Promise<void>;
}
```

**Lifecycle:**

- **Created:** usually a singleton in the unified sync integration layer.
- **Owned by:** the global client sync module.
- **Torn down:** typically lives for the page session; clear on logout.

### `SyncAPI<T>`

**Purpose:** how to talk to the server.

### `OperationHandler<T>`

**Purpose:** how to apply server-returned operations to local state.

---

## Functions / methods

### `addOperation(op)`

**Purpose:** enqueue a local change.

**When:**

- User edits a todo
- User edits settings
- Future models (tags, categories, etc.)

**Caution:** components should only enqueue; do not call low-level network sync from UI code.

---

### `syncToServer()`

**Purpose:** flush the queue to the server and pull server-side operations.

**Caution:** should be driven by the engine (connectivity, timers, throttling). Avoid hammering this from feature components.

---

## Best practices

1. **Reuse the engine** for new sync models instead of copying the Todo syncer.
2. **Let the engine handle retries and flaky networks**; business code describes *what* happened.
3. **Keep strategies consistent** — e.g. do not mix optimistic Todo updates with settings that always wait for the server.

---

## Common patterns

### Wiring a new model

```typescript
class SettingsAPIAdapter implements SyncAPI<SettingsOp> {
  // request implementation
}

class SettingsOpHandler implements OperationHandler<SettingsOp> {
  // local apply implementation
}
```
