import { getDb } from '../database';
import type { User, GoogleUserInfo } from '../../types/api';
import { TodoService } from './todo';

// 用户相关操作
export class UserService {
  // 创建或更新用户
  async upsertUser(userInfo: GoogleUserInfo): Promise<User> {
    const db = await getDb();
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
    const db = await getDb();
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
    const db = await getDb();
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

