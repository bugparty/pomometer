import React, { useState, useEffect } from 'react'
import { Badge, Tooltip, Button, Space } from 'antd'
import { CloudOutlined, CloudSyncOutlined, DisconnectOutlined, GoogleOutlined, ReloadOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { RootState } from '../store'
import { todoSyncManager } from './todoSyncManager'
import { googleTasksSyncManager } from './GoogleTasksSyncManager'
import { hasGoogleTasksPermission } from '../../lib/googleTasks'

const SyncStatusIndicator: React.FC = () => {
  const intl = useIntl()
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [googleSyncStatus, setGoogleSyncStatus] = useState(googleTasksSyncManager.getSyncStatus())
  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  useEffect(() => {
    // 定期更新待同步数量
    const updatePendingCount = () => {
      setPendingCount(todoSyncManager.getPendingCount())
    }

    // 定期更新Google Tasks同步状态
    const updateGoogleSyncStatus = () => {
      setGoogleSyncStatus(googleTasksSyncManager.getSyncStatus())
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // 初始更新
    updatePendingCount()
    updateGoogleSyncStatus()

    // 设置定时器
    const interval = setInterval(() => {
      updatePendingCount()
      updateGoogleSyncStatus()
    }, 1000)

    // 监听网络状态
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // 手动触发Google Tasks同步
  const handleGoogleTasksSync = async () => {
    if (isManualSyncing || googleSyncStatus.isSyncing) {
      console.log("Sync in progress, please wait.");
      return;
    }

    if (!googleSyncStatus.hasPermission) {
      console.log("No permission for Google Tasks sync.");
      return;
    }

    try {
      setIsManualSyncing(true);
      await googleTasksSyncManager.manualSync();
    } catch (error) {
      console.error('Manual Google Tasks sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleOpenGoogleTasks = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.open('https://tasks.google.com', '_blank', 'noopener,noreferrer');
  };

  // 检查是否有Google Tasks权限
  const hasGooglePermission = isAuthenticated && hasGoogleTasksPermission();

  if (!isAuthenticated) {
    return null // 未登录时不显示同步状态
  }

  const getIcon = () => {
    if (!isOnline) {
      return <DisconnectOutlined style={{ color: '#ff4d4f' }} />
    }
    
    if (pendingCount > 0) {
      return <CloudSyncOutlined style={{ color: '#1890ff' }} spin />
    }
    
    return <CloudOutlined style={{ color: '#52c41a' }} />
  }

  const getTooltipText = () => {
    if (!isOnline) {
      return pendingCount > 0
        ? intl.formatMessage({ id: 'sync.status.offlineWithPending' }, { count: pendingCount })
        : intl.formatMessage({ id: 'sync.status.offline' })
    }

    if (pendingCount > 0) {
      return intl.formatMessage({ id: 'sync.status.syncingWithPending' }, { count: pendingCount })
    }

    return intl.formatMessage({ id: 'sync.status.allSynced' })
  }

  const handleClick = () => {
    if (isOnline && pendingCount > 0) {
      todoSyncManager.forceSync()
    }
  }

  // Google Tasks同步状态
  const getGoogleTasksStatus = () => {
    if (!hasGooglePermission) {
      return null;
    }

    const isSyncing = googleSyncStatus.isSyncing || isManualSyncing;
    const isOffline = !googleSyncStatus.isOnline;
    const lastSyncAgo = googleSyncStatus.lastSyncTime > 0 ? 
      Math.floor((Date.now() - googleSyncStatus.lastSyncTime) / 1000) : null;

    let status: 'success' | 'processing' | 'default' | 'error' = 'default';
    let tooltip = intl.formatMessage({
      id: 'sync.googleTasks.status.default',
      defaultMessage: 'Google Tasks sync',
    });

    if (isOffline) {
      status = 'error';
      tooltip = intl.formatMessage({
        id: 'sync.googleTasks.status.offline',
        defaultMessage: 'Offline - Google Tasks sync paused',
      });
    } else if (isSyncing) {
      status = 'processing';
      tooltip = intl.formatMessage({
        id: 'sync.googleTasks.status.syncing',
        defaultMessage: 'Syncing with Google Tasks...',
      });
    } else if (lastSyncAgo !== null && lastSyncAgo < 300) { // 5分钟内
      status = 'success';
      tooltip = intl.formatMessage(
        {
          id: 'sync.googleTasks.status.syncedSecondsAgo',
          defaultMessage: 'Google Tasks synced {seconds}s ago',
        },
        { seconds: lastSyncAgo }
      );
    } else {
      status = 'default';
      tooltip = lastSyncAgo
        ? intl.formatMessage(
            {
              id: 'sync.googleTasks.status.syncedMinutesAgo',
              defaultMessage: 'Google Tasks synced {minutes}min ago',
            },
            { minutes: Math.floor(lastSyncAgo / 60) }
          )
        : intl.formatMessage({
            id: 'sync.googleTasks.status.ready',
            defaultMessage: 'Google Tasks sync ready',
          });
    }

    return {
      status,
      tooltip,
      isSyncing,
      isOffline
    };
  };

  const googleStatus = getGoogleTasksStatus();

  return (
    <Space size="small">
      {/* 原有的同步状态指示器 */}
      <Tooltip title={getTooltipText()}>
        <Badge count={pendingCount} size="small">
          <div 
            style={{ cursor: pendingCount > 0 ? 'pointer' : 'default', padding: '4px' }}
            onClick={handleClick}
          >
            {getIcon()}
          </div>
        </Badge>
      </Tooltip>

      {/* Google Tasks同步状态 */}
      {googleStatus && (
        <Space size={4}>
          <Tooltip title={googleStatus.tooltip} placement="bottom">
            <Badge status={googleStatus.status} style={{ marginRight: 2 }} />
          </Tooltip>
          
          <Tooltip
            title={intl.formatMessage({
              id: 'sync.googleTasks.badge',
              defaultMessage: 'Google Tasks',
            })}
            placement="bottom"
          >
            <Button
              type="text"
              size="small"
              icon={<GoogleOutlined style={{ color: '#4285f4', fontSize: 14 }} />}
              aria-label={intl.formatMessage({
                id: 'sync.googleTasks.openAria',
                defaultMessage: 'Open Google Tasks',
              })}
              onClick={handleOpenGoogleTasks}
              style={{
                padding: '0 4px',
                height: 20,
                minWidth: 20
              }}
            />
          </Tooltip>

          <Tooltip 
            title={
              googleStatus.isSyncing
                ? intl.formatMessage({
                    id: 'sync.googleTasks.tooltip.syncingShort',
                    defaultMessage: 'Syncing...',
                  })
                : intl.formatMessage({
                    id: 'sync.googleTasks.tooltip.manualSync',
                    defaultMessage: 'Manual sync with Google Tasks',
                  })
            }
            placement="bottom"
          >
            <Button 
              type="text" 
              size="small"
              data-testid="google-tasks-manual-sync"
              icon={googleStatus.isSyncing ? <CloudSyncOutlined spin /> : <ReloadOutlined />}
              onClick={handleGoogleTasksSync}
              disabled={googleStatus.isSyncing || googleStatus.isOffline}
              style={{ 
                padding: '0 4px', 
                height: 20, 
                minWidth: 20,
                color: googleStatus.isSyncing ? '#1890ff' : '#666'
              }}
            />
          </Tooltip>
        </Space>
      )}
    </Space>
  )
}

export default SyncStatusIndicator
