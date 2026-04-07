# Google Tasks mapping strategy

## Decision

Google Tasks integration uses a **single dedicated list `AA Pomometer`**, instead of mapping each local todo to a Google task list and sub-todos to tasks in a scattered way.

## Why

- The old approach spread local concepts across Google’s hierarchy in a confusing way.
- Users’ existing Google task lists should not be polluted by Pomometer’s internal shape.
- One dedicated list keeps local todo / sub-todo hierarchy aligned with the app model.

## Chosen mapping

- **Local todo** → parent task in `AA Pomometer`
- **Local sub-todo** → Google sub-task under that parent
- **First login** → background init or reuse of the `AA Pomometer` list

## Consequences

### Positive

- Clear ownership: users see what Pomometer owns.
- Sync logic centers on one list.
- Sub-task relationships match the product model without “list = todo” contortions.
- Initialization can run in the background without blocking login.

### Trade-offs

- Migration and compatibility for legacy fields (e.g. transitional `google_task_list_id`).
- Service layer CRUD/sync rewrites and a higher one-time cost.
- Old and new paths may coexist briefly — document and label transitional code.

## Rules going forward

1. New Google Tasks features assume the dedicated list, not multi-list mapping.
2. Prefer `google_task_id` (and related fields) for todo/sub-todo Google IDs.
3. Keep ensuring the dedicated list exists after login without blocking the main UX.
4. Legacy fields may remain for migration; new features should not depend on old mapping.
