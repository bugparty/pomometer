# GitHub Secrets Configuration

This repository requires the following secrets to be configured in GitHub repository settings for the **Cloudflare Worker deployment**.

## Project Architecture

This is a **Cloudflare Worker** project that uses:
- `@opennextjs/cloudflare` to build Next.js app for Cloudflare Workers
- Cloudflare D1 database for data storage
- Cloudflare Workers with static assets serving

## Required Secrets

### Cloudflare Configuration
- `CF_API_TOKEN` - Cloudflare API token with permissions to deploy workers and manage D1 databases
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID  
- `CLOUDFLARE_DATABASE_ID` - D1 database ID for production
- `CLOUDFLARE_D1_TOKEN` - D1 database access token

### Google OAuth Configuration  
- `GOOGLE_CLIENT_ID` - Google OAuth client ID

### Application Configuration
- `API_BASE_URL` - Base URL for the API (production worker URL)

## How to Configure

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the corresponding value

## Getting the Values

### Cloudflare Secrets
- `CF_API_TOKEN`: Create in Cloudflare dashboard → My Profile → API Tokens → Create Token
  - Template: "Edit Cloudflare Workers"
  - Account resources: Include your account
  - Zone resources: Include all zones or specific zones if needed
- `CLOUDFLARE_ACCOUNT_ID`: Found in Cloudflare dashboard right sidebar → Account ID
- `CLOUDFLARE_DATABASE_ID`: Found in D1 database settings (from wrangler.toml)
- `CLOUDFLARE_D1_TOKEN`: Create in D1 database → Settings → API tokens

### Google OAuth
- `GOOGLE_CLIENT_ID`: Get from Google Cloud Console → APIs & Services → Credentials

### API Base URL
- `API_BASE_URL`: Your deployed worker URL (e.g., `https://pomometer-worker.your-subdomain.workers.dev`)

## Build Process

The CI uses `opennextjs-cloudflare` which:
1. Builds the Next.js app for Cloudflare Workers runtime
2. Generates worker script and static assets
3. Deploys to Cloudflare Workers (not Pages)

## Default Values (Development)
You can find the default/example values in:
- `.env.production` (for production environment variables)
- `wrangler.toml` (for Cloudflare Workers configuration)
