# Pomometer

A Pomodoro timer and todo app with Google sign-in and Google Tasks sync. The UI is **Next.js**; data and APIs run on **Cloudflare** (D1, Workers). Use **pnpm** for package management.

For deeper architecture and repo conventions, see [`.cursorrules`](.cursorrules) and [`AGENTS.md`](AGENTS.md).

---

## Requirements

- **Node.js** 20+ (aligned with Wrangler / Next tooling)
- **pnpm** (do not install dependencies with npm or yarn)

---

## First-time setup

```bash
pnpm install
pnpm dlx prisma generate
pnpm dev
```

The app defaults to [http://localhost:3000](http://localhost:3000).

Copy [`.env.example`](.env.example) to **`.env.local`** (gitignored) and fill in Google OAuth, `JWT_SECRET`, etc. Client-exposed variables must use the `NEXT_PUBLIC_` prefix; keep secrets in server-only env vars.

---

## Common scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Local Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest |
| `pnpm test:e2e` | Playwright E2E (starts `pnpm dev` as the webServer) |
| `pnpm dev:worker` | Run `backgroundworker` locally (see below) |
| `pnpm sync-google-env-from-d1` | Pull a user’s Google tokens from **remote D1** into a local env file (see below) |

---

## Background worker (`backgroundworker/`)

A standalone Cloudflare Worker bound to the same D1 database (`pomometer-db`) as the main app. It handles scheduled **Google OAuth access token refresh**, among other tasks. Configuration: [`backgroundworker/wrangler.jsonc`](backgroundworker/wrangler.jsonc).

Local development:

```bash
cd backgroundworker && pnpm run dev
```

Deploy (from the repo root):

```bash
pnpm run deploy:worker
```

Cron triggers and HTTP routes: [`backgroundworker/src/index.ts`](backgroundworker/src/index.ts).

---

## Syncing Google tokens from remote D1 (development)

Script: **`scripts/sync-google-tokens-from-d1.cjs`**, invoked via `pnpm sync-google-env-from-d1`.

With Cloudflare credentials available (`wrangler login` or `CLOUDFLARE_API_TOKEN`), it reads `google_access_token` / `google_refresh_token` (and related fields) from the remote D1 `users` table for a given email and writes **`.env.google.synced.local`** (gitignored).

```bash
pnpm run sync-google-env-from-d1 -- your@email.com
```

- **Staging database**: add `--staging`.
- **Merge into `.env.local`**: add `--merge` at the end (updates a marked block in place).

**Security:**

- These are **real OAuth credentials**. Do not commit them or paste them into chats or screenshots.
- If they may have leaked, **revoke the app’s access** in the Google account and sign in again.
- Next.js does **not** auto-load `.env.google.synced.local`; merge into `.env.local` or load it explicitly with `dotenv` in scripts as needed.

---

## Database (short)

- **Local D1**: use Wrangler migrations; see “Database Management” in `.cursorrules`.
- **Remote / production**: follow team conventions in [`AGENTS.md`](AGENTS.md); avoid using `prisma db push` against remote from the wrong environment.

---

## Stack (summary)

Next.js, React, Redux Toolkit, Tailwind via `@apply` and CSS variables, Ant Design, Prisma + Cloudflare D1, OpenNext on Cloudflare.

---

## License & credits

Evolved from [Next.js](https://nextjs.org) and [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). This project targets **Cloudflare** deployment rather than the default Vercel-oriented template flow.
