// Google Tasks同步配置
export interface GoogleTasksSyncConfig {
  // 同步间隔（毫秒）
  syncIntervalMs: number;
  
  // 最小同步间隔（毫秒），防止过于频繁的同步
  minSyncIntervalMs: number;
  
  // 是否启用后台同步（页面隐藏时是否继续同步）
  enableBackgroundSync: boolean;
  
  // 网络恢复后的同步延迟（毫秒）
  networkRecoveryDelayMs: number;
  
  // 页面可见后的同步延迟（毫秒）
  visibilityRecoveryDelayMs: number;
  
  // 认证后的初始同步延迟（毫秒）
  authRecoveryDelayMs: number;
}

// 默认配置
export const DEFAULT_GOOGLE_TASKS_SYNC_CONFIG: GoogleTasksSyncConfig = {
  syncIntervalMs: 5 * 60 * 1000,        // 5分钟
  minSyncIntervalMs: 60 * 1000,         // 1分钟
  enableBackgroundSync: false,          // 不在后台同步
  networkRecoveryDelayMs: 2000,         // 网络恢复2秒后同步
  visibilityRecoveryDelayMs: 1000,      // 页面可见1秒后同步
  authRecoveryDelayMs: 1000,            // 认证成功1秒后同步
};

// 开发环境配置（更频繁的同步用于测试）
export const DEV_GOOGLE_TASKS_SYNC_CONFIG: GoogleTasksSyncConfig = {
  syncIntervalMs: 1 * 60 * 1000,        // 2分钟
  minSyncIntervalMs: 20 * 1000,         // 30秒
  enableBackgroundSync: false,          
  networkRecoveryDelayMs: 1000,         
  visibilityRecoveryDelayMs: 500,       
  authRecoveryDelayMs: 500,             
};

// 获取当前配置
export const getGoogleTasksSyncConfig = (): GoogleTasksSyncConfig => {
  // 可以根据环境变量或用户设置来选择配置
  if (process.env.NODE_ENV === 'development') {
    return DEV_GOOGLE_TASKS_SYNC_CONFIG;
  }
  return DEFAULT_GOOGLE_TASKS_SYNC_CONFIG;
};
