import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { withCors, getCorsHeaders } from '../../../lib/cors';
import { TodoService } from '../../../lib/services/todo';
import type { JWTPayload, SubTodo } from '../../../types/api';

// 创建子todo
async function handleCreateSubTodo(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { 
      parentId?: string; 
      subId?: string; 
      subText?: string; 
      createdDate?: string; 
      startTime?: string; 
      endTime?: string; 
      description?: string 
    };
    const { parentId, subId, subText, createdDate, startTime, endTime, description } = body;
    
    if (!parentId || !subId || !subText || !createdDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: parentId, subId, subText, createdDate' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    const newSubTodo = await todoService.addSubTodo(user.sub, parentId, {
      subId,
      subText,
      createdDate,
      startTime,
      endTime,
      description
    });
    
    return NextResponse.json({
      success: true,
      data: newSubTodo
    }, { status: 201 });
  } catch (error) {
    console.error('Create sub todo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sub todo' },
      { status: 500 }
    );
  }
}

// 更新子todo
async function handleUpdateSubTodo(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { 
      parentId?: string; 
      subId?: string; 
      text?: string; 
      completed?: boolean; 
      focus?: boolean; 
      startTime?: string; 
      endTime?: string; 
      description?: string 
    };
    const { parentId, subId, text, completed, focus, startTime, endTime, description } = body;
    
    if (!parentId || !subId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: parentId, subId' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    let result;
    
    if (typeof completed === 'boolean') {
      result = await todoService.toggleSubTodo(user.sub, parentId, subId, completed);
    } else {
      // 更新其他字段
      result = await todoService.updateSubTodo(user.sub, parentId, subId, {
        text,
        focus,
        startTime,
        endTime,
        description
      });
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update sub todo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sub todo' },
      { status: 500 }
    );
  }
}

// 删除子todo
async function handleDeleteSubTodo(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { parentId?: string; subId?: string };
    const { parentId, subId } = body;
    
    if (!parentId || !subId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: parentId, subId' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    await todoService.deleteSubTodo(user.sub, parentId, subId);
    
    return NextResponse.json({
      success: true,
      data: { id: subId }
    });
  } catch (error) {
    console.error('Delete sub todo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sub todo' },
      { status: 500 }
    );
  }
}

export const POST = withCors(withAuth(handleCreateSubTodo));
export const PUT = withCors(withAuth(handleUpdateSubTodo));
export const DELETE = withCors(withAuth(handleDeleteSubTodo));

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
