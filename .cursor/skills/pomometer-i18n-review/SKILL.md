---
name: pomometer-i18n-review
description: >-
  Reviews internationalization against Pomometer rules, runs pnpm lint, fixes
  FormatJS violations and missing locale keys (en-US, zh-CN, de-DE), and defers
  ambiguous cases to a final list. Use when the user asks for i18n review,
  locale fixes, formatjs/no-literal-string-in-jsx cleanup, or syncing
  translations across locale files.
---

# Pomometer — i18n review (subagent workflow)

## Authority

1. Read and follow **[`.cursor/rules/pomometer-i18n.mdc`](../../rules/pomometer-i18n.mdc)** — it is the source of truth for stack, locale paths, ESLint behavior, and when **not** to translate.
2. Locale files: [`src/app/locales/en-US.js`](../../../src/app/locales/en-US.js), [`zh-CN.js`](../../../src/app/locales/zh-CN.js), [`de-DE.js`](../../../src/app/locales/de-DE.js). New message **ids** must exist in **all three** with the same key.

## Procedure

1. **Lint (mandatory):** From the repo root, run **`pnpm lint`**. Treat ESLint output as the primary queue of fixes (includes `formatjs/no-literal-string-in-jsx` where applicable).

2. **Fix violations** in product code (`*.ts` / `*.tsx` under `src/app/`, excluding paths that are intentionally out of scope — see below):
   - Prefer **`FormattedMessage`** or **`intl.formatMessage({ id, defaultMessage })`** with stable dotted ids and English `defaultMessage`.
   - Add or update entries in **en-US**, **zh-CN**, and **de-DE** for every new or changed `id`.
   - For **locale-invariant** UI glyphs (e.g. universal close **×**), use a **module-level constant** (e.g. `"\u00d7"`) instead of fake per-locale strings — see `pomometer-i18n.mdc`.

3. **Do not translate / do not “fix” as product copy** (ignore for i18n work unless ESLint still flags them incorrectly):
   - **`src/app/test-*/**`** — `formatjs/no-literal-string-in-jsx` is **off** there; leave test routes as dev-only unless product rules change.
   - **`placeholder` attributes** — excluded from the literal-string rule in `eslint.config.mjs`; no need to route through i18n for that reason alone.
   - Cases where **`eslint-disable-next-line formatjs/no-literal-string-in-jsx`** is acceptable **only** per the table in `pomometer-i18n.mdc` (mailto/SEO/noscript, SSR loading shell, decorative emoji, clock separators, CSS in styled-jsx, etc.) — use **sparingly** and **always comment why**.

4. **Re-run** `pnpm lint` after edits until it **passes** (fix regressions from the same session).

5. **Ambiguous cases:** If something is unclear (e.g. third-party constraints, unclear user-visible vs technical string, legal/SEO wording), **do not** block the rest of the work — finish other fixes first, then output a short section **“Open questions / uncertain items”** with **file path**, **line or snippet**, and **one sentence** why it is uncertain.

## Output to the user

- Brief summary of what was fixed (files touched, new message ids if any).
- **`pnpm lint`** result (success).
- **Open questions / uncertain items** (only if any remain), or state explicitly that there are none.
