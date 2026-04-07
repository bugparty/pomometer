# Tailwind migration

## Decision

Pomometer migrated from **Bulma** to **Tailwind CSS**, adopting utility-first styling while preserving existing design and interaction semantics.

## Why

- Bulma pulls a large bundle; some of it was unused.
- Tailwind fits fine-grained responsive and local customization.
- Smoother fit with React/Next.js and lower long-term maintenance cost.

## What changed

- Removed `bulma` / `bulma-start`
- Added `tailwindcss`, `postcss`, `autoprefixer`
- Restyled layout, nav, modals, forms, footer, clock, etc.
- Extended theme, spacing, typography, etc.

## Consequences

### Positive

- Better tree-shaking / smaller CSS surface.
- Finer control over breakpoints and spacing.
- Faster UI iteration aligned with the current stack.

### Trade-offs

- Heavy `@apply` or long utility chains can become hard to maintain again.
- The team needs shared rules so JSX and CSS files do not both sprawl.

## Rules going forward

1. Tailwind is the primary styling approach; no return to Bulma.
2. Reuse tokens or semantic classes for cross-component rules instead of copy-pasting long utility strings.
3. When Tailwind is awkward, plain CSS is fine if structure stays clear.
