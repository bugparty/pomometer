import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; name?: string; picture?: string };
    const { email, name, picture } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // 创建测试用户
    const userService = new UserService();
    const user = await userService.upsertUser({
      sub: `test_${Date.now()}`,
      email,
      name: name || 'Test User',
      picture: picture || ''
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user
    });
  } catch (error) {
    console.error('Test user creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userService = new UserService();
    
    // 获取所有用户（仅用于测试）
    const db = await import('../../../lib/database').then(m => m.getDb());
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Test user fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
