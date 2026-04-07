# Google Tasks–style task list UI

## Decision

The Pomometer todo list uses a **flat, Google Tasks–style list**, not Ant Design `Collapse` panels.

## Why

- Collapse panels feel like “info blocks,” not a fast checklist.
- Todo / sub-todo usage matches a lightweight list, not deep nested management.
- Google Tasks–style UI matches the product goal: light, fast, clear hierarchy.

## Chosen UI

- Parent tasks in single-line rows
- Sub-tasks indented under parents
- Completed tasks in a separate section
- Actions on hover to reduce noise
- Redux / API / props unchanged; presentation-only refactor

## Consequences

### Positive

- Clearer hierarchy and mental model.
- Higher information density, shorter paths.
- Natural flows for sub-tasks and completed items.

### Trade-offs

- More custom layout/interaction in CSS vs. leaning on `Collapse`.
- Hover actions excel on desktop; mobile needs touch-friendly affordances.

## Rules going forward

1. Keep the list “task list” mental model, not “accordion panels.”
2. Editing, drag-and-drop, etc. should stay on the flat list.
3. Prefer stable data flow; confine UI refactors to the view layer.
