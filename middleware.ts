import { NextRequest, NextResponse } from 'next/server'
import { getCorsHeaders, getCorsOptionsHeaders } from './src/app/lib/cors'

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests for all API routes
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsOptionsHeaders(request),
    })
  }

  // Continue processing other requests
  const response = NextResponse.next()
  
  // Add CORS headers to all API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const corsHeaders = getCorsHeaders(request)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (typeof value === 'string') {
        response.headers.set(key, value)
      }
    })
  }

  return response
}

export const config = {
  matcher: '/api/:path*'
}
