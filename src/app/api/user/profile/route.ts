import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { withCors, getCorsHeaders } from '../../../lib/cors';
import type { JWTPayload } from '../../../types/api';

// 获取用户信息
async function handleGetUserProfile(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    return NextResponse.json({
      success: true,
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

export const GET = withCors(withAuth(handleGetUserProfile));

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
