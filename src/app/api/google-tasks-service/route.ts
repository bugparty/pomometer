// API route for Google Tasks access using Service Account
// This allows CI/agents to access Google Tasks without user OAuth

import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, withCors } from '../../lib/cors';
import {
  getTaskListsWithServiceAccount,
  getTasksWithServiceAccount,
  createTaskWithServiceAccount,
  getOrCreateServiceAccountTaskList,
  deleteServiceAccountTask,
  updateServiceAccountTask,
  createServiceAccountTask,
  createServiceAccountTaskList,
  getServiceAccountAccessToken,
  GoogleTask,
} from '../../lib/googleServiceAccount';

/**
 * GET /api/google-tasks-service
 *
 * Query params:
 * - action: 'list' (task lists) | 'tasks' (tasks in a list)
 * - tasklistId: ID of task list (required for 'tasks' action)
 * - listName: Name of list to get or create (optional)
 */
async function handleGoogleTasksGet(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tasklistId = searchParams.get('tasklistId');
    const listName = searchParams.get('listName');

    console.log('[GoogleTasksService] GET request with action:', action);

    switch (action) {
      case 'list': {
        const lists = await getTaskListsWithServiceAccount();
        return NextResponse.json({ success: true, data: lists });
      }

      case 'tasks': {
        if (!tasklistId) {
          return NextResponse.json(
            { success: false, error: 'tasklistId parameter is required' },
            { status: 400 }
          );
        }
        const tasks = await getTasksWithServiceAccount(tasklistId);
        return NextResponse.json({ success: true, data: tasks });
      }

      case 'get-or-create-list': {
        if (!listName) {
          return NextResponse.json(
            { success: false, error: 'listName parameter is required' },
            { status: 400 }
          );
        }
        const list = await getOrCreateServiceAccountTaskList(listName);
        return NextResponse.json({ success: true, data: list });
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: list, tasks, get-or-create-list' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('[GoogleTasksService] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const GET = withCors(handleGoogleTasksGet);

/**
 * POST /api/google-tasks-service
 *
 * Body:
 * - action: 'create-task' | 'create-list' | 'update-task' | 'delete-task'
 * - tasklistId: ID of task list (required for task operations)
 * - title: Task title (required for create-task)
 * - notes: Task notes (optional for create-task)
 * - taskId: Task ID (required for update-task, delete-task)
 * - updates: Updates object (required for update-task)
 * - listTitle: List title (required for create-list)
 */
async function handleGoogleTasksPost(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json() as {
      action: string;
      tasklistId?: string;
      title?: string;
      notes?: string;
      taskId?: string;
      updates?: Partial<GoogleTask>;
      listTitle?: string;
    };

    const { action, tasklistId, title, notes, taskId, updates, listTitle } = body;

    console.log('[GoogleTasksService] POST request with action:', action);

    const accessToken = await getServiceAccountAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Failed to create Service Account access token' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'create-task': {
        if (!tasklistId || !title) {
          return NextResponse.json(
            { success: false, error: 'tasklistId and title are required' },
            { status: 400 }
          );
        }
        const task = await createServiceAccountTask(accessToken, tasklistId, { title, notes });
        return NextResponse.json({ success: true, data: task });
      }

      case 'create-list': {
        if (!listTitle) {
          return NextResponse.json(
            { success: false, error: 'listTitle is required' },
            { status: 400 }
          );
        }
        const list = await createServiceAccountTaskList(accessToken, listTitle);
        return NextResponse.json({ success: true, data: list });
      }

      case 'update-task': {
        if (!tasklistId || !taskId || !updates) {
          return NextResponse.json(
            { success: false, error: 'tasklistId, taskId, and updates are required' },
            { status: 400 }
          );
        }
        const task = await updateServiceAccountTask(accessToken, tasklistId, taskId, updates);
        return NextResponse.json({ success: true, data: task });
      }

      case 'delete-task': {
        if (!tasklistId || !taskId) {
          return NextResponse.json(
            { success: false, error: 'tasklistId and taskId are required' },
            { status: 400 }
          );
        }
        await deleteServiceAccountTask(accessToken, tasklistId, taskId);
        return NextResponse.json({ success: true, message: 'Task deleted' });
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Use: create-task, create-list, update-task, delete-task',
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('[GoogleTasksService] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const POST = withCors(handleGoogleTasksPost);

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
