import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '../../../lib/jwt';
import { getDb } from '../../../lib/database';
import { withCors, getCorsHeaders } from '../../../lib/cors';

async function handleGetUserTokens(request: NextRequest): Promise<Response> {
  try {
    // 验证JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No valid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 从数据库获取用户信息
    const db = await getDb();
    const user = await db.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 检查token是否过期 (使用类型断言来访问可能的字段)
    interface UserTokenFields {
      googleAccessToken: string | null;
      googleRefreshToken: string | null;
      googleTokenExpiry: Date | null;
    }
    const userWithTokens = user as typeof user & UserTokenFields;
    const isTokenExpired = userWithTokens.googleTokenExpiry
      ? new Date() > userWithTokens.googleTokenExpiry
      : true;

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        hasGoogleAccessToken: !!userWithTokens.googleAccessToken,
        hasGoogleRefreshToken: !!userWithTokens.googleRefreshToken,
        tokenExpiry: userWithTokens.googleTokenExpiry,
        isTokenExpired,
        // 不返回实际的token值，只返回是否存在
      }
    });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withCors(handleGetUserTokens);

// 处理CORS预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
