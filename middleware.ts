import { NextRequest, NextResponse } from 'next/server'
import { getCorsHeaders, getCorsOptionsHeaders } from './src/app/lib/cors'

export function middleware(request: NextRequest) {
  // 处理所有API路由的CORS预检请求
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsOptionsHeaders(request),
    })
  }

  // 对于其他请求，继续处理
  const response = NextResponse.next()
  
  // 为所有API响应添加CORS头
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
