import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';
import type { JWTPayload } from '../types/api';

// Extract and verify JWT token from the request headers
export function authenticateRequest(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const userInfo = verifyJWT(token);
    
    return userInfo;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Create authentication middleware
export function withAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = authenticateRequest(request);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return handler(request, user);
  };
}
