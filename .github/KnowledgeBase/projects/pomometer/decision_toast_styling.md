# Toast styling strategy

## Decision

Ant Design `message` / toast styling uses the **official `className` + `style` APIs plus a small amount of helper CSS**, instead of winning specificity wars or overriding large swaths of defaults.

## Why

- Ant Design messages use CSS-in-JS with high specificity; external CSS often loses.
- Repeated attempts showed that piling selectors is fragile.
- Official APIs already expose `className` and `style` — use them.

## Chosen approach

- `className` for identification and shared hooks
- Inline `style` for critical appearance
- Extra CSS only for icons, links, and small additions
- Colors and radii still prefer project CSS variables

## Consequences

### Positive

- More stable against internal Ant Design changes.
- Per–toast-type control is straightforward.
- Closer to supported usage; easier upgrades.

### Trade-offs

- Some visual logic moves from CSS into TypeScript.
- `ToastManager` can accumulate style logic if not disciplined.

## Rules going forward

1. Change toast look-and-feel via `ToastManager` first.
2. Do not reintroduce large global overrides to “beat” Ant Design.
3. Keep using design tokens for color, radius, shadow instead of hardcoding in every inline style.
