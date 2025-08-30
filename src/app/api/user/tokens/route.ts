import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '../../../lib/jwt';
import { getDb } from '../../../lib/database';
import { getCorsHeaders } from '../../../lib/cors';

export async function GET(request: NextRequest) {
  try {
    // Validate JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No valid authorization header' },
        { 
          status: 401,
          headers: getCorsHeaders(request)
        }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { 
          status: 401,
          headers: getCorsHeaders(request)
        }
      );
    }

    // Retrieve user information from the database
    const db = getDb();
    const user = await db.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { 
          status: 404,
          headers: getCorsHeaders(request)
        }
      );
    }

    // Check whether the token has expired (using type assertion to access possible fields)
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
        // Return only whether tokens exist, not their actual values
      }
    }, {
      headers: getCorsHeaders(request)
    });

  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { 
        status: 500,
        headers: getCorsHeaders(request)
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
