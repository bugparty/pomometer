import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { TodoService, OperationService } from '../../../lib/services';
import type { JWTPayload, SyncOperationsRequest, SyncResponse } from '../../../types/api';

// 同步操作
async function handleSyncOperations(request: NextRequest, user: JWTPayload): Promise<Response> {
  try {
    const { operations, lastSyncTime } = await request.json() as SyncOperationsRequest;
    
    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operations format' },
        { status: 400 }
      );
    }

    const todoService = new TodoService();
    const operationService = new OperationService();
    const serverOperations: unknown[] = [];
    const conflicts: unknown[] = [];

    // 处理每个操作
    for (const operation of operations) {
      const { type, payload, timestamp } = operation;
      
      // 类型断言，因为我们知道不同操作类型的payload结构
      const typedPayload = payload as {
        id?: string;
        text?: string;
        completed?: boolean;
        checked?: boolean;
        focus?: boolean;
        createdDate?: string;
        parentId?: string;
        subId?: string;
        subText?: string;
        startTime?: string;
        endTime?: string;
        description?: string;
      };
      
      try {
        switch (type) {
          // 添加/更新/删除主 TODO
          case 'ADD_TODO':
            await todoService.addTodo(user.sub, {
              id: typedPayload.id!,
              text: typedPayload.text!,
              createdDate: typedPayload.createdDate!
            });
            break;
          case 'UPDATE_TODO':
          case 'TOGGLE_TODO': // 客户端使用 TOGGLE_TODO
            if (typeof typedPayload.completed === 'boolean') {
              await todoService.toggleTodo(user.sub, typedPayload.id!, typedPayload.completed);
            } else if (typedPayload.text !== undefined || typedPayload.focus !== undefined) {
              await todoService.updateTodo(user.sub, typedPayload.id!, {
                text: typedPayload.text,
                focus: typedPayload.focus
              });
            }
            break;
          case 'DELETE_TODO':
            await todoService.deleteTodo(user.sub, typedPayload.id!);
            break;

          // 子 TODO 操作
          case 'ADD_SUB_TODO':
            // 旧客户端 payload 中父级ID字段为 id (非 parentId)
            await todoService.addSubTodo(user.sub, typedPayload.parentId || typedPayload.id!, {
              subId: typedPayload.subId!,
              subText: typedPayload.subText!,
              createdDate: typedPayload.createdDate!,
              startTime: typedPayload.startTime,
              endTime: typedPayload.endTime,
              description: typedPayload.description
            });
            break;
          case 'UPDATE_SUB_TODO':
          case 'TOGGLE_SUB_TODO': // 客户端使用 TOGGLE_SUB_TODO
          case 'EDIT_SUB_TODO': // 客户端编辑子 todo
            // 处理 completed 或 checked 字段（客户端可能发送其中任一字段）
            const completedValue = typedPayload.completed ?? typedPayload.checked;
            if (typeof completedValue === 'boolean') {
              await todoService.toggleSubTodo(user.sub, typedPayload.parentId || typedPayload.id!, typedPayload.subId!, completedValue);
            } else {
              await todoService.updateSubTodo(user.sub, typedPayload.parentId || typedPayload.id!, typedPayload.subId!, {
                text: typedPayload.text,
                focus: typedPayload.focus,
                startTime: typedPayload.startTime,
                endTime: typedPayload.endTime,
                description: typedPayload.description
              });
            }
            break;
          case 'DELETE_SUB_TODO':
            await todoService.deleteSubTodo(user.sub, typedPayload.parentId || typedPayload.id!, typedPayload.subId!);
            break;
          default:
            console.warn(`Unknown operation type: ${type}`);
            continue;
        }

        // 记录操作到数据库
        await operationService.logOperation(user.sub, type, payload as import("../../../types/api").OperationPayload, timestamp);
        
      } catch (error) {
        console.error(`Failed to process operation ${type}:`, error);
        conflicts.push({
          operation,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 获取服务器端的操作记录（用于冲突检测）
    const serverOps = await operationService.getOperationsSince(user.sub, lastSyncTime);
    
    // 精确过滤：只过滤掉与当前请求中操作完全匹配且时间戳非常接近的操作
    // 这防止用户刚提交的操作立即被错误地返回并重新应用
    const filteredServerOps = serverOps.filter(serverOp => {
      const opTime = new Date(serverOp.timestamp).getTime();
      const now = Date.now();
      const timeDiff = Math.abs(now - opTime);
      
      // 如果操作时间差超过10秒，肯定不是当前请求的操作
      if (timeDiff > 10000) {
        return true;
      }
      
      // 在10秒内，检查是否与当前请求的操作匹配
      for (const clientOp of operations) {
        if (serverOp.type === clientOp.type) {
          // 对于TOGGLE_SUB_TODO，比较关键字段
          if (serverOp.type === 'TOGGLE_SUB_TODO') {
            const serverPayload = serverOp.payload as { subId?: string; id?: string };
            const clientPayload = clientOp.payload as { subId?: string; id?: string };
            
            if (serverPayload.subId === clientPayload.subId && 
                serverPayload.id === clientPayload.id &&
                timeDiff < 3000) { // 3秒内的相同子任务操作
              console.log(`[Sync] Filtering duplicate TOGGLE_SUB_TODO: ${serverPayload.subId}`);
              return false;
            }
          }
          // 可以为其他操作类型添加类似的逻辑
        }
      }
      
      return true;
    });
    
    console.log(`[Sync] Filtered ${serverOps.length - filteredServerOps.length} duplicate operations from ${serverOps.length} total`);
    serverOperations.push(...filteredServerOps);

    const response: SyncResponse = {
      success: true,
      data: {
        conflicts,
        serverOperations,
        lastSyncTime: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Sync operations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync operations' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleSyncOperations);

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
