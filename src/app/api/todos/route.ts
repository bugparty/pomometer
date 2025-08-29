import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../lib/auth';
import { TodoService } from '../../lib/services';
import type { JWTPayload, TodosResponse, Todo } from '../../types/api';

// 获取用户todos
async function handleGetTodos(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const todoService = new TodoService();
    const todos = await todoService.getUserTodos(user.sub);
    
    const response: TodosResponse = {
      success: true,
      data: {
        todos: todos,
        lastSyncTime: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get todos error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get todos' },
      { status: 500 }
    );
  }
}

// 创建新todo
async function handleCreateTodo(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { id?: string; text?: string; createdDate?: string };
    const { id, text, createdDate } = body;
    
    if (!id || !text || !createdDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, text, createdDate' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    const newTodo = await todoService.addTodo(user.sub, { id, text, createdDate });
    
    const response: TodosResponse = {
      success: true,
      data: {
        todos: [newTodo],
        lastSyncTime: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

// 更新todo
async function handleUpdateTodo(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { id?: string; text?: string; completed?: boolean; focus?: boolean };
    const { id, text, completed, focus } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing todo id' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    let result;
    
    if (typeof completed === 'boolean') {
      result = await todoService.toggleTodo(user.sub, id, completed);
    } else if (text !== undefined || focus !== undefined) {
      // 更新文本或焦点状态
      result = await todoService.updateTodo(user.sub, id, { text, focus });
    } else {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const response: TodosResponse = {
      success: true,
      data: {
        todos: [],
        lastSyncTime: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Update todo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// 删除todo
async function handleDeleteTodo(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const body = await request.json() as { id?: string };
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing todo id' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    await todoService.deleteTodo(user.sub, id);
    
    const response: TodosResponse = {
      success: true,
      data: {
        todos: [],
        lastSyncTime: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Delete todo error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGetTodos);
export const POST = withAuth(handleCreateTodo);
export const PUT = withAuth(handleUpdateTodo);
export const DELETE = withAuth(handleDeleteTodo);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
