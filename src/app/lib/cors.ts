import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取CORS头部配置
 * @param request NextRequest对象
 * @param additionalHeaders 额外的头部配置
 * @returns 头部配置对象
 */
export function getCorsHeaders(
  request: NextRequest, 
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...additionalHeaders,
  };
  
  return headers;
}

/**
 * 获取预检请求的CORS头部配置
 * @param request NextRequest对象
 * @returns 头部配置对象
 */
export function getCorsOptionsHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24小时缓存预检结果
  };

  return headers;
}

/**
 * 为给定的处理函数添加统一的CORS头
 * @param handler 原始请求处理函数
 * @returns 包装后的处理函数
 */
export function withCors<Args extends unknown[]>(
  handler: (request: NextRequest, ...args: Args) => Promise<Response> | Response,
) {
  return async (request: NextRequest, ...args: Args) => {
    try {
      const response = await handler(request, ...args);
      const corsHeaders = getCorsHeaders(request);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500, headers: getCorsHeaders(request) },
      );
    }
  };
}

/**
 * 检查请求来源是否被允许 (现在允许所有来源)
 * @param request NextRequest对象
 * @returns 始终返回true，允许所有来源
 */
export function isOriginAllowed(request: NextRequest): boolean {
  return true; // 允许所有来源
}
