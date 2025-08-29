import store from '../store'

// 通用操作接口
export interface SyncOperation {
  type: string
  payload: unknown
  timestamp: string
  id?: string
}

// 待同步操作接口
export interface PendingSyncOperation {
  id: string
  operation: SyncOperation
  retries: number
  createdAt: number
}

// 同步响应接口
export interface GenericSyncResponse {
  success: boolean
  data: {
    conflicts: SyncOperation[]
    serverOperations: SyncOperation[]
    lastSyncTime: string
    [key: string]: unknown // 允许额外的数据字段
  }
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// API接口
export interface SyncAPI {
  syncOperations(operations: SyncOperation[], lastSyncTime: string | null): Promise<GenericSyncResponse>
  fetchData(): Promise<unknown>
  setToken(token: string | null): void
}

// 操作处理器接口
export interface OperationHandler {
  applyOperation(operation: SyncOperation): void
  replaceData(data: unknown): void
}

// 通用同步管理器
export class GenericSyncManager {
  private pendingOperations: PendingSyncOperation[] = []
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncTime: string | null = null
  private maxRetries = 3
  private syncIntervalMs: number
  private isAuthenticated = false
  private storageKey: string
  private api: SyncAPI
  private operationHandler: OperationHandler

  constructor(
    storageKey: string, 
    api: SyncAPI, 
    operationHandler: OperationHandler,
    syncIntervalMs: number = 30000
  ) {
    this.storageKey = storageKey
    this.api = api
    this.operationHandler = operationHandler
    this.syncIntervalMs = syncIntervalMs
    
    // 监听网络状态 (仅在客户端)
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
    }
    
    // 从localStorage恢复数据
    this.loadFromStorage()
    
    // 注意：定时同步将在 setAuthenticated 被调用时启动
    // 不要在构造函数中启动，因为此时用户可能还未认证
  }

  // 注入/更新当前使用的认证 token
  setToken(token: string | null) {
    this.api.setToken(token)
  }

  // 设置认证状态
  setAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated
    if (isAuthenticated) {
      this.startPeriodicSync()
    } else {
      this.stopPeriodicSync()
      this.clearPendingOperations()
    }
  }

  // 添加操作到待同步队列
  addOperation(operation: SyncOperation) {
    if (!this.isAuthenticated) {
      console.log(`${this.storageKey}: Not authenticated, skipping operation`)
      return
    }

    const pendingOp: PendingSyncOperation = {
      id: operation.id || this.generateId(),
      operation: {
        ...operation,
        timestamp: operation.timestamp || new Date().toISOString(),
      },
      retries: 0,
      createdAt: Date.now(),
    }

    this.pendingOperations.push(pendingOp)
    this.saveToStorage()
    
    console.log(`${this.storageKey}: Added operation`, operation.type)

    // 如果在线，立即尝试同步
    if (this.isOnline) {
      setTimeout(() => this.syncToServer(), 100)
    }
  }

  // 同步到服务器
  private async syncToServer() {
    if (!this.isAuthenticated || !this.isOnline || this.pendingOperations.length === 0) {
      return
    }

    console.log(`${this.storageKey}: Syncing to server`, this.pendingOperations.length, 'operations')

    try {
      const operations = this.pendingOperations.map(pending => pending.operation)
      const response: GenericSyncResponse = await this.api.syncOperations(operations, this.lastSyncTime)

      if (response.success) {
        // 更新最后同步时间
        this.lastSyncTime = response.data.lastSyncTime
        
        // 应用服务端操作到本地状态
        this.applyServerOperations(response.data.serverOperations)
        
        // 清除已同步的操作
        this.clearPendingOperations()
        
        console.log(`${this.storageKey}: Sync successful`)
      } else {
        console.error(`${this.storageKey}: Sync failed:`, response.error)
      }
    } catch (error) {
      console.error(`${this.storageKey}: Sync failed:`, error)
      this.handleSyncError()
    }
  }

  // 应用服务器操作到本地状态
  private applyServerOperations(operations: SyncOperation[]) {
    console.log(`[SyncManager] ===== APPLYING SERVER OPERATIONS =====`)
    console.log(`[SyncManager] ${this.storageKey}: About to apply ${operations.length} server operations`)
    console.log(`[SyncManager] Server operations:`, operations)
    
    operations.forEach(operation => {
      console.log(`[SyncManager] Applying server operation:`, operation)
      this.operationHandler.applyOperation(operation)
    })
    
    console.log(`[SyncManager] ===== SERVER OPERATIONS APPLIED =====`)
  }

  // 处理同步错误
  private handleSyncError() {
    // 增加重试次数
    this.pendingOperations.forEach(op => {
      op.retries += 1
    })
    
    // 移除超过最大重试次数的操作
    this.pendingOperations = this.pendingOperations.filter(op => op.retries < this.maxRetries)
    
    this.saveToStorage()
  }

  // 从服务器获取数据
  private isFetching = false
  private lastFetchTime = 0
  private readonly FETCH_COOLDOWN = 15000 // 增加到15秒冷却时间，防止覆盖用户操作

  async fetchDataFromServer() {
    console.log(`[SyncManager] ===== ${this.storageKey.toUpperCase()} FETCH DATA FROM SERVER START =====`)
    console.log(`[SyncManager] Call stack:`, new Error().stack?.split('\n').slice(1, 5))
    
    if (!this.isAuthenticated || !this.isOnline) {
      console.log(`[SyncManager] Not authenticated or offline, skipping fetch`)
      return
    }

    // 防止重复调用
    if (this.isFetching) {
      console.log(`${this.storageKey}: Already fetching data, skipping...`)
      return
    }

    // 检查冷却时间
    const now = Date.now()
    if (now - this.lastFetchTime < this.FETCH_COOLDOWN) {
      console.log(`${this.storageKey}: Fetch cooldown active, skipping...`)
      return
    }

    try {
      this.isFetching = true
      this.lastFetchTime = now
      
      console.log(`[SyncManager] ${this.storageKey}: Fetching data from server`)
      const response = await this.api.fetchData()
      
      // 类型断言，因为我们知道API响应的结构
      const typedResponse = response as { success: boolean; data?: { lastSyncTime: string } };
      
      if (typedResponse.success) {
        console.log(`[SyncManager] ${this.storageKey}: Server response success, about to REPLACE LOCAL DATA`)
        console.log(`[SyncManager] Current local data will be OVERWRITTEN with server data`)
        
        // 使用服务端数据更新本地状态
        if (typedResponse.data) {
          this.lastSyncTime = typedResponse.data.lastSyncTime
          this.operationHandler.replaceData(typedResponse.data)
        }
        
        this.saveToStorage()
        console.log(`[SyncManager] ${this.storageKey}: Local data REPLACED with server data`)
        console.log(`[SyncManager] ===== ${this.storageKey.toUpperCase()} FETCH DATA FROM SERVER END =====`)
      }
    } catch (error) {
      console.error(`Failed to fetch ${this.storageKey} from server:`, error)
    } finally {
      this.isFetching = false
    }
  }

  // 网络连接恢复
  private handleOnline() {
    this.isOnline = true
    console.log(`${this.storageKey}: Online`)
    if (this.isAuthenticated && !this.syncInterval) {
      this.startPeriodicSync()
      // 立即尝试同步
      setTimeout(() => this.syncToServer(), 1000)
    }
  }

  // 网络断开
  private handleOffline() {
    this.isOnline = false
    console.log(`${this.storageKey}: Offline`)
    this.stopPeriodicSync()
  }

  // 开始定时同步
  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    if (this.isAuthenticated && this.isOnline) {
      this.syncInterval = setInterval(() => {
        // 只有在有待同步操作时才进行同步
        if (this.pendingOperations.length > 0) {
          this.syncToServer()
        }
      }, this.syncIntervalMs)
    }
  }

  // 停止定时同步
  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // 清除待同步操作
  private clearPendingOperations() {
    this.pendingOperations = []
    this.saveToStorage()
  }

  // 保存到localStorage
  private saveToStorage() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(`${this.storageKey}_sync_state`, JSON.stringify({
        pendingOperations: this.pendingOperations,
        lastSyncTime: this.lastSyncTime
      }))
    } catch (error) {
      console.error(`Failed to save ${this.storageKey} sync state to storage:`, error)
    }
  }

  // 从localStorage加载
  private loadFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      const saved = localStorage.getItem(`${this.storageKey}_sync_state`)
      if (saved) {
        const { pendingOperations, lastSyncTime } = JSON.parse(saved)
        this.pendingOperations = pendingOperations || []
        this.lastSyncTime = lastSyncTime
      }
    } catch (error) {
      console.error(`Failed to load ${this.storageKey} sync state from storage:`, error)
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`
  }

  // 获取同步状态
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isAuthenticated: this.isAuthenticated,
      pendingOperationsCount: this.pendingOperations.length,
      lastSyncTime: this.lastSyncTime
    }
  }

  // 获取待同步操作数量
  getPendingCount(): number {
    return this.pendingOperations.length
  }

  // 手动触发同步
  async forceSync() {
    await this.syncToServer()
  }
}
