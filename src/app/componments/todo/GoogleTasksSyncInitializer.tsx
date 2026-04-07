import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { googleTasksSyncManager } from './GoogleTasksSyncManager';
import { hasGoogleTasksPermission } from '../../lib/googleTasks';
import { getTodoSyncManager } from './todoSyncManager';

// 🔄 重构说明：这个组件负责初始化同步系统
// - 不再启动 GoogleTasksSyncManager 的定时同步
// - 登录时触发一次全量同步（通过 GenericSyncManager）
const GoogleTasksSyncInitializer: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    console.log(`[GoogleTasksSyncInitializer] Auth state changed: ${isAuthenticated}`);

    // 检查Google Tasks权限
    const hasPermission = isAuthenticated && hasGoogleTasksPermission();

    console.log(`[GoogleTasksSyncInitializer] Google Tasks permission: ${hasPermission}`);

    // 更新同步管理器的状态
    googleTasksSyncManager.setAuthenticationState(isAuthenticated);

    // 🔄 登录时触发一次全量同步
    if (isAuthenticated && hasPermission) {
      console.log(`[GoogleTasksSyncInitializer] 🔄 Triggering initial full sync on login...`);

      // 延迟2秒后执行全量同步，给其他初始化足够时间
      setTimeout(async () => {
        try {
          const success = await getTodoSyncManager().triggerFullSync();
          if (success) {
            console.log(`[GoogleTasksSyncInitializer] ✅ Initial full sync completed`);
          } else {
            console.warn(`[GoogleTasksSyncInitializer] ⚠️ Initial full sync failed`);
          }
        } catch (error) {
          console.error(`[GoogleTasksSyncInitializer] ❌ Initial full sync error:`, error);
        }
      }, 2000);
    }

    // 清理函数
    return () => {
      if (!isAuthenticated) {
        console.log(`[GoogleTasksSyncInitializer] User logged out`);
      }
    };
  }, [isAuthenticated]);

  // 这个组件不渲染任何UI
  return null;
};

export default GoogleTasksSyncInitializer;
