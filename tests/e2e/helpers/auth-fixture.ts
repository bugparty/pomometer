import type { Page } from '@playwright/test';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../../../src/app/types/api';

/** Clock slice aligned with `tests/e2e/clock.spec.ts` so persisted `language` is en-US (Login successful! copy). */
export const E2E_CLOCK_STATE_EN_US = {
  mode: 'POMODORO' as const,
  status: 'RESET' as const,
  timeInterval: 3,
  timeLeft: 3,
  playingTick: false,
  playingAlarm: false,
  short_break_duration: 2,
  long_break_duration: 4,
  pomodoro_duration: 3,
  ticking_sound_enabled: true,
  rest_ticking_sound_enabled: false,
  startedAt: null,
  stoppedAt: null,
  baseTime: 0,
  language: 'en-US' as const,
};

const E2E_USER: Pick<JWTPayload, 'sub' | 'email' | 'name' | 'picture'> = {
  sub: 'e2e-login-toast-user',
  email: 'e2e-login@pomometer.test',
  name: 'E2E Login',
  picture: '',
};

/**
 * HS256 JWT matching `src/app/lib/jwt.ts` / `verifyJWT` expectations.
 */
export function signE2ETestJwt(secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    ...E2E_USER,
    iat: now,
    exp: now + 24 * 60 * 60,
  };
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

/** Matches playwright webServer + ToastManager E2E path; init script enforces same duration if dev server is reused. */
export const E2E_TOAST_SECONDS = 4;

/**
 * Before navigation: token + Redux-persist clock language + clear login-success session key so Toast shows once.
 */
export async function applyE2EAuthenticatedSession(
  page: Page,
  options: { token: string; clockState?: typeof E2E_CLOCK_STATE_EN_US }
): Promise<void> {
  const clockState = options.clockState ?? E2E_CLOCK_STATE_EN_US;
  await page.addInitScript(
    ({ token, clock, toastSeconds }) => {
      (window as Window & { __POMO_E2E_TOAST_SECONDS?: number }).__POMO_E2E_TOAST_SECONDS =
        toastSeconds;
      window.localStorage.setItem('auth_token', token);
      window.sessionStorage.removeItem('pomometer_login_success_toast_uid');
      window.localStorage.setItem('state', JSON.stringify({ clock }));
    },
    { token: options.token, clock: clockState, toastSeconds: E2E_TOAST_SECONDS }
  );
}
