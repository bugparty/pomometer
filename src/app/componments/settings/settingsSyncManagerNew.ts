import { GenericSyncManager, SyncAPI, OperationHandler, SyncOperation } from '../sync/GenericSyncManager'
import { settingsAPI, SettingsOperation, SettingsPayload } from './settingsAPI'
import store from '../store'
import type { SettingsUpdate } from './SettingsTypes'
import { 
  set_pomodoro_break, 
  set_short_break, 
  set_long_break,
  set_ticking_sound,
  set_rest_ticking_sound,
  set_language,
  replaceSettings
} from '../clock/ClockSlice'

// Settings API适配器
class SettingsAPIAdapter implements SyncAPI {
  async syncOperations(operations: SyncOperation[], lastSyncTime: string | null) {
    // 转换为SettingsOperation类型
    const settingsOperations: SettingsOperation[] = operations.map(op => ({
      type: op.type,
      payload: op.payload as SettingsPayload,
      timestamp: op.timestamp,
      id: op.id
    }))
    
    return await settingsAPI.instance.syncSettings({
      operations: settingsOperations,
      lastSyncTime
    })
  }

  async fetchData() {
    return await settingsAPI.instance.getSettings()
  }

  setToken(token: string | null) {
    settingsAPI.instance.setToken(token)
  }
}

// Settings操作处理器
class SettingsOperationHandler implements OperationHandler {
  applyOperation(operation: SyncOperation) {
    const { type, payload } = operation
    
    // 类型断言，因为我们知道不同操作类型的payload结构
    const typedPayload = payload as { value: number | boolean | string };
    
    switch (type) {
      case 'UPDATE_POMODORO_DURATION':
        store.dispatch(set_pomodoro_break(typedPayload.value as number))
        break
      case 'UPDATE_SHORT_BREAK_DURATION':
        store.dispatch(set_short_break(typedPayload.value as number))
        break
      case 'UPDATE_LONG_BREAK_DURATION':
        store.dispatch(set_long_break(typedPayload.value as number))
        break
      case 'UPDATE_TICKING_SOUND':
        store.dispatch(set_ticking_sound(typedPayload.value as boolean))
        break
      case 'UPDATE_REST_TICKING_SOUND':
        store.dispatch(set_rest_ticking_sound(typedPayload.value as boolean))
        break
      case 'UPDATE_LANGUAGE':
        store.dispatch(set_language(typedPayload.value as string))
        break
      default:
        console.warn('Unknown settings operation type:', type)
    }
  }

  replaceData(data: unknown) {
    // 使用服务端设置更新本地状态
    const typedData = data as { settings: SettingsUpdate; lastSyncTime: string };
    store.dispatch(replaceSettings({
      settings: typedData.settings,
      lastSyncTime: typedData.lastSyncTime
    }))
  }
}

// 创建Settings同步管理器实例
export const settingsSyncManager = new GenericSyncManager(
  'settings',
  new SettingsAPIAdapter(),
  new SettingsOperationHandler(),
  10000 // 10秒同步间隔，设置同步频率较高
)

// 为了保持向后兼容，提供一个包装方法
export const fetchSettingsFromServer = () => settingsSyncManager.fetchDataFromServer()
