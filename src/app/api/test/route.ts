import { NextRequest, NextResponse } from 'next/server';
import { withCors, getCorsHeaders } from '../../lib/cors';
const isProd = process.env.NODE_ENV === 'production';
async function handleTest(request: NextRequest): Promise<Response> {
  if (isProd) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

export const GET = withCors(handleTest);

export async function OPTIONS(request: NextRequest) {
  if (isProd) {
    return new NextResponse(null, { status: 404 });
  }
  
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
