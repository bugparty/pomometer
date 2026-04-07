import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '../../../lib/cors';
import { getDb } from '../../../lib/database';
import { verifyJWT } from '../../../lib/jwt';

/**
 * Dev-only: upsert `users` row for the Bearer JWT `sub` so FK on `todos.user_id` succeeds during E2E.
 * Not available in production.
 */
async function handlePost(request: NextRequest): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const auth = request.headers.get('Authorization');
  const token = auth?.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing Authorization' }, { status: 401 });
  }

  const payload = verifyJWT(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  const db = await getDb();
  await db.user.upsert({
    where: { id: payload.sub },
    update: {
      email: payload.email,
      name: payload.name ?? '',
      picture: payload.picture ?? '',
      updatedAt: new Date(),
    },
    create: {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? '',
      picture: payload.picture ?? '',
    },
  });

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
