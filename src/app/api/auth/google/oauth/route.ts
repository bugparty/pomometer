import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '../../../../lib/jwt';
import { UserService } from '../../../../lib/services';
import type { AuthResponse } from '../../../../types/api';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export async function POST(request: NextRequest) {
  try {
    const { idToken, accessToken } = await request.json() as { 
      idToken: string; 
      accessToken?: string;
    };
    
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Missing ID token' },
        { status: 400 }
      );
    }

    // 使用Google的userinfo端点验证并获取用户信息
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken || idToken}`
    );
    
    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify token with Google' },
        { status: 401 }
      );
    }

    const googleUserInfo = await userInfoResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };
    
    // 转换为我们的用户信息格式
    const userInfo = {
      sub: googleUserInfo.id,
      email: googleUserInfo.email,
      name: googleUserInfo.name,
      picture: googleUserInfo.picture,
      aud: GOOGLE_CLIENT_ID,
      iss: 'https://accounts.google.com',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1小时
    };

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
      },
      // 可选：保存访问令牌用于后续Google Tasks API调用
      googleAccessToken: accessToken
    };

    // 设置CORS头
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 400 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}
