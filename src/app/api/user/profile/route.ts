import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import type { JWTPayload } from '../../../types/api';

// Fetch user information
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

export const GET = withAuth(handleGetUserProfile);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
