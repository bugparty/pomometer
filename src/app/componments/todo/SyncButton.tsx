import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { RootState } from '../store';
import { getTodoSyncManager } from './todoSyncManager';
import { googleTasksSyncManager } from './GoogleTasksSyncManager';

// 🔄 手动同步按钮组件
// 功能：触发全量同步（先同步本地操作，再从服务器拉取数据）
const SyncButton: React.FC = () => {
  const intl = useIntl();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hasGooglePermission = googleTasksSyncManager.getSyncStatus().hasPermission;

  // 定期更新pending操作数量
  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(getTodoSyncManager().getPendingCount());
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 1000);

    return () => clearInterval(interval);
  }, []);

  // 如果未登录或没有Google Tasks权限，不显示按钮
  if (!isAuthenticated) {
    return null;
  }

  const handleSync = async () => {
    if (isSyncing) return;

    console.log('[SyncButton] Manual sync triggered by user');
    setIsSyncing(true);

    try {
      // 调用统一的全量同步
      const success = await getTodoSyncManager().triggerFullSync();

      if (success) {
        setLastSyncTime(new Date());
        console.log('[SyncButton] ✅ Sync completed successfully');
      } else {
        console.error('[SyncButton] ❌ Sync failed');
      }
    } catch (error) {
      console.error('[SyncButton] ❌ Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getTooltipTitle = () => {
    if (isSyncing) {
      return intl.formatMessage({ id: 'sync.tooltip.syncing' });
    }
    if (pendingCount > 0) {
      return intl.formatMessage({ id: 'sync.tooltip.withPending' }, { count: pendingCount });
    }
    if (hasGooglePermission) {
      return intl.formatMessage({ id: 'sync.tooltip.googleTasks' });
    }
    return intl.formatMessage({ id: 'sync.tooltip.default' });
  };

  const getButtonText = () => {
    if (isSyncing) {
      return intl.formatMessage({ id: 'sync.button.syncing' });
    }
    if (pendingCount > 0) {
      return intl.formatMessage({ id: 'sync.button.withPending' }, { count: pendingCount });
    }
    return intl.formatMessage({ id: 'sync.button.default' });
  };

  return (
    <Tooltip title={getTooltipTitle()}>
      <Button
        type={pendingCount > 0 ? 'primary' : 'default'}
        data-testid="todo-full-sync-button"
        icon={<SyncOutlined spin={isSyncing} />}
        onClick={handleSync}
        disabled={isSyncing}
        size="small"
        style={{ marginLeft: 8 }}
      >
        {getButtonText()}
      </Button>
    </Tooltip>
  );
};

export default SyncButton;
