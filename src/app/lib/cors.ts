import { NextRequest } from 'next/server';

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
 * 检查请求来源是否被允许 (现在允许所有来源)
 * @param request NextRequest对象
 * @returns 始终返回true，允许所有来源
 */
export function isOriginAllowed(request: NextRequest): boolean {
  return true; // 允许所有来源
}
