// Settings API interface type definitions
export interface SettingsPayload {
  value: number | boolean | string
}

export interface SettingsOperation {
  type: string
  payload: SettingsPayload
  timestamp: string
  id?: string // Local operation ID for deduplication
}

export interface SettingsSyncRequest {
  operations: SettingsOperation[]
  lastSyncTime: string | null
}

export interface SettingsSyncResponse {
  success: boolean
  data: {
    conflicts: SettingsOperation[]
    serverOperations: SettingsOperation[]
    lastSyncTime: string
    settings: UserSettings
  }
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface UserSettings {
  pomodoro_duration: number
  short_break_duration: number
  long_break_duration: number
  ticking_sound_enabled: boolean
  rest_ticking_sound_enabled: boolean
}

class SettingsAPI {
  private token: string | null = null
  // Base URL for API calls. Keep empty for same-origin relative requests so it works in Next.js
  // Can be overridden via NEXT_PUBLIC_API_BASE_URL (e.g., https://your-domain.com) WITHOUT trailing slash
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    }
  }

  async syncSettings(request: SettingsSyncRequest): Promise<SettingsSyncResponse> {
    try {
  // Next.js route lives at /api/settings/sync (was /settings/sync in legacy worker client causing 404)
  const response = await fetch(`${this.baseURL}/api/settings/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Settings sync error:', error)
      return {
        success: false,
        data: {
          conflicts: [],
          serverOperations: [],
          lastSyncTime: new Date().toISOString(),
          settings: {
            pomodoro_duration: 25,
            short_break_duration: 5,
            long_break_duration: 15,
            ticking_sound_enabled: true,
            rest_ticking_sound_enabled: false
          }
        },
        error: {
          code: 'SYNC_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  async getSettings(): Promise<{ success: boolean; data: { settings: UserSettings; lastSyncTime: string } }> {
    try {
  const response = await fetch(`${this.baseURL}/api/settings`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get settings error:', error)
      return {
        success: false,
        data: {
          settings: {
            pomodoro_duration: 25,
            short_break_duration: 5,
            long_break_duration: 15,
            ticking_sound_enabled: true,
            rest_ticking_sound_enabled: false
          },
          lastSyncTime: new Date().toISOString()
        }
      }
    }
  }

  async updateSettings(operations: SettingsOperation[]): Promise<{ success: boolean; lastSyncTime?: string }> {
    try {
  // NOTE: /api/settings/operations route not yet implemented in Next.js. Keep call aligned; implement server route if needed.
  const response = await fetch(`${this.baseURL}/api/settings/operations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ operations })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json() as { lastSyncTime: string }
      return {
        success: true,
        lastSyncTime: result.lastSyncTime
      }
    } catch (error) {
      console.error('Update settings error:', error)
      return { success: false }
    }
  }
}

// Singleton management
let settingsAPIInstance: SettingsAPI | null = null;

export const getSettingsAPI = () => {
  if (!settingsAPIInstance) {
    settingsAPIInstance = new SettingsAPI();
  }
  return settingsAPIInstance;
};

// For backward compatibility
export const settingsAPI = {
  get instance() {
    return getSettingsAPI();
  }
};

export default SettingsAPI;
