import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { TodoService } from '../../../lib/services';
import type { JWTPayload } from '../../../types/api';

// 批量操作
async function handleBatchOperations(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
interface BatchOperation {
  type: string;
  todoIds: string[];
  data?: {
    completed?: boolean;
    focus?: boolean;
  };
}

interface BatchResult {
  type: string;
  count: number;
  completed?: boolean;
  focus?: boolean;
}

interface BatchError {
  operation: BatchOperation;
  error: string;
}

    const body = await request.json() as { operations?: BatchOperation[] };
    const { operations } = body;
    
    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operations format' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    const results: BatchResult[] = [];
    const errors: BatchError[] = [];

    // 处理批量操作
    for (const operation of operations) {
      const { type, todoIds, data } = operation;
      
      try {
        switch (type) {
          case 'BATCH_DELETE':
            for (const todoId of todoIds) {
              await todoService.deleteTodo(user.sub, todoId);
            }
            results.push({ type, count: todoIds.length });
            break;
            
          case 'BATCH_TOGGLE':
            if (data?.completed !== undefined) {
              for (const todoId of todoIds) {
                await todoService.toggleTodo(user.sub, todoId, data.completed);
              }
              results.push({ type, count: todoIds.length, completed: data.completed });
            } else {
              errors.push({ operation, error: 'Missing completed status for BATCH_TOGGLE' });
            }
            break;
            
          case 'BATCH_UPDATE_FOCUS':
            if (data?.focus !== undefined) {
              for (const todoId of todoIds) {
                await todoService.updateTodo(user.sub, todoId, { focus: data.focus });
              }
              results.push({ type, count: todoIds.length, focus: data.focus });
            } else {
              errors.push({ operation, error: 'Missing focus status for BATCH_UPDATE_FOCUS' });
            }
            break;
            
          case 'BATCH_MOVE_TO_FOCUS':
            // 将所有选中的 todo 移动到焦点状态
            for (const todoId of todoIds) {
              await todoService.updateTodo(user.sub, todoId, { focus: true });
            }
            results.push({ type, count: todoIds.length });
            break;
            
          default:
            errors.push({ operation, error: `Unknown operation type: ${type}` });
            continue;
        }
        
      } catch (error) {
        console.error(`Failed to process batch operation ${type}:`, error);
        errors.push({
          operation,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const response = {
      success: true,
      data: {
        results,
        errors,
        totalProcessed: results.length,
        totalErrors: errors.length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch operations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process batch operations' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleBatchOperations);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
