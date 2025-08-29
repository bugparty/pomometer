import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { TodoService } from '../../../lib/services';
import type { JWTPayload, TodosResponse } from '../../../types/api';

async function handleSync(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const todoService = new TodoService();
    const todos = await todoService.syncGoogleTasks(user.sub);
    const response: TodosResponse = {
      success: true,
      data: {
        todos,
        lastSyncTime: new Date().toISOString()
      }
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Google sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync with Google Tasks' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleSync);
export const GET = withAuth(handleSync);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
