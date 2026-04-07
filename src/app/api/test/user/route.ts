import { NextRequest, NextResponse } from 'next/server';
import { withCors, getCorsHeaders } from '../../../lib/cors';
import { UserService } from '../../../lib/services/user';
import { getDb } from '../../../lib/database';
const isProd = process.env.NODE_ENV === 'production';
async function handleCreateUser(request: NextRequest): Promise<Response> {
  if (isProd) {
    return new NextResponse(null, { status: 404 });
  }
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
    const db = await getDb();
    const id = `test_${Date.now()}`;
    const prismaUser = await db.user.upsert({
      where: { id },
      update: {
        email,
        name: name || 'Test User',
        picture: picture || '',
        updatedAt: new Date()
      },
      create: {
        id,
        email,
        name: name || 'Test User',
        picture: picture || ''
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name || '',
        picture: prismaUser.picture || ''
      }
    });
  } catch (error) {
    console.error('Test user creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test user' },
      { status: 500 }
    );
  }
}

async function handleGetUsers(request: NextRequest): Promise<Response> {

  if (isProd) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    // 获取所有用户（仅用于测试）
    const db = await getDb();
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

export const POST = withCors(handleCreateUser);
export const GET = withCors(handleGetUsers);

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
