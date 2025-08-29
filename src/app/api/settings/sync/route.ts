import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import type { JWTPayload, SyncOperationsRequest, SyncResponse, UserSettings } from '../../../types/api';

// 同步设置操作
async function handleSyncSettings(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const { operations, lastSyncTime } = await request.json() as SyncOperationsRequest;
    const userId = user.sub;
    
    // TODO: 应用所有操作到数据库
    // 暂时跳过数据库操作，只记录日志
    for (const operation of operations) {
      console.log(`Processing settings operation: ${operation.type}`, { 
        payload: operation.payload, 
        timestamp: operation.timestamp, 
        userId 
      });
      
      // 这里应该执行实际的数据库操作
      // await settingsService.applySettingsOperation(userId, operation);
    }
    
    // TODO: 获取更新后的设置
    // 暂时返回默认设置
    const settings: UserSettings = {
      pomodoro_duration: 1500,
      short_break_duration: 300,
      long_break_duration: 1500,
      ticking_sound_enabled: true,
      rest_ticking_sound_enabled: false,
      language: 'en-US'
    };
    
    const syncTime = new Date().toISOString();
    
    const response: SyncResponse = {
      success: true,
      data: {
        conflicts: [], // 设置通常不会有冲突
        serverOperations: [], // 暂时不需要返回服务端操作
        lastSyncTime: syncTime,
        settings
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Sync settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync settings' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleSyncSettings);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
