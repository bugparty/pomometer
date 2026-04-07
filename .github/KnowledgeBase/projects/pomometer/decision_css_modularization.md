# CSS modularization

## Decision

The oversized global `App.css` was split into **feature- and component-scoped CSS files** instead of one monolithic stylesheet.

## Why

- Very large single files are hard to review and debug.
- Global sheets encourage cross-component bleed.
- Merge conflicts spike when many people edit one file.

## Resulting structure

Examples:

- `Clock.css`
- `Todo.css`
- `Settings.css`
- `Auth.css`
- `Navigation.css`
- `Common.css`

`App.css` keeps only app-level base styles, resets, and shell layout.

## Consequences

### Positive

- Clearer ownership per component.
- Easier to scope changes to one module.
- Better reviews and debugging.

### Trade-offs

- More import paths to manage.
- Shared rules can still be duplicated if boundaries are unclear.

## Rules going forward

1. New components should get their own stylesheet when they need non-trivial CSS.
2. Global files only for truly global rules — not component details again.
3. When preserving class names for compatibility, still improve structure instead of growing globals.
