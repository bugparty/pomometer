# Pomometer — Agent instructions (router)

## What this file is (router only)

`AGENTS.md` is an **index / router**, not a copy of the handbook.

- **Put here:** short orientation, tables of links to [`.cursor/rules/*.mdc`](.cursor/rules/) and other docs, and one-line “where to go next.”
- **Do not put here:** long how-tos, duplicated commands already covered in a rule file, or full procedural guides — add those to the right [`.mdc`](.cursor/rules/) or under [`.github/KnowledgeBase/manual/`](.github/KnowledgeBase/manual/) and link here instead.
- **Canonical rules for agents:** edit [`.cursor/rules/*.mdc`](.cursor/rules/). The repo root [`.cursorrules`](.cursorrules) stays a brief pointer; Cursor loads `.mdc` files automatically.

**Treat this file as a map, not the manual.**

## Project (one line)

Pomodoro + todos: **Next.js 15**, **React 19**, **Redux**, **Cloudflare D1** (Prisma), **Google OAuth / Tasks**, i18n; frontend via **OpenNext** on Cloudflare; API routes use Next.js route handlers, and background jobs live in [`backgroundworker/src/index.ts`](backgroundworker/src/index.ts).

## Step X: 查 Knowledge Base

在做出技术决策前，优先查询 [`.github/KnowledgeBase/Index.md`](.github/KnowledgeBase/Index.md)

## Rules router — start here

| Rule file | Use when you need… |
|-----------|---------------------|
| [`pomometer-core.mdc`](.cursor/rules/pomometer-core.mdc) | Stack, architecture, **pnpm**, D1/Prisma, deploy, migrations, **background worker** commands, auth/API overview |
| [`pomometer-typescript.mdc`](.cursor/rules/pomometer-typescript.mdc) | **TypeScript/React**: API boundaries, Redux typing, no `any`, shared types ([`src/app/types/api.ts`](src/app/types/api.ts)) |
| [`pomometer-i18n.mdc`](.cursor/rules/pomometer-i18n.mdc) | **i18n**: `react-intl` / FormatJS, locale files, `formatjs` ESLint rule |
| [`pomometer-css.mdc`](.cursor/rules/pomometer-css.mdc) | **CSS**: `@apply`, `css-variables.css`, no Tailwind in JSX, Safari-only hacks |
| [`pomometer-dev-server.mdc`](.cursor/rules/pomometer-dev-server.mdc) | **Local dev server** stuck / wrong port — free **3000**, restart `pnpm dev` |
| [`pomometer-acceptance-verification.mdc`](.cursor/rules/pomometer-acceptance-verification.mdc) | After **UI/visible** bugfixes: built-in browser MCP — navigate → snapshot → screenshot → assert |
| [`pomometer-browser-testing.mdc`](.cursor/rules/pomometer-browser-testing.mdc) | **Google OAuth / sign-in** verification in the built-in browser |

**Task → rule:** styling → `pomometer-css.mdc`; types/API/Redux → `pomometer-typescript.mdc`; copy/locales → `pomometer-i18n.mdc`; DB/D1/Prisma/deploy/worker → `pomometer-core.mdc`; UI fix done? → `pomometer-acceptance-verification.mdc`; auth flow? → `pomometer-browser-testing.mdc`; localhost broken? → `pomometer-dev-server.mdc`.

## Other entry points (not `.mdc` rules)

| Topic | Where |
|-------|--------|
| **i18n review workflow** (lint, locale keys, FormatJS fixes) | [`.cursor/skills/pomometer-i18n-review/SKILL.md`](.cursor/skills/pomometer-i18n-review/SKILL.md) |
| **Playwright E2E** (login toast, env, CI) | [`.github/KnowledgeBase/manual/PLAYWRIGHT_E2E.md`](.github/KnowledgeBase/manual/PLAYWRIGHT_E2E.md) |
| Topic guides (sync, deploy, etc.) | [`.github/KnowledgeBase/manual/`](.github/KnowledgeBase/manual/) |
