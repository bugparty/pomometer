import { hasGoogleTasksPermission } from '../../lib/googleTasks';
import { todoSyncActions } from './todoSyncActions';
import { getGoogleTasksSyncConfig, type GoogleTasksSyncConfig } from './googleTasksSyncConfig';
import { type TodoItem } from './todoSlice';

// Google Tasks synchronization manager
class GoogleTasksSyncManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isAuthenticated = false;
  private hasGooglePermission = false;
  private config: GoogleTasksSyncConfig;
  private isSyncing = false;
  private lastSyncTime = 0;

  constructor(config?: Partial<GoogleTasksSyncConfig>) {
    this.config = { ...getGoogleTasksSyncConfig(), ...config };
    
    // Listen for network status changes (client-side only)
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      window.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  // Set authentication status and Google Tasks permission
  setAuthenticationState(isAuthenticated: boolean): void {
    this.isAuthenticated = isAuthenticated;
    this.hasGooglePermission = isAuthenticated && hasGoogleTasksPermission();
    
    if (this.hasGooglePermission) {
      this.startPeriodicSync();
      // Perform a sync immediately after authentication
      setTimeout(() => this.performSync(), 1000);
    } else {
      this.stopPeriodicSync();
    }
  }

  // Start periodic synchronization
  start(): void {
    if (this.syncInterval) {
      return; // already running
    }

    if (!this.config.enableBackgroundSync) {
      return;
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.config.syncIntervalMs);
  }

  // Start periodic synchronization
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.hasGooglePermission && this.isOnline) {
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, this.config.syncIntervalMs);
    }
  }

  // Stop periodic synchronization
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Stop synchronization
  stop(): void {
    this.stopPeriodicSync();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
      window.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  // Execute synchronization
  private async performSync(): Promise<void> {
    console.log("Performing Google Tasks sync...");
    // Prevent duplicate synchronization
    if (this.isSyncing) {
      return;
    }

    // Check basic conditions
    if (!this.isOnline || !this.hasGooglePermission) {
      return;
    }

    // Check minimum sync interval
    const now = Date.now();
    if (now - this.lastSyncTime < this.config.minSyncIntervalMs) {
      return;
    }

    this.isSyncing = true;
    this.lastSyncTime = now;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      const response = await fetch('/api/todos/google-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Google Tasks sync failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; data?: { todos?: unknown[] } };
      console.log(`[GoogleTasksSyncManager] Raw API response:`, data);

      // Update Redux store - fix: access the correct data path
      if (data.success && data.data && data.data.todos && Array.isArray(data.data.todos)) {
        console.log(`[GoogleTasksSyncManager] ✅ Sync successful! Received ${data.data.todos.length} todos from sync API`);
        console.log(`[GoogleTasksSyncManager] About to update Redux store with todos`);
        todoSyncActions.replaceFromGoogleTasks(data.data.todos as TodoItem[]);
        console.log(`[GoogleTasksSyncManager] ✅ Redux store updated successfully`);
      } else {
        console.warn(`[GoogleTasksSyncManager] ❌ Invalid response structure:`, data);
      }

    } catch (error) {
      // If it's an authentication error, stop synchronization
      if (error instanceof Error && error.message.includes('401')) {
        this.setAuthenticationState(false);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  // Manual synchronization
  async manualSync(): Promise<boolean> {
    console.log(`[GoogleTasksSyncManager] Manual sync requested`);
    
    if (!this.hasGooglePermission) {
      console.log(`[GoogleTasksSyncManager] No Google permission, manual sync aborted`);
      return false;
    }

    console.log(`[GoogleTasksSyncManager] Starting manual sync...`);
    await this.performSync();
    const success = !this.isSyncing;
    console.log(`[GoogleTasksSyncManager] Manual sync ${success ? 'completed successfully' : 'failed'}`);
    return success; // If not syncing anymore, synchronization has finished
  }

  // Network connection restored
  private handleOnline(): void {
    this.isOnline = true;
    if (this.hasGooglePermission) {
      this.startPeriodicSync();
      // Sync immediately after network recovery
      setTimeout(() => this.performSync(), 2000);
    }
  }

  // Network connection lost
  private handleOffline(): void {
    this.isOnline = false;
    this.stopPeriodicSync();
  }

  // Page visibility change
  private handleVisibilityChange(): void {
    if (typeof document !== 'undefined') {
      const isVisible = !document.hidden;
      
      if (isVisible && this.hasGooglePermission && this.isOnline) {
        // When the page becomes visible again, sync immediately if enough time has passed since last sync
        const timeSinceLastSync = Date.now() - this.lastSyncTime;
        if (timeSinceLastSync > this.config.syncIntervalMs / 2) {
          setTimeout(() => this.performSync(), 1000);
        }
      }
    }
  }

  // Get synchronization status
  getSyncStatus() {
    return {
      isRunning: this.syncInterval !== null,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      isOnline: this.isOnline,
      hasPermission: this.hasGooglePermission,
      isAuthenticated: this.isAuthenticated,
      intervalMs: this.config.syncIntervalMs
    };
  }

  // Get configuration
  getConfig(): GoogleTasksSyncConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<GoogleTasksSyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // If the sync interval changes, restart synchronization
    if (newConfig.syncIntervalMs && this.syncInterval) {
      this.stopPeriodicSync();
      this.startPeriodicSync();
    }
  }
}

// Create a global instance
export const googleTasksSyncManager = new GoogleTasksSyncManager();
