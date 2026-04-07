# Cloudflare Workers + D1 deployment

## Architecture

```
Frontend (React)          Cloudflare Workers API           D1 Database
    │                              │                              │
    │── API calls ─────────────────│── business logic             │
    │                              │                              │
    │                              │── persistence ───────────────│
    │                              │                              │
    │                              │── auth (Google OAuth)        │
    │                              │                              │
    └── static assets ─────────────┘                              │
```

## Deployment steps

### 1. Prerequisites

- Cloudflare account
- Google OAuth app (user sign-in)
- Node.js and pnpm installed locally

### 2. Cloudflare Workers CLI

```bash
npm install -g wrangler

wrangler auth login
wrangler auth whoami
```

### 3. Database

```bash
cd workers-site
wrangler d1 create pomometer-db
```

Save the returned `database_id` into `wrangler.toml`.

```bash
wrangler d1 execute pomometer-db --file=schema.sql
wrangler d1 list
```

### 4. Environment variables

Example `workers-site/wrangler.toml`:

```toml
[vars]
GOOGLE_CLIENT_ID = "your-google-client-id"
JWT_SECRET = "strong-secret-for-jwt"

[[d1_databases]]
binding = "DB"
database_name = "pomometer-db"
database_id = "your-database-id"
```

### 5. Local development

```bash
cd workers-site
wrangler dev --local
```

In another terminal:

```bash
cd ..
pnpm start
```

### 6. Production deploy

```bash
pnpm run build
cd workers-site
wrangler deploy
```

Note the Workers URL.

### 7. Frontend production env

```bash
# .env.production
REACT_APP_API_BASE_URL=https://your-worker.your-subdomain.workers.dev
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 8. Cloudflare Pages (frontend)

```bash
wrangler pages deploy build --project-name pomometer
```

Or connect the Git repo in the Pages UI: build command `pnpm run build`, output directory `build` (adjust if your app differs).

## Production configuration

### Workers secrets / vars

In the Cloudflare dashboard:

1. Workers & Pages → your worker
2. Settings → Environment variables
3. Examples: `GOOGLE_CLIENT_ID`, `JWT_SECRET` (use a strong secret)

### Pages env (if using Pages for the UI)

1. Project → Settings → Environment variables
2. Examples: `REACT_APP_API_BASE_URL`, `REACT_APP_GOOGLE_CLIENT_ID`

## Monitoring and logs

### Tail worker logs

```bash
cd workers-site
wrangler tail
wrangler tail --format=pretty
```

### Inspect D1

```bash
wrangler d1 execute pomometer-db --command="SELECT * FROM todos LIMIT 10;"
wrangler d1 execute pomometer-db --command="SELECT * FROM users WHERE email='user@example.com';"
```

This setup uses Cloudflare’s edge network and D1 for a scalable, low-ops backend.
