import { getDb } from './database';
import type {
  User,
  Todo,
  SubTodo,
  Operation,
  UserSettings,
  GoogleUserInfo,
  SyncOperation
} from '../types/api';
import { v4 as uuidv4 } from 'uuid';
import { getOrCreatePomometerTaskList } from './googleTasks';
import type { SubTodo as PrismaSubTodo, Prisma } from '@prisma/client';
const GOOGLE_TASKS_API_BASE = 'https://www.googleapis.com/tasks/v1';

// Google Tasks API 数据类型定义
interface GoogleTaskLink {
  type: string;
  description?: string;
  link: string;
}

interface GoogleTask {
  kind: 'tasks#task';
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
  parent?: string;
  position: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  links?: GoogleTaskLink[];
  webViewLink: string;
}

interface GoogleTasksListResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  items?: GoogleTask[];
}

// 本地数据同步类型定义
interface LocalTodoSync {
  id: string;
  googleTaskId: string | null;
}

interface LocalSubTodoSync {
  id: string;
  todoId: string;
  googleTaskId: string | null;
}

interface TodoUpdateData {
  text?: string;
  completed?: boolean;
  updatedDate?: Date;
}

interface SubTodoUpdateData {
  text?: string;
  completed?: boolean;
  updatedDate?: Date;
}

// 用户相关操作
export class UserService {
  // 创建或更新用户
  async upsertUser(userInfo: GoogleUserInfo): Promise<User> {
    const db = getDb();
    const { sub: id, email, name, picture } = userInfo;

    const user = await db.user.upsert({
      where: { id },
      update: {
        email,
        name,
        picture,
        updatedAt: new Date()
      },
      create: {
        id,
        email,
        name,
        picture
      }
    });

    // 转换为API类型
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      picture: user.picture || ''
    };
  }

  // 创建或更新用户并存储Google tokens
  async upsertUserWithTokens(userInfo: GoogleUserInfo, tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }): Promise<User> {
    const db = getDb();
    const { sub: id, email, name, picture } = userInfo;

    // 计算token过期时间
    const tokenExpiry = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 3600 * 1000); // 默认1小时

    const user = await db.user.upsert({
      where: { id },
      update: {
        email,
        name,
        picture,
        googleAccessToken: tokenData.access_token,
        googleRefreshToken: tokenData.refresh_token || undefined,
        googleTokenExpiry: tokenExpiry,
        updatedAt: new Date()
      },
      create: {
        id,
        email,
        name,
        picture,
        googleAccessToken: tokenData.access_token,
        googleRefreshToken: tokenData.refresh_token || undefined,
        googleTokenExpiry: tokenExpiry
      }
    });

    // 在后台初始化Google Tasks专用列表
    this.initializeGoogleTasks(id).catch(error => {
      console.error(`[GoogleTasks] Failed to initialize for user ${id}:`, error);
    });

    // 转换为API类型
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      picture: user.picture || ''
    };
  }

  // 初始化用户的Google Tasks设置（在后台运行）
  private async initializeGoogleTasks(userId: string): Promise<void> {
    try {
      console.log(`[GoogleTasks] Initializing Google Tasks for user ${userId}`);

      // 使用TodoService的方法来获取或创建专用列表
      const todoService = new TodoService();
      const pomometerListId = await todoService.getOrCreatePomometerListId(userId);

      if (pomometerListId) {
        console.log(`[GoogleTasks] Successfully initialized AA Pomometer list for user ${userId}`);
      } else {
        console.log(`[GoogleTasks] Could not initialize AA Pomometer list for user ${userId}`);
      }
    } catch (error) {
      console.error(`[GoogleTasks] Error initializing Google Tasks for user ${userId}:`, error);
    }
  }

  // 根据ID获取用户
  async getUserById(userId: string): Promise<User | null> {
    const db = getDb();
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) return null;

    // 转换为API类型
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      picture: user.picture || ''
    };
  }
}

// Todo相关操作
export class TodoService {
  // 防抖同步控制
  private lastSyncTimes: Map<string, number> = new Map();
  private readonly MIN_SYNC_INTERVAL = 2000; // 最小同步间隔：2秒

  // 近期更新的任务保护列表 - 避免被轻量同步覆盖
  private recentlyUpdatedTasks: Map<string, number> = new Map();
  private readonly PROTECTION_PERIOD = 5000; // 保护期：5秒，让双向同步更灵活

  private async getUserGoogleToken(userId: string): Promise<string | null> {
    const db = getDb();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleTokenExpiry: true
      }
    });

    if (!user?.googleAccessToken) {
      console.log(`[GoogleTasks] No access token found for user ${userId}`);
      return null;
    }

    // 检查 token 是否过期
    if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
      console.log(`[GoogleTasks] Access token expired for user ${userId}`);
      return null;
    }

    console.log(`[GoogleTasks] Found valid access token for user ${userId}`);
    return user.googleAccessToken;
  }

  // 获取或创建专用的AA Pomometer列表ID
  async getOrCreatePomometerListId(userId: string): Promise<string | null> {
    const token = await this.getUserGoogleToken(userId);
    if (!token) {
      return null;
    }

    const db = getDb();

    try {
      // 首先检查数据库中是否已存储了列表ID
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { googlePomometerListId: true }
      });

      if (user?.googlePomometerListId) {
        console.log(`[GoogleTasks] Found cached pomometer list ID: ${user.googlePomometerListId}`);
        return user.googlePomometerListId;
      }

      // 如果数据库中没有，则调用Google API获取或创建
      console.log(`[GoogleTasks] No cached list ID found, fetching from Google API`);
      const pomometerList = await getOrCreatePomometerTaskList(token);

      // 将获取到的列表ID存储到数据库
      await db.user.update({
        where: { id: userId },
        data: { googlePomometerListId: pomometerList.id }
      });

      console.log(`[GoogleTasks] Cached pomometer list ID: ${pomometerList.id}`);
      return pomometerList.id;
    } catch (error) {
      console.error('[GoogleTasks] Failed to get or create pomometer list:', error);
      return null;
    }
  }
  // 获取用户的所有todos
  async getUserTodos(userId: string): Promise<Todo[]> {
    const db = getDb();

    const todos = await db.todo.findMany({
      where: {
        userId,
        deleted: false
      },
      include: {
        subItems: {
          where: { deleted: false },
          orderBy: { createdDate: 'asc' }
        }
      },
      orderBy: { createdDate: 'desc' }
    });

    // 转换为API类型
    return todos.map(todo => ({
      id: todo.id,
      user_id: todo.userId,
      text: todo.text,
      completed: todo.completed,
      deleted: todo.deleted,
      focus: todo.focus,
      created_date: todo.createdDate.toISOString(),
      updated_date: todo.updatedDate.toISOString(),
      google_task_list_id: todo.googleTaskListId || undefined,
      googleTaskListId: todo.googleTaskListId || undefined,
      subItems: todo.subItems.map((sub: PrismaSubTodo) => ({
        id: sub.id,
        todo_id: sub.todoId,
        text: sub.text,
        completed: sub.completed,
        deleted: sub.deleted,
        focus: sub.focus,
        created_date: sub.createdDate.toISOString(),
        updated_date: sub.updatedDate.toISOString(),
        startTime: sub.startTime?.toISOString(),
        endTime: sub.endTime?.toISOString(),
        description: sub.description || undefined,
        google_task_id: sub.googleTaskId || undefined,
        googleTaskId: sub.googleTaskId || undefined
      }))
    }));
  }

  // 添加todo
  async addTodo(userId: string, todoData: { id: string; text: string; createdDate: string }): Promise<Todo> {
    const db = getDb();
    debugger;
    const { id, text, createdDate } = todoData;
    let googleTaskId: string | undefined;

    console.log(`[GoogleTasks] Creating new todo for user ${userId}: "${text}"`);

    // 检查todo是否已存在
    const existingTodo = await db.todo.findFirst({
      where: { id, userId },
      include: { subItems: true }
    });

    if (existingTodo) {
      console.log(`[GoogleTasks] Todo with ID ${id} already exists, returning existing todo`);
      // 转换并返回已存在的todo
      return {
        id: existingTodo.id,
        user_id: existingTodo.userId,
        text: existingTodo.text,
        completed: existingTodo.completed,
        deleted: existingTodo.deleted,
        focus: existingTodo.focus,
        created_date: existingTodo.createdDate.toISOString(),
        updated_date: existingTodo.updatedDate.toISOString(),
        google_task_id: existingTodo.googleTaskId || undefined,
        googleTaskId: existingTodo.googleTaskId || undefined,
        subItems: existingTodo.subItems.map((sub: PrismaSubTodo) => ({
          id: sub.id,
          todo_id: sub.todoId,
          text: sub.text,
          completed: sub.completed,
          deleted: sub.deleted,
          focus: sub.focus,
          created_date: sub.createdDate.toISOString(),
          updated_date: sub.updatedDate.toISOString(),
          startTime: sub.startTime?.toISOString(),
          endTime: sub.endTime?.toISOString(),
          description: sub.description || undefined
        }))
      };
    }

    // 获取专用的AA Pomometer列表ID
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    if (pomometerListId) {
      console.log(`[GoogleTasks] Attempting to create Google Task in AA Pomometer list: "${text}"`);
      try {
        const res = await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await this.getUserGoogleToken(userId)}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: text })
        });

        if (res.ok) {
          const data = await res.json() as { id: string };
          googleTaskId = data.id;
          console.log(`[GoogleTasks] Successfully created Google Task with ID: ${googleTaskId}`);
        } else {
          const errorText = await res.text();
          console.error(`[GoogleTasks] Failed to create Google Task. Status: ${res.status}, Response: ${errorText}`);
        }
      } catch (e) {
        console.error('[GoogleTasks] Create Google Task failed:', e);
      }
    } else {
      console.log(`[GoogleTasks] No valid token or pomometer list available, skipping Google Tasks creation`);
    }

    const todo = await db.todo.create({
      data: {
        id,
        userId,
        text,
        createdDate: new Date(createdDate),
        googleTaskId
      } satisfies Prisma.TodoUncheckedCreateInput,
      include: {
        subItems: true
      }
    });

    console.log(`[GoogleTasks] Local todo created with ID: ${todo.id}, Google Task ID: ${todo.googleTaskId || 'none'}`);

    // 🔥 新增：在后台执行轻量级同步，排除刚创建的任务
    this.debouncedSync(userId, googleTaskId ? [googleTaskId] : undefined);

    // 转换为API类型
    return {
      id: todo.id,
      user_id: todo.userId,
      text: todo.text,
      completed: todo.completed,
      deleted: todo.deleted,
      focus: todo.focus,
      created_date: todo.createdDate.toISOString(),
      updated_date: todo.updatedDate.toISOString(),
      google_task_id: todo.googleTaskId || undefined,
      googleTaskId: todo.googleTaskId || undefined,
      subItems: todo.subItems.map((sub) => ({
        id: sub.id,
        todo_id: sub.todoId,
        text: sub.text,
        completed: sub.completed,
        deleted: sub.deleted,
        focus: sub.focus,
        created_date: sub.createdDate.toISOString(),
        updated_date: sub.updatedDate.toISOString(),
        startTime: sub.startTime?.toISOString(),
        endTime: sub.endTime?.toISOString(),
        description: sub.description || undefined
      }))
    };
  }

  // 切换todo完成状态
  async toggleTodo(userId: string, todoId: string, completed: boolean): Promise<{ id: string; completed: boolean }> {
    const db = getDb();

    // 获取todo信息，需要Google Task ID
    const todo = await db.todo.findFirst({
      where: { id: todoId, userId }
    });

    if (!todo) {
      throw new Error('Todo not found');
    }

    // 更新本地数据库 (父任务)
    await db.todo.update({
      where: {
        id: todoId,
        userId
      },
      data: {
        completed,
        updatedDate: new Date()
      }
    });

    // 级联更新：将所有子任务的完成状态与父任务保持一致
    const subTodos = await db.subTodo.findMany({ where: { todoId } });
    if (subTodos && subTodos.length > 0) {
      for (const sub of subTodos) {
        if (sub.completed !== completed) {
          await db.subTodo.update({
            where: { id: sub.id, todoId },
            data: { completed, updatedDate: new Date() }
          });
        }
      }
    }

    // 同步到Google Tasks
    const token = await this.getUserGoogleToken(userId);
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    // 🔥 重要：无论Google Tasks同步是否成功，都先添加保护
    if (todo.googleTaskId) {
      this.recentlyUpdatedTasks.set(todo.googleTaskId, Date.now());
      console.log(`[GoogleTasks] Added todo to protection list: ${todo.text} (${todo.googleTaskId})`);
    }

    if (token && pomometerListId && todo.googleTaskId) {
      try {
        await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${todo.googleTaskId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: completed ? 'completed' : 'needsAction'
          })
        });
        console.log(`[GoogleTasks] Updated todo status: ${todo.text} -> ${completed ? 'completed' : 'active'}`);

        // 保护已在上面添加，这里不需要重复

      } catch (e) {
        console.error('Update Google Task status failed:', e);
      }
    }

    // 同步子任务到 Google Tasks（如果有 token 和 list）
    if (token && pomometerListId && subTodos && subTodos.length > 0) {
      for (const sub of subTodos) {
        try {
          if (sub.googleTaskId) {
            this.recentlyUpdatedTasks.set(sub.googleTaskId, Date.now());
            await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${sub.googleTaskId}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: completed ? 'completed' : 'needsAction' })
            });
          }
        } catch (e) {
          console.error('Update Google SubTask status failed:', e);
        }
      }
    }

    // 🔥 延迟触发轻量级同步，给Google Tasks时间更新
    setTimeout(() => {
      const excludeIds: string[] = []
      if (todo.googleTaskId) excludeIds.push(todo.googleTaskId)
      for (const sub of subTodos) {
        if (sub.googleTaskId) excludeIds.push(sub.googleTaskId)
      }
      this.debouncedSync(userId, excludeIds.length > 0 ? excludeIds : undefined);
    }, 1000);

    return { id: todoId, completed };
  }

  // 删除todo
  async deleteTodo(userId: string, todoId: string): Promise<{ id: string }> {
    const db = getDb();

    const token = await this.getUserGoogleToken(userId);
    const todo = await db.todo.findFirst({ where: { id: todoId, userId } });
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    if (token && pomometerListId && todo?.googleTaskId) {
      try {
        await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${todo.googleTaskId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`[GoogleTasks] Deleted Google Task: ${todo.googleTaskId}`);
      } catch (e) {
        console.error('Delete Google Task failed:', e);
      }
    }

    await db.todo.update({
      where: {
        id: todoId,
        userId
      },
      data: {
        deleted: true,
        updatedDate: new Date()
      }
    });

    // 🔥 新增：在后台执行轻量级同步
    this.debouncedSync(userId);

    return { id: todoId };
  }  // 更新todo
  async updateTodo(userId: string, todoId: string, updates: { text?: string; focus?: boolean }): Promise<{ id: string }> {
    const db = getDb();
    const current = await db.todo.findFirst({ where: { id: todoId, userId } });
    const updateData: { updatedDate: Date; text?: string; focus?: boolean } = { updatedDate: new Date() };
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.focus !== undefined) updateData.focus = updates.focus;

    await db.todo.update({
      where: {
        id: todoId,
        userId
      },
      data: updateData
    });

    const token = await this.getUserGoogleToken(userId);
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    if (token && pomometerListId && current?.googleTaskId && updates.text !== undefined) {
      try {
        await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${current.googleTaskId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: updates.text })
        });
        console.log(`[GoogleTasks] Updated Google Task: ${current.googleTaskId}`);
      } catch (e) {
        console.error('Update Google Task failed:', e);
      }
    }

    // 🔥 新增：在后台执行轻量级同步
    this.debouncedSync(userId);

    return { id: todoId };
  }

  // 添加子todo
  async addSubTodo(userId: string, parentId: string, subTodoData: {
    subId: string;
    subText: string;
    createdDate: string;
    startTime?: string;
    endTime?: string;
    description?: string;
  }): Promise<SubTodo> {
    const db = getDb();
    const { subId, subText, createdDate, startTime, endTime, description } = subTodoData;

    console.log(`[GoogleTasks] Creating new subtodo for parent ${parentId}: "${subText}"`);

    // 先验证父todo存在且属于该用户
    const parent = await db.todo.findFirst({
      where: {
        id: parentId,
        userId,
        deleted: false
      }
    });

    if (!parent) {
      throw new Error('Parent todo not found');
    }

    // 检查子todo是否已存在
    const existingSubTodo = await db.subTodo.findFirst({
      where: { id: subId, todoId: parentId }
    });

    if (existingSubTodo) {
      console.log(`[GoogleTasks] SubTodo with ID ${subId} already exists, returning existing subtodo`);
      return {
        id: existingSubTodo.id,
        todo_id: existingSubTodo.todoId,
        text: existingSubTodo.text,
        completed: existingSubTodo.completed,
        deleted: existingSubTodo.deleted,
        focus: existingSubTodo.focus,
        created_date: existingSubTodo.createdDate.toISOString(),
        updated_date: existingSubTodo.updatedDate.toISOString(),
        startTime: existingSubTodo.startTime?.toISOString(),
        endTime: existingSubTodo.endTime?.toISOString(),
        description: existingSubTodo.description || undefined,
        google_task_id: existingSubTodo.googleTaskId || undefined,
        googleTaskId: existingSubTodo.googleTaskId || undefined
      };
    }

    let googleTaskId: string | undefined;

    // 获取专用的AA Pomometer列表ID
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    if (pomometerListId) {
      console.log(`[GoogleTasks] Attempting to create Google Task in AA Pomometer list: "${subText}"`);
      try {
        const body: { title: string; notes?: string; due?: string } = { title: subText };
        if (description) body.notes = description;
        if (endTime) body.due = endTime;

        // 构建URL，如果父todo有Google Task ID，将parent作为查询参数
        let url = `${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks`;
        if (parent.googleTaskId) {
          url += `?parent=${parent.googleTaskId}`;
          console.log(`[GoogleTasks] Creating subtask with parent: ${parent.googleTaskId}`);
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await this.getUserGoogleToken(userId)}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const data = await res.json() as { id: string };
          googleTaskId = data.id;
          console.log(`[GoogleTasks] Successfully created Google Task with ID: ${googleTaskId}`);
        } else {
          const errorText = await res.text();
          console.error(`[GoogleTasks] Failed to create Google Task. Status: ${res.status}, Response: ${errorText}`);
        }
      } catch (e) {
        console.error('[GoogleTasks] Create Google Task failed:', e);
      }
    } else {
      console.log(`[GoogleTasks] No valid token or pomometer list available, skipping Google Tasks creation`);
    }

    const subTodo = await db.subTodo.create({
      data: {
        id: subId,
        todoId: parentId,
        text: subText,
        createdDate: new Date(createdDate),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        description,
        googleTaskId
      }
    });

    // 转换为API类型
    const result = {
      id: subTodo.id,
      todo_id: subTodo.todoId,
      text: subTodo.text,
      completed: subTodo.completed,
      deleted: subTodo.deleted,
      focus: subTodo.focus,
      created_date: subTodo.createdDate.toISOString(),
      updated_date: subTodo.updatedDate.toISOString(),
      startTime: subTodo.startTime?.toISOString(),
      endTime: subTodo.endTime?.toISOString(),
      description: subTodo.description || undefined,
      google_task_id: subTodo.googleTaskId || undefined,
      googleTaskId: subTodo.googleTaskId || undefined
    };

    // 🔥 新增：在后台执行轻量级同步，排除刚创建的子任务
    this.debouncedSync(userId, googleTaskId ? [googleTaskId] : undefined);

    return result;
  }

  // 切换子todo完成状态
  async toggleSubTodo(userId: string, parentId: string, subId: string, completed: boolean): Promise<{ id: string; completed: boolean }> {
    console.log(`[GoogleTasks] ===== toggleSubTodo START =====`);
    console.log(`[GoogleTasks] Request: subId=${subId}, completed=${completed}`);

    const db = getDb();

    // 验证父todo属于该用户
    const parent = await db.todo.findFirst({
      where: { id: parentId, userId }
    });

    if (!parent) {
      throw new Error('Parent todo not found');
    }

    const sub = await db.subTodo.findFirst({ where: { id: subId, todoId: parentId } });

    await db.subTodo.update({
      where: {
        id: subId,
        todoId: parentId
      },
      data: {
        completed,
        updatedDate: new Date()
      }
    });

    // 🔥 验证数据库状态
    const updatedSubTodo = await db.subTodo.findFirst({
      where: { id: subId, todoId: parentId }
    });
    console.log(`[GoogleTasks] Database state after update: ${updatedSubTodo?.text} completed=${updatedSubTodo?.completed}`);

    const token = await this.getUserGoogleToken(userId);
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    // 🔥 重要：无论Google Tasks同步是否成功，都先添加保护
    if (sub?.googleTaskId) {
      this.recentlyUpdatedTasks.set(sub.googleTaskId, Date.now());
      console.log(`[GoogleTasks] Added subtask to protection list: ${sub.text} (${sub.googleTaskId})`);
    }

    if (token && pomometerListId && sub?.googleTaskId) {
      try {
        await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${sub.googleTaskId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: completed ? 'completed' : 'needsAction' })
        });
        console.log(`[GoogleTasks] Updated subtodo status: ${sub.text} -> ${completed ? 'completed' : 'active'}`);
      } catch (e) {
        console.error('Update Google Task status failed:', e);
      }
    }

    // 🔥 延迟触发轻量级同步，给Google Tasks时间更新，并排除刚更新的任务
    setTimeout(() => {
      this.debouncedSync(userId, sub?.googleTaskId ? [sub.googleTaskId] : undefined);
    }, 1000);

    console.log(`[GoogleTasks] ===== toggleSubTodo END =====`);
    console.log(`[GoogleTasks] Returning: id=${subId}, completed=${completed}`);

    return { id: subId, completed };
  }

  // 删除子todo
  async deleteSubTodo(userId: string, parentId: string, subId: string): Promise<{ id: string }> {
    const db = getDb();

    // 验证父todo属于该用户
    const parent = await db.todo.findFirst({
      where: { id: parentId, userId }
    });

    if (!parent) {
      throw new Error('Parent todo not found');
    }
    const sub = await db.subTodo.findFirst({ where: { id: subId, todoId: parentId } });
    const token = await this.getUserGoogleToken(userId);
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    if (token && pomometerListId && sub?.googleTaskId) {
      try {
        await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${sub.googleTaskId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Delete Google Task failed:', e);
      }
    }

    await db.subTodo.update({
      where: {
        id: subId,
        todoId: parentId
      },
      data: {
        deleted: true,
        updatedDate: new Date()
      }
    });

    // 🔥 新增：在后台执行轻量级同步
    this.debouncedSync(userId);

    return { id: subId };
  }

  // 更新子todo
  async updateSubTodo(userId: string, parentId: string, subId: string, updates: {
    text?: string;
    focus?: boolean;
    startTime?: string;
    endTime?: string;
    description?: string;
  }): Promise<{ id: string }> {
    const db = getDb();

    // 验证父todo属于该用户
    const parent = await db.todo.findFirst({
      where: { id: parentId, userId }
    });

    if (!parent) {
      throw new Error('Parent todo not found');
    }
    const sub = await db.subTodo.findFirst({ where: { id: subId, todoId: parentId } });

    const updateData: {
      updatedDate: Date;
      text?: string;
      focus?: boolean;
      startTime?: Date | null;
      endTime?: Date | null;
      description?: string;
    } = { updatedDate: new Date() };
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.focus !== undefined) updateData.focus = updates.focus;
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime ? new Date(updates.startTime) : null;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime ? new Date(updates.endTime) : null;
    if (updates.description !== undefined) updateData.description = updates.description;

    await db.subTodo.update({
      where: {
        id: subId,
        todoId: parentId
      },
      data: updateData
    });

    const token = await this.getUserGoogleToken(userId);
    const pomometerListId = await this.getOrCreatePomometerListId(userId);

    if (token && pomometerListId && sub?.googleTaskId) {
      type GoogleTaskUpdateBody = {
        title?: string;
        notes?: string;
        due?: string;
      };
      const body: GoogleTaskUpdateBody = {};
      if (updates.text !== undefined) body.title = updates.text;
      if (updates.description !== undefined) body.notes = updates.description;
      if (updates.endTime !== undefined) body.due = updates.endTime;
      if (Object.keys(body).length) {
        try {
          await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks/${sub.googleTaskId}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });
          console.log(`[GoogleTasks] Updated Google Task: ${sub.googleTaskId}`);
        } catch (e) {
          console.error('Update Google Task failed:', e);
        }
      }
    }

    // 🔥 新增：在后台执行轻量级同步
    this.debouncedSync(userId);

    return { id: subId };
  }

  // 从Google Tasks同步数据到本地数据库并返回最新todo列表
  async syncGoogleTasks(userId: string): Promise<Todo[]> {
    console.log(`[GoogleTasks] ===== FULL SYNC START =====`);
    console.log(`[GoogleTasks] Protected tasks count: ${this.recentlyUpdatedTasks.size}`);

    const token = await this.getUserGoogleToken(userId);
    if (!token) {
      console.error(`[GoogleTasks] No valid token, skipping sync`);
      return this.getUserTodos(userId);
    }

    try {
      console.log(`[GoogleTasks] Starting sync for user ${userId}`);

      const pomometerListId = await this.getOrCreatePomometerListId(userId);
      if (!pomometerListId) {
        console.log(`[GoogleTasks] Could not get pomometer list, falling back to local todos`);
        return this.getUserTodos(userId);
      }

      console.log(`[GoogleTasks] Using AA Pomometer list with ID: ${pomometerListId}`);

      const { parentTasks, childTasks, deletedParentTasks, deletedChildTasks } = await this._fetchAndCategorizeGoogleTasks(pomometerListId, token);
      const { localTodos, localSubTodos } = await this._getLocalGoogleTasks(userId);

      await this._syncDeletions(userId, deletedParentTasks, deletedChildTasks, localTodos, localSubTodos);
      await this._syncLocalDeletions(userId, parentTasks, childTasks, deletedParentTasks, deletedChildTasks, localTodos, localSubTodos);
      await this._syncCreations(userId, parentTasks, childTasks, localTodos, localSubTodos);
      await this._syncUpdates(userId, parentTasks, childTasks);

      console.log(`[GoogleTasks] Sync completed successfully`);
    } catch (e) {
      console.error('Sync Google Tasks failed:', e);
    }

    // 🔥 添加日志：检查返回的状态
    const finalTodos = await this.getUserTodos(userId);
    const affectedSubtodos = finalTodos.flatMap(todo => todo.subItems).filter(sub =>
      this.recentlyUpdatedTasks.has(sub.google_task_id || sub.googleTaskId || '')
    );

    if (affectedSubtodos.length > 0) {
      console.log(`[GoogleTasks] Final status of protected subtodos:`,
        affectedSubtodos.map(sub => ({ text: sub.text, completed: sub.completed }))
      );
    }

    return finalTodos;
  }

  private async _fetchAndCategorizeGoogleTasks(pomometerListId: string, token: string) {
    const tasksRes = await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks?showHidden=True&maxResults=100&showDeleted=True`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!tasksRes.ok) {
      console.error(`[GoogleTasks] Failed to fetch tasks from AA Pomometer list`);
      throw new Error('Failed to fetch Google Tasks');
    }

    const tasksData: GoogleTasksListResponse = await tasksRes.json();
    const tasks: GoogleTask[] = tasksData.items || [];
    console.log(`[GoogleTasks] Found ${tasks.length} tasks in AA Pomometer list`);

    return {
      parentTasks: tasks.filter((task: GoogleTask) => !task.parent && !task.deleted),
      childTasks: tasks.filter((task: GoogleTask) => task.parent && !task.deleted),
      deletedParentTasks: tasks.filter((task: GoogleTask) => !task.parent && task.deleted),
      deletedChildTasks: tasks.filter((task: GoogleTask) => task.parent && task.deleted),
    };
  }

  private async _getLocalGoogleTasks(userId: string) {
    const db = getDb();
    const localTodos = await db.todo.findMany({
      where: {
        userId,
        googleTaskId: { not: null },
        deleted: false,
      },
      select: { id: true, googleTaskId: true },
    });

    const localSubTodos = await db.subTodo.findMany({
      where: {
        todo: { userId },
        googleTaskId: { not: null },
        deleted: false,
      },
      select: { id: true, todoId: true, googleTaskId: true },
    });

    return { localTodos, localSubTodos };
  }

  private async _syncDeletions(userId: string, deletedParentTasks: GoogleTask[],
    deletedChildTasks: GoogleTask[], localTodos: LocalTodoSync[],
    localSubTodos: LocalSubTodoSync[]) {
    const db = getDb();

    // 处理Google中标记为删除的todos
    const deletedTodoTaskIds = deletedParentTasks.map(t => t.id);
    const todosToDelete = localTodos.filter(
      t => deletedTodoTaskIds.includes(t.googleTaskId!)
    );

    if (todosToDelete.length) {
      const ids = todosToDelete.map(t => t.id);
      await db.todo.updateMany({
        where: { id: { in: ids } },
        data: { deleted: true, updatedDate: new Date() },
      });
      await db.subTodo.updateMany({
        where: { todoId: { in: ids } },
        data: { deleted: true, updatedDate: new Date() },
      });
      console.log(`[GoogleTasks] Marked ${todosToDelete.length} todos as deleted based on Google Tasks deleted flag`);
    }

    // 处理Google中标记为删除的subtodos
    const deletedSubTodoTaskIds = deletedChildTasks.map(t => t.id);
    const subTodosToDelete = localSubTodos.filter(
      s => deletedSubTodoTaskIds.includes(s.googleTaskId!)
    );

    if (subTodosToDelete.length) {
      const subIds = subTodosToDelete.map(s => s.id);
      await db.subTodo.updateMany({
        where: { id: { in: subIds } },
        data: { deleted: true, updatedDate: new Date() },
      });
      console.log(`[GoogleTasks] Marked ${subTodosToDelete.length} subtodos as deleted based on Google Tasks deleted flag`);
    }
  }

  private async _syncLocalDeletions(userId: string, parentTasks: GoogleTask[],
     childTasks: GoogleTask[], deletedParentTasks: GoogleTask[], 
     deletedChildTasks: GoogleTask[], 
     localTodos: LocalTodoSync[], 
     localSubTodos: LocalSubTodoSync[]) {
    const db = getDb();

    // 集合所有从Google获取的task ID
    const allGoogleTaskIds = new Set([
      ...parentTasks.map(t => t.id),
      ...childTasks.map(t => t.id),
      ...deletedParentTasks.map(t => t.id),
      ...deletedChildTasks.map(t => t.id),
    ]);

    // 找出本地存在但Google已不存在的todos
    const orphanedTodos = localTodos.filter(
      t => !allGoogleTaskIds.has(t.googleTaskId!)
    );

    if (orphanedTodos.length > 0) {
      const ids = orphanedTodos.map(t => t.id);
      await db.todo.updateMany({
        where: { id: { in: ids } },
        data: { deleted: true, updatedDate: new Date() },
      });
      await db.subTodo.updateMany({
        where: { todoId: { in: ids } },
        data: { deleted: true, updatedDate: new Date() },
      });
      console.log(`[GoogleTasks] Marked ${orphanedTodos.length} orphaned todos as deleted.`);
    }

    // 找出本地存在但Google已不存在的subtodos
    const orphanedSubTodos = localSubTodos.filter(
      s => !allGoogleTaskIds.has(s.googleTaskId!)
    );

    if (orphanedSubTodos.length > 0) {
      const subIds = orphanedSubTodos.map(s => s.id);
      await db.subTodo.updateMany({
        where: { id: { in: subIds } },
        data: { deleted: true, updatedDate: new Date() },
      });
      console.log(`[GoogleTasks] Marked ${orphanedSubTodos.length} orphaned subtodos as deleted.`);
    }
  }

  private async _syncCreations(userId: string, parentTasks: GoogleTask[], childTasks: GoogleTask[], localTodos: LocalTodoSync[], localSubTodos: LocalSubTodoSync[]) {
    const db = getDb();

    // 处理新增的todos (Google有但本地没有的父任务)
    const localGoogleTaskIds = localTodos.map(t => t.googleTaskId!);
    const newTasks = parentTasks.filter(
      t => !localGoogleTaskIds.includes(t.id)
    );

    // 创建新的todos
    for (const task of newTasks) {
      const completed = task.status === 'completed';
      await db.todo.create({
        data: {
          id: uuidv4(),
          userId,
          text: task.title || 'Untitled',
          completed,
          createdDate: task.updated ? new Date(task.updated) : new Date(),
          googleTaskId: task.id
        }
      });
      console.log(`[GoogleTasks] Created new todo from Google Tasks: ${task.title}`);
    }

    // 处理新增的subtodos (Google有但本地没有的子任务)
    const localSubGoogleTaskIds = localSubTodos.map(s => s.googleTaskId!);
    const newChildTasks = childTasks.filter(
      t => !localSubGoogleTaskIds.includes(t.id)
    );

    // 创建新的subtodos
    for (const task of newChildTasks) {
      const parentTask = parentTasks.find((p: GoogleTask) => p.id === task.parent);
      if (!parentTask) {
        console.log(`[GoogleTasks] Orphaned new subtask found: ${task.title}, parent: ${task.parent}`);
        continue;
      }

      // 找到对应的本地父todo
      const parentTodo = await db.todo.findFirst({
        where: { userId, googleTaskId: parentTask.id, deleted: false }
      });

      if (!parentTodo) {
        console.log(`[GoogleTasks] Parent todo not found for new subtask: ${task.title}`);
        continue;
      }

      const completed = task.status === 'completed';
      await db.subTodo.create({
        data: {
          id: uuidv4(),
          todoId: parentTodo.id,
          text: task.title || '',
          completed,
          createdDate: task.updated ? new Date(task.updated) : new Date(),
          googleTaskId: task.id
        }
      });
      console.log(`[GoogleTasks] Created new subtodo from Google Tasks: ${task.title}`);
    }
  }

  private async _syncUpdates(userId: string, parentTasks: GoogleTask[], childTasks: GoogleTask[]) {
    const db = getDb();

    // 同步父任务 (Google Task -> Todo) - 只处理活跃的任务
    for (const task of parentTasks) {
      const todo = await db.todo.findFirst({
        where: { userId, googleTaskId: task.id, deleted: false }
      });

      if (todo) {
        // 🔥 检查是否在保护期内（刚刚更新过）
        const protectionTime = this.recentlyUpdatedTasks.get(task.id);
        if (protectionTime && Date.now() - protectionTime < this.PROTECTION_PERIOD) {
          console.log(`[GoogleTasks] [Full Sync] Task in protection period, skipping: ${todo.text} (${Date.now() - protectionTime}ms ago)`);
          continue;
        }

        // 更新现有的todo
        const update: TodoUpdateData = {};
        const completed = task.status === 'completed';
        if (todo.text !== task.title) update.text = task.title || '';
        if (todo.completed !== completed) update.completed = completed;

        if (Object.keys(update).length) {
          update.updatedDate = new Date();
          await db.todo.update({
            where: { id: todo.id },
            data: update
          });
          console.log(`[GoogleTasks] Updated todo: ${task.title}`);
        }
      }
    }

    // 同步子任务 (Google Task -> SubTodo) - 只处理活跃的任务
    for (const task of childTasks) {
      const parentTask = parentTasks.find((p: GoogleTask) => p.id === task.parent);
      if (!parentTask) {
        console.log(`[GoogleTasks] Orphaned subtask found: ${task.title}, parent: ${task.parent}`);
        continue;
      }

      // 找到对应的本地父todo
      const parentTodo = await db.todo.findFirst({
        where: { userId, googleTaskId: parentTask.id, deleted: false }
      });

      if (!parentTodo) {
        console.log(`[GoogleTasks] Parent todo not found for subtask: ${task.title}`);
        continue;
      }

      const subTodo = await db.subTodo.findFirst({
        where: { todoId: parentTodo.id, googleTaskId: task.id, deleted: false }
      });

      if (subTodo) {
        // 🔥 检查是否在保护期内（刚刚更新过）
        const protectionTime = this.recentlyUpdatedTasks.get(task.id);
        if (protectionTime && Date.now() - protectionTime < this.PROTECTION_PERIOD) {
          console.log(`[GoogleTasks] [Full Sync] Subtask in protection period, skipping: ${subTodo.text} (${Date.now() - protectionTime}ms ago)`);
          continue;
        }

        // 更新现有的subtodo
        const update: SubTodoUpdateData = {};
        const completed = task.status === 'completed';
        if (subTodo.text !== task.title) update.text = task.title || '';
        if (subTodo.completed !== completed) update.completed = completed;

        if (Object.keys(update).length) {
          update.updatedDate = new Date();
          await db.subTodo.update({
            where: { id: subTodo.id, todoId: parentTodo.id },
            data: update
          });
          console.log(`[GoogleTasks] Updated subtodo: ${task.title}`);
        }
      }
    }
  }

  // 轻量级同步：只同步最近更新的任务
  private async performLightweightSync(userId: string, skipGoogleTaskIds?: string[]): Promise<void> {
    try {
      const token = await this.getUserGoogleToken(userId);
      if (!token) return;

      const pomometerListId = await this.getOrCreatePomometerListId(userId);
      if (!pomometerListId) return;

      console.log(`[GoogleTasks] Performing lightweight sync check...`);

      // 只获取最近5分钟更新的任务（减少API调用）
      const since = new Date(Date.now() - 5 * 60 * 1000);
      const tasksRes = await fetch(
        `${GOOGLE_TASKS_API_BASE}/lists/${pomometerListId}/tasks?updatedMin=${since.toISOString()}&showDeleted=True`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!tasksRes.ok) {
        console.log(`[GoogleTasks] Lightweight sync failed: ${tasksRes.status}`);
        return;
      }

      const tasksData: GoogleTasksListResponse = await tasksRes.json();
      const allTasks: GoogleTask[] = tasksData.items || [];
      console.log(`[GoogleTasks] Retrieved ${allTasks.length} recent tasks from Google Tasks`);

      if (skipGoogleTaskIds && skipGoogleTaskIds.length > 0) {
        console.log(`[GoogleTasks] Skipping Google Task IDs: ${skipGoogleTaskIds.join(', ')}`);
      }

      const recentTasks = allTasks.filter((task: GoogleTask) =>
        !skipGoogleTaskIds?.includes(task.id)
      );

      console.log(`[GoogleTasks] After filtering: ${recentTasks.length} tasks to process`);

      if (recentTasks.length > 0) {
        console.log(`[GoogleTasks] Found ${recentTasks.length} recent changes from Google Tasks`);
        await this.syncSpecificTasks(userId, recentTasks);
      } else {
        console.log(`[GoogleTasks] No recent changes found in Google Tasks`);
      }
    } catch (error) {
      console.error('[GoogleTasks] Lightweight sync failed:', error);
    }
  }

  // 同步特定任务（用于轻量级同步）
  private async syncSpecificTasks(userId: string, tasks: GoogleTask[]): Promise<void> {
    const db = getDb();

    // 🔥 清理过期的保护记录
    const now = Date.now();
    console.log(`[GoogleTasks] Before cleanup: ${this.recentlyUpdatedTasks.size} protected tasks`);
    let cleanedCount = 0;
    for (const [taskId, timestamp] of this.recentlyUpdatedTasks.entries()) {
      const age = now - timestamp;
      console.log(`[GoogleTasks] Task ${taskId}: protected ${age}ms ago (threshold: ${this.PROTECTION_PERIOD}ms)`);
      if (age > this.PROTECTION_PERIOD) {
        this.recentlyUpdatedTasks.delete(taskId);
        cleanedCount++;
        console.log(`[GoogleTasks] Removed expired protection for task ${taskId}`);
      }
    }
    console.log(`[GoogleTasks] After cleanup: ${this.recentlyUpdatedTasks.size} protected tasks (cleaned ${cleanedCount})`);
    console.log(`[GoogleTasks] Currently protected tasks:`, Array.from(this.recentlyUpdatedTasks.keys()));

    // 分离活跃和删除的任务
    const parentTasks = tasks.filter(task => !task.parent && !task.deleted);
    const childTasks = tasks.filter(task => task.parent && !task.deleted);
    const deletedTasks = tasks.filter(task => task.deleted);

    console.log(`[GoogleTasks] Syncing ${parentTasks.length} active parent tasks, ${childTasks.length} active child tasks, and ${deletedTasks.length} deleted tasks`);

    // 处理删除的任务
    for (const task of deletedTasks) {
      if (!task.parent) {
        // 删除的父任务
        const todo = await db.todo.findFirst({
          where: { userId, googleTaskId: task.id, deleted: false }
        });

        if (todo) {
          await db.todo.update({
            where: { id: todo.id },
            data: { deleted: true, updatedDate: new Date() }
          });

          // 同时删除所有子任务
          await db.subTodo.updateMany({
            where: { todoId: todo.id, deleted: false },
            data: { deleted: true, updatedDate: new Date() }
          });

          console.log(`[GoogleTasks] Marked todo as deleted: ${todo.text}`);
        }
      } else {
        // 删除的子任务
        const parentTodo = await db.todo.findFirst({
          where: { userId, googleTaskId: task.parent, deleted: false }
        });

        if (parentTodo) {
          const subTodo = await db.subTodo.findFirst({
            where: { todoId: parentTodo.id, googleTaskId: task.id, deleted: false }
          });

          if (subTodo) {
            await db.subTodo.update({
              where: { id: subTodo.id },
              data: { deleted: true, updatedDate: new Date() }
            });

            console.log(`[GoogleTasks] Marked subtodo as deleted: ${subTodo.text}`);
          }
        }
      }
    }

    // 处理父任务更新
    for (const task of parentTasks) {
      const todo = await db.todo.findFirst({
        where: { userId, googleTaskId: task.id, deleted: false }
      });

      if (todo) {
        // 🔥 检查是否在保护期内（刚刚更新过）
        const protectionTime = this.recentlyUpdatedTasks.get(task.id);
        if (protectionTime && Date.now() - protectionTime < this.PROTECTION_PERIOD) {
          console.log(`[GoogleTasks] Task in protection period, skipping: ${todo.text} (${Date.now() - protectionTime}ms ago)`);
          continue;
        }

        // 比较更新时间，避免覆盖更新的本地变更
        const googleTaskUpdated = new Date(task.updated);
        const localUpdated = new Date(todo.updatedDate);

        // 如果本地更新时间很近（5秒内），跳过同步以避免冲突
        const timeDiff = Date.now() - localUpdated.getTime();
        if (timeDiff < 5000) {
          console.log(`[GoogleTasks] Skipping recent local update for todo: ${todo.text} (${timeDiff}ms ago)`);
          continue;
        }

        // 如果Google Tasks的更新时间不比本地新，跳过同步
        if (googleTaskUpdated <= localUpdated) {
          console.log(`[GoogleTasks] Google Tasks not newer for todo: ${todo.text}`);
          continue;
        }

        const completed = task.status === 'completed';
        const update: TodoUpdateData = {};

        if (todo.text !== (task.title || '')) update.text = task.title || '';
        if (todo.completed !== completed) update.completed = completed;

        if (Object.keys(update).length) {
          update.updatedDate = new Date();
          await db.todo.update({
            where: { id: todo.id },
            data: update
          });
          console.log(`[GoogleTasks] Synced todo update: ${task.title} (Google Tasks was newer)`);

          // 🔥 重要：从Google Tasks同步的更新不需要保护，移除保护以允许后续同步
          this.recentlyUpdatedTasks.delete(task.id);
          console.log(`[GoogleTasks] Removed protection for Google Tasks synced todo: ${task.id}`);
        }
      }
    }

    // 处理子任务更新
    console.log(`[GoogleTasks] ===== PROCESSING CHILD TASKS START =====`);
    for (const task of childTasks) {
      console.log(`[GoogleTasks] Processing child task: ${task.title} (${task.id})`);

      const parentTodo = await db.todo.findFirst({
        where: { userId, googleTaskId: task.parent, deleted: false }
      });

      if (!parentTodo) {
        console.log(`[GoogleTasks] Parent todo not found for subtask: ${task.title}`);
        continue;
      }

      console.log(`[GoogleTasks] Found parent todo: ${parentTodo.text}`);

      const subTodo = await db.subTodo.findFirst({
        where: { todoId: parentTodo.id, googleTaskId: task.id, deleted: false }
      });

      if (!subTodo) {
        console.log(`[GoogleTasks] SubTodo not found for task: ${task.title}`);
        continue;
      }

      console.log(`[GoogleTasks] Found subtodo: ${subTodo.text}, current completed: ${subTodo.completed}`);

      if (subTodo) {
        console.log(`[GoogleTasks] Checking protection for task: ${task.id}`);

        // 🔥 检查是否在保护期内（刚刚更新过）
        const protectionTime = this.recentlyUpdatedTasks.get(task.id);
        if (protectionTime && Date.now() - protectionTime < this.PROTECTION_PERIOD) {
          console.log(`[GoogleTasks] Subtask in protection period, skipping: ${subTodo.text} (${Date.now() - protectionTime}ms ago)`);
          continue;
        }

        console.log(`[GoogleTasks] Subtask not in protection, proceeding with sync check`);

        // 比较更新时间，避免覆盖更新的本地变更
        const googleTaskUpdated = new Date(task.updated);
        const localUpdated = new Date(subTodo.updatedDate);

        console.log(`[GoogleTasks] Time comparison - Google: ${googleTaskUpdated.toISOString()}, Local: ${localUpdated.toISOString()}`);

        // 如果本地更新时间很近（5秒内），跳过同步以避免冲突
        const timeDiff = Date.now() - localUpdated.getTime();
        if (timeDiff < 5000) {
          console.log(`[GoogleTasks] Skipping recent local update for subtodo: ${subTodo.text} (${timeDiff}ms ago)`);
          continue;
        }

        // 如果Google Tasks的更新时间不比本地新，跳过同步
        if (googleTaskUpdated <= localUpdated) {
          console.log(`[GoogleTasks] Google Tasks not newer for subtodo: ${subTodo.text}`);
          continue;
        }

        const completed = task.status === 'completed';
        const update: SubTodoUpdateData = {};

        console.log(`[GoogleTasks] Task status: ${task.status}, completed: ${completed}, current subtodo completed: ${subTodo.completed}`);

        if (subTodo.text !== (task.title || '')) {
          update.text = task.title || '';
          console.log(`[GoogleTasks] Text update needed: "${subTodo.text}" -> "${task.title}"`);
        }
        if (subTodo.completed !== completed) {
          update.completed = completed;
          console.log(`[GoogleTasks] Completed status update needed: ${subTodo.completed} -> ${completed}`);
        }

        if (Object.keys(update).length) {
          console.log(`[GoogleTasks] Applying updates:`, update);
          update.updatedDate = new Date();
          await db.subTodo.update({
            where: { id: subTodo.id, todoId: parentTodo.id },
            data: update
          });
          console.log(`[GoogleTasks] Synced subtodo update: ${task.title} (Google Tasks was newer)`);

          // 🔥 重要：从Google Tasks同步的更新不需要保护，移除保护以允许后续同步
          this.recentlyUpdatedTasks.delete(task.id);
          console.log(`[GoogleTasks] Removed protection for Google Tasks synced subtodo: ${task.id}`);
        } else {
          console.log(`[GoogleTasks] No updates needed for subtodo: ${task.title}`);
        }
      }
    }
    console.log(`[GoogleTasks] ===== PROCESSING CHILD TASKS END =====`);
  }

  // 防抖同步：避免频繁的同步请求
  private async debouncedSync(userId: string, skipGoogleTaskIds?: string[]): Promise<void> {
    const now = Date.now();
    const lastSync = this.lastSyncTimes.get(userId) || 0;

    if (now - lastSync < this.MIN_SYNC_INTERVAL) {
      console.log(`[GoogleTasks] Sync skipped - too frequent (${now - lastSync}ms ago)`);
      return;
    }

    this.lastSyncTimes.set(userId, now);

    // 延迟执行，给用户更多操作时间
    setTimeout(() => {
      this.performLightweightSync(userId, skipGoogleTaskIds)
        .catch(error => console.error('[GoogleTasks] Debounced sync failed:', error));
    }, 500);
  }
}

// 操作日志服务
export class OperationService {
  // 记录操作
  async logOperation(
    userId: string,
    operationType: string,
    payload: import('../types/api').OperationPayload,
    timestamp: string
  ): Promise<void> {
    const db = getDb();

    await db.operation.create({
      data: {
        userId,
        operationType,
        payload: JSON.stringify(payload),
        timestamp: new Date(timestamp)
      }
    });
  }

  // 获取操作记录
  async getOperationsSince(userId: string, since: string): Promise<SyncOperation[]> {
    const db = getDb();

    const operations = await db.operation.findMany({
      where: {
        userId,
        timestamp: { gt: new Date(since) }
      },
      orderBy: { timestamp: 'asc' }
    });

    return operations.map((op): SyncOperation => ({
      type: op.operationType,
      payload: JSON.parse(op.payload),
      timestamp: op.timestamp.toISOString()
    }));
  }
}

// Settings相关操作
export class SettingsService {
  // 获取用户设置
  async getUserSettings(userId: string): Promise<UserSettings> {
    const db = getDb();

    const settings = await db.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // 返回默认设置
      return {
        pomodoro_duration: 1500,
        short_break_duration: 300,
        long_break_duration: 1500,
        ticking_sound_enabled: true,
        rest_ticking_sound_enabled: false,
        language: 'en-US'
      };
    }

    return {
      pomodoro_duration: settings.pomodoroDuration,
      short_break_duration: settings.shortBreakDuration,
      long_break_duration: settings.longBreakDuration,
      ticking_sound_enabled: settings.tickingSoundEnabled,
      rest_ticking_sound_enabled: settings.restTickingSoundEnabled,
      language: settings.language
    };
  }

  // 更新用户设置
  async updateUserSettings(userId: string, settingsData: UserSettings): Promise<UserSettings> {
    const db = getDb();

    const settings = await db.userSettings.upsert({
      where: { userId },
      update: {
        pomodoroDuration: settingsData.pomodoro_duration,
        shortBreakDuration: settingsData.short_break_duration,
        longBreakDuration: settingsData.long_break_duration,
        tickingSoundEnabled: settingsData.ticking_sound_enabled,
        restTickingSoundEnabled: settingsData.rest_ticking_sound_enabled,
        language: settingsData.language,
        updatedAt: new Date()
      },
      create: {
        userId,
        pomodoroDuration: settingsData.pomodoro_duration,
        shortBreakDuration: settingsData.short_break_duration,
        longBreakDuration: settingsData.long_break_duration,
        tickingSoundEnabled: settingsData.ticking_sound_enabled,
        restTickingSoundEnabled: settingsData.rest_ticking_sound_enabled,
        language: settingsData.language
      }
    });

    return await this.getUserSettings(userId);
  }

  // 根据操作类型更新设置
  async applySettingsOperation(userId: string, operation: SyncOperation): Promise<UserSettings> {
    const { type, payload } = operation;
    const currentSettings = await this.getUserSettings(userId);

    switch (type) {
      case 'UPDATE_POMODORO_DURATION':
        currentSettings.pomodoro_duration = (payload as { value: number }).value;
        break;
      case 'UPDATE_SHORT_BREAK_DURATION':
        currentSettings.short_break_duration = (payload as { value: number }).value;
        break;
      case 'UPDATE_LONG_BREAK_DURATION':
        currentSettings.long_break_duration = (payload as { value: number }).value;
        break;
      case 'UPDATE_TICKING_SOUND':
        currentSettings.ticking_sound_enabled = (payload as { value: boolean }).value;
        break;
      case 'UPDATE_REST_TICKING_SOUND':
        currentSettings.rest_ticking_sound_enabled = (payload as { value: boolean }).value;
        break;
      case 'UPDATE_LANGUAGE':
        currentSettings.language = (payload as { value: string }).value;
        break;
      default:
        throw new Error(`Unknown settings operation type: ${type}`);
    }

    return await this.updateUserSettings(userId, currentSettings);
  }
}
