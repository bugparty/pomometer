import { settingsSyncManager } from './settingsSyncManager'
import { SettingsOperation, SettingsPayload } from './settingsAPI'

function createOperation(type: string, payload: SettingsPayload): SettingsOperation {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
    id: `${Date.now()}-${Math.random().toString(36).substring(2)}`
  }
}

export const settingsSyncActions = {
  updatePomodoroDuration(duration: number) {
    const operation = createOperation('UPDATE_POMODORO_DURATION', {
      value: duration
    })
    settingsSyncManager.addOperation(operation)
  },

  updateShortBreakDuration(duration: number) {
    const operation = createOperation('UPDATE_SHORT_BREAK_DURATION', {
      value: duration
    })
    settingsSyncManager.addOperation(operation)
  },

  updateLongBreakDuration(duration: number) {
    const operation = createOperation('UPDATE_LONG_BREAK_DURATION', {
      value: duration
    })
    settingsSyncManager.addOperation(operation)
  },

  updateTickingSound(enabled: boolean) {
    const operation = createOperation('UPDATE_TICKING_SOUND', {
      value: enabled
    })
    settingsSyncManager.addOperation(operation)
  },

  updateRestTickingSound(enabled: boolean) {
    const operation = createOperation('UPDATE_REST_TICKING_SOUND', {
      value: enabled
    })
    settingsSyncManager.addOperation(operation)
  },

  updateLanguage(language: string) {
    const operation = createOperation('UPDATE_LANGUAGE', {
      value: language
    })
    settingsSyncManager.addOperation(operation)
  }
}
