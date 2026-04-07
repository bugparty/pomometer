import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { withCors, getCorsHeaders } from '../../lib/cors';
import type { JWTPayload, SettingsResponse, UserSettings } from '../../types/api';

// 获取用户设置
async function handleGetSettings(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    // TODO: 从数据库获取用户设置
    // 暂时返回默认设置
    const settings: UserSettings = {
      pomodoro_duration: 1500,
      short_break_duration: 300,
      long_break_duration: 1500,
      ticking_sound_enabled: true,
      rest_ticking_sound_enabled: false,
      language: 'en-US'
    };
    
    const lastSyncTime = new Date().toISOString();

    const response: SettingsResponse = {
      success: true,
      data: {
        settings,
        lastSyncTime
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export const GET = withCors(withAuth(handleGetSettings));

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
