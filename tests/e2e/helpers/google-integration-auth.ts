import type { Page } from '@playwright/test';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../../../src/app/types/api';
import {
  E2E_CLOCK_STATE_EN_US,
  E2E_TOAST_SECONDS,
} from './auth-fixture';

/**
 * HS256 JWT for the same `sub` as `POMO_SYNCED_USER_ID` (from `.env.google.synced.local`).
 * Server-side sync uses DB tokens; this satisfies `withAuth` on `/api/todos/*`.
 */
export function signJwtForGoogleIntegration(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required (same as in .env.local for next dev)');
  }
  const sub = process.env.POMO_SYNCED_USER_ID;
  const email = process.env.POMO_SYNCED_USER_EMAIL;
  if (!sub || !email) {
    throw new Error('POMO_SYNCED_USER_ID and POMO_SYNCED_USER_EMAIL must be set (e.g. from .env.google.synced.local)');
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub,
    email,
    name: email.split('@')[0] || 'User',
    picture: '',
    iat: now,
    exp: now + 24 * 60 * 60,
  };
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

/**
 * Same pattern as `applyE2EAuthenticatedSession`, plus `google_access_token` for UI permission checks.
 */
export async function applyGoogleIntegrationSession(page: Page): Promise<void> {
  const authToken = signJwtForGoogleIntegration();
  const googleToken = process.env.POMO_SYNCED_GOOGLE_ACCESS_TOKEN;
  if (!googleToken) {
    throw new Error('POMO_SYNCED_GOOGLE_ACCESS_TOKEN must be set');
  }
  const clockState = E2E_CLOCK_STATE_EN_US;
  await page.addInitScript(
    ({ token, googleAccess, clock, toastSeconds }) => {
      (window as Window & { __POMO_E2E_TOAST_SECONDS?: number }).__POMO_E2E_TOAST_SECONDS =
        toastSeconds;
      window.localStorage.setItem('auth_token', token);
      window.localStorage.setItem('google_access_token', googleAccess);
      window.sessionStorage.removeItem('pomometer_login_success_toast_uid');
      window.localStorage.setItem('state', JSON.stringify({ clock }));
    },
    {
      token: authToken,
      googleAccess: googleToken,
      clock: clockState,
      toastSeconds: E2E_TOAST_SECONDS,
    },
  );
}
