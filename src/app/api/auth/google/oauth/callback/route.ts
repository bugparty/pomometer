import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '../../../../../lib/jwt';
import { UserService } from '../../../../../lib/services';
import type { AuthResponse } from '../../../../../types/api';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json() as { 
      code: string; 
      redirectUri: string;
    };
    
    console.log('OAuth callback request:', { code: code ? 'received' : 'missing', redirectUri });
    console.log('Environment check:', { 
      clientId: GOOGLE_CLIENT_ID ? 'present' : 'missing',
      clientSecret: GOOGLE_CLIENT_SECRET ? 'present' : 'missing'
    });
    
    if (!code || !redirectUri) {
      console.error('Missing required parameters:', { code: !!code, redirectUri: !!redirectUri });
      return NextResponse.json(
        { success: false, error: 'Missing code or redirect URI' },
        { status: 400 }
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing OAuth credentials' },
        { status: 500 }
      );
    }

    // 交换授权码获取访问令牌
    const tokenParams = {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };
    
    console.log('Token exchange request params:', {
      ...tokenParams,
      client_secret: GOOGLE_CLIENT_SECRET ? '[REDACTED]' : 'missing'
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to exchange authorization code: ${errorText}`,
          details: {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText
          }
        },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string;
      id_token?: string;
      refresh_token?: string;
      expires_in?: number;
      scope: string;
    };

    // 使用访问令牌获取用户信息
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenData.access_token}`
    );
    
    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get user info' },
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

    // 创建或更新用户到数据库，并存储Google tokens
    const userService = new UserService();
    const user = await userService.upsertUserWithTokens(userInfo, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    });
    
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
      googleAccessToken: tokenData.access_token
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
    console.error('Google OAuth callback error:', error);
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
