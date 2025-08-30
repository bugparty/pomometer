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

// Settings API adapter
class SettingsAPIAdapter implements SyncAPI {
  async syncOperations(operations: SyncOperation[], lastSyncTime: string | null) {
    // Convert to SettingsOperation type
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

// Settings operation handler
class SettingsOperationHandler implements OperationHandler {
  applyOperation(operation: SyncOperation) {
    const { type, payload } = operation
    
    // Type assertion since we know payload structures for different operation types
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
    // Update local state with server settings
    const typedData = data as { settings: SettingsUpdate; lastSyncTime: string };
    store.dispatch(replaceSettings({
      settings: typedData.settings,
      lastSyncTime: typedData.lastSyncTime
    }))
  }
}

// Create Settings sync manager instance
export const settingsSyncManager = new GenericSyncManager(
  'settings',
  new SettingsAPIAdapter(),
  new SettingsOperationHandler(),
  10000 // 10-second sync interval for frequent synchronization
)

// Wrapper method to maintain backward compatibility
export const fetchSettingsFromServer = () => settingsSyncManager.fetchDataFromServer()
