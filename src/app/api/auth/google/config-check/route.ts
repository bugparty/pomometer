import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const nextPublicGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const jwtSecret = process.env.JWT_SECRET;

    const checkStatus = (value: string | undefined, name: string) => {
      if (!value) {
        return { status: 'missing', message: `${name} is not set` };
      }
      if (value.includes('YOUR_') || value.includes('PLACEHOLDER')) {
        return { status: 'placeholder', message: `${name} contains placeholder value` };
      }
      return { status: 'configured', message: `${name} is properly configured`, length: value.length };
    };

    const config = {
      GOOGLE_CLIENT_ID: checkStatus(googleClientId, 'GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: checkStatus(googleClientSecret, 'GOOGLE_CLIENT_SECRET'),
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: checkStatus(nextPublicGoogleClientId, 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
      JWT_SECRET: checkStatus(jwtSecret, 'JWT_SECRET'),
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    };

    // 检查关键配置是否都存在
    const criticalMissing = [
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.JWT_SECRET
    ].filter(item => item.status === 'missing');

    const overallStatus = criticalMissing.length > 0 ? 'error' : 'ok';

    return NextResponse.json({
      success: true,
      status: overallStatus,
      config,
      criticalMissing: criticalMissing.length,
      message: overallStatus === 'error' 
        ? `${criticalMissing.length} critical environment variables are missing`
        : 'All critical environment variables are configured'
    });

  } catch (error) {
    console.error('Config check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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
