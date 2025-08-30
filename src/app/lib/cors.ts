import { NextRequest } from 'next/server';

/**
 * Get CORS header configuration
 * @param request NextRequest object
 * @param additionalHeaders Additional headers
 * @returns Header configuration object
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
 * Get CORS headers for preflight requests
 * @param request NextRequest object
 * @returns Header configuration object
 */
export function getCorsOptionsHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // Cache preflight results for 24 hours
  };
  
  return headers;
}

/**
 * Check whether the request origin is allowed (currently allows all origins)
 * @param request NextRequest object
 * @returns Always true, allowing all origins
 */
export function isOriginAllowed(request: NextRequest): boolean {
  return true; // Allow all origins
}
