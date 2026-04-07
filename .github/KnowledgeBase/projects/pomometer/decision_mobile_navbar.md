# Mobile navbar responsiveness

## Decision

On small screens, the navbar uses **compressed information and priority for core actions**, instead of mirroring the full desktop layout.

## Why

- Horizontal space is tight; showing full title, email, sync status, and settings can push away critical actions.
- “Settings is visible and tappable” beats “every auxiliary label is visible.”
- Touch UX needs reachability before informational completeness.

## Chosen strategy

- Shorter title on mobile
- Tighter spacing and padding
- Hide non-essential chrome (e.g. sync status indicator)
- User block shows only essential identity and actions
- Settings stays clearly tappable

## Consequences

### Positive

- Core actions stay on-screen and clickable.
- More reliable tap targets on phones.
- Desktop can stay information-rich; mobile is tuned separately.

### Trade-offs

- Mobile shows less context.
- Some status moves elsewhere or is hidden.

## Rules going forward

1. Prefer core actions over full information density on mobile nav.
2. New nav items must be validated around ~375px width.
3. Meet minimum touch target sizes; do not design only for desktop hover.
