import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Button } from 'antd';
import { CloudSyncOutlined, GoogleOutlined, ReloadOutlined } from '@ant-design/icons';
import { googleTasksSyncManager } from './GoogleTasksSyncManager';

const GoogleTasksSyncIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState(googleTasksSyncManager.getSyncStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    // 定期更新同步状态
    const updateStatus = () => {
      setSyncStatus(googleTasksSyncManager.getSyncStatus());
    };

    // 初始更新
    updateStatus();

    // 设置定时器
    const interval = setInterval(updateStatus, 2000); // 每2秒更新一次

    return () => {
      clearInterval(interval);
    };
  }, []);

  // 手动触发同步
  const handleManualSync = async () => {
    console.log("Manual sync requested.");
    if (isManualSyncing || syncStatus.isSyncing) {
      return;
    }

    try {
      setIsManualSyncing(true);
      await googleTasksSyncManager.manualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // 如果用户未认证
  if (!syncStatus.isAuthenticated) {
    return null;
  }

  // 计算状态
  const isSyncing = syncStatus.isSyncing || isManualSyncing;
  const isOffline = !syncStatus.isOnline;
  const lastSyncAgo = syncStatus.lastSyncTime > 0 ? 
    Math.floor((Date.now() - syncStatus.lastSyncTime) / 1000) : null;

  // 状态颜色和文本
  let status: 'success' | 'processing' | 'default' | 'error' = 'default';
  let tooltip = 'Google Tasks sync';

  if (isOffline) {
    status = 'error';
    tooltip = 'Offline - Google Tasks sync paused';
  } else if (isSyncing) {
    status = 'processing';
    tooltip = 'Syncing with Google Tasks...';
  } else if (lastSyncAgo !== null && lastSyncAgo < 300) { // 5分钟内
    status = 'success';
    tooltip = `Last synced ${lastSyncAgo}s ago`;
  } else {
    status = 'default';
    tooltip = lastSyncAgo ? `Last synced ${Math.floor(lastSyncAgo / 60)}min ago` : 'Google Tasks sync ready';
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Tooltip title={tooltip} placement="bottom">
        <Badge status={status} style={{ marginRight: 4 }} />
      </Tooltip>
      
      <Tooltip title="Google Tasks" placement="bottom">
        <GoogleOutlined style={{ color: '#4285f4', fontSize: 14 }} />
      </Tooltip>

      <Tooltip title={isSyncing ? "Syncing..." : "Manual sync with Google Tasks"} placement="bottom">
        <Button 
          type="text" 
          size="small"
          icon={isSyncing ? <CloudSyncOutlined spin /> : <ReloadOutlined />}
          onClick={handleManualSync}
          disabled={isSyncing || isOffline}
          style={{ 
            padding: '0 4px', 
            height: 20, 
            minWidth: 20,
            color: isSyncing ? '#1890ff' : '#666'
          }}
        />
      </Tooltip>
    </div>
  );
};

export default GoogleTasksSyncIndicator;
