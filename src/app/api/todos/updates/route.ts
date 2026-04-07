import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { withCors, getCorsHeaders } from '../../../lib/cors';
import { OperationService } from '../../../lib/services/operation';
import type { JWTPayload, SyncResponse } from '../../../types/api';

// 获取增量更新
async function handleGetUpdates(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    
    if (!since) {
      return NextResponse.json(
        { success: false, error: 'Missing since parameter' },
        { status: 400 }
      );
    }

    // 验证时间格式
    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid since parameter format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    const operationService = new OperationService();
    const operations = await operationService.getOperationsSince(user.sub, since);
    
    const response: SyncResponse = {
      success: true,
      data: {
        conflicts: [],
        serverOperations: operations,
        lastSyncTime: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get updates error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get updates' },
      { status: 500 }
    );
  }
}

export const GET = withCors(withAuth(handleGetUpdates));

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
