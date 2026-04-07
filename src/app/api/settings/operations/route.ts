import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { withCors, getCorsHeaders } from '../../../lib/cors';
import { SettingsService } from '../../../lib/services/settings';
import type { JWTPayload } from '../../../types/api';

interface SettingsOperation {
  type: string;
  payload: unknown;
  timestamp: string;
  id?: string;
}

// Apply one or multiple settings operations (lightweight incremental endpoint)
async function handleSettingsOperations(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { operations?: SettingsOperation[]; operation?: SettingsOperation };
    let operations: SettingsOperation[] = [];

    if (Array.isArray(body.operations)) {
      operations = body.operations;
    } else if (body.operation) {
      operations = [body.operation];
    } else {
      // Fallback: accept raw array
      if (Array.isArray(body)) operations = body as SettingsOperation[];
    }

    if (!operations.length) {
      return NextResponse.json({ error: 'No operations provided' }, { status: 400 });
    }

    const settingsService = new SettingsService();
    // Apply sequentially (settings updates are small)
    for (const op of operations) {
      try {
        await settingsService.applySettingsOperation(user.sub, op as SettingsOperation);
      } catch (e) {
        console.error('Failed settings operation', op.type, e);
        return NextResponse.json({ error: `Failed operation ${op.type}` }, { status: 400 });
      }
    }

    const lastSyncTime = new Date().toISOString();
    return NextResponse.json({ lastSyncTime, success: true });
  } catch (error) {
    console.error('Settings operations error:', error);
    return NextResponse.json({ error: 'Failed to process settings operations' }, { status: 500 });
  }
}

export const POST = withCors(withAuth(handleSettingsOperations));

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
