import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/database';
import { withCors, getCorsHeaders } from '../../../lib/cors';

function isSeedAllowed(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.E2E_GOOGLE_INTEGRATION !== '1') return false;
  const secret = process.env.E2E_GOOGLE_INTEGRATION_SEED_SECRET;
  if (!secret) return false;
  return request.headers.get('x-e2e-google-seed-secret') === secret;
}

function parseTokenExpiry(raw: string | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function handlePost(request: NextRequest): Promise<Response> {
  if (!isSeedAllowed(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const id = process.env.POMO_SYNCED_USER_ID;
  const email = process.env.POMO_SYNCED_USER_EMAIL;
  const access = process.env.POMO_SYNCED_GOOGLE_ACCESS_TOKEN;
  const refresh = process.env.POMO_SYNCED_GOOGLE_REFRESH_TOKEN;
  const expiry = parseTokenExpiry(process.env.POMO_SYNCED_GOOGLE_TOKEN_EXPIRY);

  if (!id || !email || !access) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Missing POMO_SYNCED_USER_ID, POMO_SYNCED_USER_EMAIL, or POMO_SYNCED_GOOGLE_ACCESS_TOKEN in server env',
      },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    await db.user.upsert({
      where: { id },
      update: {
        email,
        googleAccessToken: access,
        googleRefreshToken: refresh ?? null,
        googleTokenExpiry: expiry,
        updatedAt: new Date(),
      },
      create: {
        id,
        email,
        name: email.split('@')[0] || 'User',
        picture: '',
        googleAccessToken: access,
        googleRefreshToken: refresh ?? null,
        googleTokenExpiry: expiry,
      },
    });
    return NextResponse.json({ success: true, message: 'Google tokens written to D1 user row for E2E' });
  } catch (e) {
    console.error('[e2e/google-integration-seed]', e);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export const POST = withCors(handlePost);

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
