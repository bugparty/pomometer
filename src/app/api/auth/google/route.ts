import { NextRequest, NextResponse } from 'next/server';
import { generateJWT, verifyGoogleToken } from '../../../lib/jwt';
import { UserService } from '../../../lib/services';
import { getCorsHeaders, getCorsOptionsHeaders } from '../../../lib/cors';
import type { AuthResponse } from '../../../types/api';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// 检查配置
if (!GOOGLE_CLIENT_ID) {
  console.error('🔴 [Google Auth API] GOOGLE_CLIENT_ID environment variable is not set');
  console.error('🔴 [Google Auth API] Available environment variables:', {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'set' : 'not set'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json() as { credential: string };
    
    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Missing credential' },
        { status: 400 }
      );
    }

    // 检查 Google Client ID 是否配置
    if (!GOOGLE_CLIENT_ID) {
      console.error('🔴 [Google Auth API] POST request failed - GOOGLE_CLIENT_ID not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Google Client ID not configured' },
        { status: 500 }
      );
    }

    // 验证Google JWT token
    const userInfo = await verifyGoogleToken(credential, GOOGLE_CLIENT_ID);
    
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 创建或更新用户到数据库
    const userService = new UserService();
    const user = await userService.upsertUser(userInfo);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create/update user' },
        { status: 500 }
      );
    }

    // 生成我们自己的JWT token
    const token = generateJWT(userInfo);
    
    const response: AuthResponse = {
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Authentication failed' }),
      { 
        status: 400,
        headers: getCorsHeaders(request),
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsOptionsHeaders(request),
  });
}
