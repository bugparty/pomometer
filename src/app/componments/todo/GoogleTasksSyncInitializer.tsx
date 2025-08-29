import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../rootReducer';
import { googleTasksSyncManager } from './GoogleTasksSyncManager';
import { hasGoogleTasksPermission } from '../../lib/googleTasks';

// 这个组件负责初始化和管理Google Tasks同步
const GoogleTasksSyncInitializer: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  useEffect(() => {
    console.log(`[GoogleTasksSyncInitializer] Auth state changed: ${isAuthenticated}`);
    
    // 检查Google Tasks权限
    const hasPermission = isAuthenticated && hasGoogleTasksPermission();
    
    console.log(`[GoogleTasksSyncInitializer] Google Tasks permission: ${hasPermission}`);
    
    // 更新同步管理器的状态
    googleTasksSyncManager.setAuthenticationState(isAuthenticated);
    
    // 清理函数
    return () => {
      if (!isAuthenticated) {
        console.log(`[GoogleTasksSyncInitializer] User logged out, stopping Google Tasks sync`);
      }
    };
  }, [isAuthenticated]);

  // 这个组件不渲染任何UI
  return null;
};

export default GoogleTasksSyncInitializer;
