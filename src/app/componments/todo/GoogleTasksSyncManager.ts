import { hasGoogleTasksPermission } from '../../lib/googleTasks';
import { getGoogleTasksSyncConfig, type GoogleTasksSyncConfig } from './googleTasksSyncConfig';
import { type TodoItem } from './todoSlice';

// Google Tasks synchronization manager
// 🔄 重构说明：此管理器不再执行定时全量同步，只提供手动同步功能
// 所有定时同步现在由 GenericSyncManager 统一管理
class GoogleTasksSyncManager {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isAuthenticated = false;
  private hasGooglePermission = false;
  private config: GoogleTasksSyncConfig;
  private isSyncing = false;
  private lastSyncTime = 0;

  constructor(config?: Partial<GoogleTasksSyncConfig>) {
    this.config = { ...getGoogleTasksSyncConfig(), ...config };

    // Listen for network status changes (client-side only)
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  // Set authentication status and Google Tasks permission
  setAuthenticationState(isAuthenticated: boolean): void {
    this.isAuthenticated = isAuthenticated;
    this.hasGooglePermission = isAuthenticated && hasGoogleTasksPermission();

    console.log(`[GoogleTasksSyncManager] Auth state updated: authenticated=${isAuthenticated}, hasPermission=${this.hasGooglePermission}`);
    // 🔄 不再自动启动定时同步，只记录状态
  }

  // 🔄 移除定时同步功能，改为仅提供手动同步接口
  // 定时同步现在由 GenericSyncManager 统一管理

  // 🔄 全量同步方法 - 从 Google Tasks 获取数据并返回
  // 注意：不再直接更新 Redux store，返回数据由调用方处理
  async fetchFromGoogleTasks(): Promise<{ success: boolean; data?: { todos: TodoItem[]; lastSyncTime: string } }> {
    console.log("[GoogleTasksSyncManager] Fetching todos from Google Tasks...");

    // Check basic conditions
    if (!this.isOnline) {
      console.warn('[GoogleTasksSyncManager] Offline, cannot fetch from Google Tasks');
      return { success: false };
    }

    if (!this.hasGooglePermission) {
      console.warn('[GoogleTasksSyncManager] No Google Tasks permission');
      return { success: false };
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        console.warn('[GoogleTasksSyncManager] No auth token');
        return { success: false };
      }

      const response = await fetch('/api/todos/google-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('[GoogleTasksSyncManager] Authentication failed');
          this.setAuthenticationState(false);
        }
        throw new Error(`Google Tasks sync failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; data?: { todos?: TodoItem[]; lastSyncTime?: string } };
      console.log(`[GoogleTasksSyncManager] Received response from /api/todos/google-sync`);

      if (data.success && data.data && data.data.todos && Array.isArray(data.data.todos)) {
        console.log(`[GoogleTasksSyncManager] ✅ Successfully fetched ${data.data.todos.length} todos from Google Tasks`);
        return {
          success: true,
          data: {
            todos: data.data.todos,
            lastSyncTime: data.data.lastSyncTime || new Date().toISOString()
          }
        };
      } else {
        console.warn(`[GoogleTasksSyncManager] Invalid response structure:`, data);
        return { success: false };
      }

    } catch (error) {
      console.error('[GoogleTasksSyncManager] Fetch from Google Tasks failed:', error);
      return { success: false };
    }
  }

  // 🔄 手动触发全量同步（向后兼容方法）
  // 注意：此方法已废弃，请使用 fetchFromGoogleTasks() 获取数据后由 GenericSyncManager 处理
  async manualSync(): Promise<boolean> {
    console.log(`[GoogleTasksSyncManager] ⚠️ manualSync() is deprecated, use fetchFromGoogleTasks() instead`);
    const result = await this.fetchFromGoogleTasks();
    return result.success;
  }

  // Network connection restored
  private handleOnline(): void {
    this.isOnline = true;
    console.log('[GoogleTasksSyncManager] Network online');
    // 🔄 不再自动触发同步，由 GenericSyncManager 统一管理
  }

  // Network connection lost
  private handleOffline(): void {
    this.isOnline = false;
    console.log('[GoogleTasksSyncManager] Network offline');
  }

  // Get synchronization status
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      isOnline: this.isOnline,
      hasPermission: this.hasGooglePermission,
      isAuthenticated: this.isAuthenticated
    };
  }

  // Get configuration
  getConfig(): GoogleTasksSyncConfig {
    return { ...this.config };
  }
}

// Create a global instance
export const googleTasksSyncManager = new GoogleTasksSyncManager();
