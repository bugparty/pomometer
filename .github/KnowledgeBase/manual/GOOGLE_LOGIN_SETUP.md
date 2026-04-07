# Google sign-in integration

This project supports Google sign-in. Configuration overview:

## 1. Google Cloud Console

### 1.1 Project and OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API and Google Identity API as required by your flow
4. Go to **APIs & Services** → **Credentials**
5. **Create credentials** → **OAuth 2.0 Client IDs**
6. Application type: **Web application**
7. **Authorized JavaScript origins**, e.g.:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
8. **Authorized redirect URIs**, e.g.:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
9. Save and copy the client ID

### 1.2 OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. User type: **External** (typical)
3. Fill app name, support email, domains, developer contact
4. Save

## 2. App configuration

### 2.1 Environment variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`, for example:

   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   REACT_APP_JWT_SECRET=your-jwt-secret
   REACT_APP_API_BASE_URL=http://localhost:3000
   ```

### 2.2 Cloudflare Workers

In `wrangler.toml`:

```toml
[vars]
GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
JWT_SECRET = "your-jwt-secret"
```

## 3. Features

### 3.1 Frontend

- Google one-tap / button sign-in
- Avatar and profile display
- Persistent session
- Sign-out
- Loading and error states
- Responsive layout

### 3.2 Backend

- Google JWT verification
- App-issued JWT
- User profile API
- CORS
- Error handling

## 4. API

### 4.1 Google sign-in

```
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google_jwt_token"
}

Response:
{
  "success": true,
  "token": "your_jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "avatar_url"
  }
}
```

### 4.2 User profile

```
GET /api/user/profile
Authorization: Bearer your_jwt_token

Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "avatar_url"
  }
}
```

## 5. Development and deploy

### 5.1 Local

```bash
pnpm install
pnpm start
pnpm build
```

### 5.2 Cloudflare Workers

```bash
pnpm run deploy
# or
npx wrangler publish
```

## 6. Security

1. **JWT secret** — strong, unique, never committed in plaintext to public repos
2. **HTTPS** — required in production
3. **Origins / redirects** — only trusted domains in Google Console
4. **Token lifetime** — JWT expiry policy (e.g. 24h) as implemented in code
5. **CORS** — tighten to your front-end origins

## 7. Troubleshooting

### "Invalid client ID"

- Verify client ID and Google Console origins/redirects

### "Token verification failed"

- Same `JWT_SECRET` everywhere; token not expired

### CORS errors

- API allows your front-end origin; request URL matches deployment

### Sign-in button missing

- Google Identity Services script loaded; network not blocking it

## 8. Possible extensions

- Cloud sync of user data
- More providers (GitHub, etc.)
- Preference sync across devices
- Pomodoro stats and analytics
- Collaboration features

---

For issues, check server/client logs or open an issue.
