# CSS design tokens

## Decision

The design system uses **CSS custom properties as tokens** for colors, spacing, breakpoints, radii, shadows, gradients, and transitions, instead of scattering raw values in component CSS.

## Why

- Duplicated colors and spacing spread inconsistency.
- Ad-hoc breakpoints diverge across pages.
- Central tokens simplify theming, tweaks, and design review.

## What we standardized

- **Breakpoints** — e.g. `--breakpoint-desktop`, `--breakpoint-tablet`
- **Colors** — e.g. `--color-primary`, `--color-gray-*`
- **Spacing** — e.g. `--spacing-sm`, `--spacing-base`
- **Radii** — e.g. `--radius-md`, `--radius-xl`
- **Shadows, gradients, motion**

## Consequences

### Positive

- More consistent visual language.
- New components can reuse tokens.
- Tweaks happen at token definitions instead of hunting literals.

### Trade-offs

- Slightly slower upfront: “is there a token?” before typing a number.
- Token names need ongoing cleanup or they grow messy again.

## Rules going forward

1. Prefer existing CSS variables for new styles.
2. If a semantic token is missing, add it to the shared variables file, then use it.
3. Avoid returning to many magic numbers inside components.
