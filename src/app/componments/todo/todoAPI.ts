// API接口类型定义
import type { Todo } from '../../types/api'

export interface TodoOperationPayload {
  id?: string
  text?: string
  completed?: boolean
  checked?: boolean
  focus?: boolean
  createdDate?: string
  parentId?: string
  subId?: string
  subText?: string
  startTime?: string
  endTime?: string
  description?: string
}

export interface TodoOperation {
  type: string
  payload: TodoOperationPayload
  timestamp: string
  id?: string // 本地操作ID，用于去重
}

export interface SyncRequest {
  operations: TodoOperation[]
  lastSyncTime: string | null
}

export interface SyncResponse {
  success: boolean
  data: {
    conflicts: TodoOperation[]
    serverOperations: TodoOperation[]
    lastSyncTime: string
  }
  error?: {
    code: string
    message: string
    details?: Record<string, string | number | boolean | null>
  }
}

export interface TodosResponse {
  success: boolean
  data: {
    todos: Todo[]
    lastSyncTime: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface UpdatesResponse {
  success: boolean
  data: {
    operations: TodoOperation[]
    lastSyncTime: string
  }
  error?: {
    code: string
    message: string
  }
}

// API客户端
class TodoAPI {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Always get the latest token from localStorage to ensure it's current
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
    }
    
    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if authentication is required for this endpoint
    if (endpoint.startsWith('/api/todos') && !this.isAuthenticated()) {
      throw new Error('Authentication required: Please log in to access todos.')
    }

    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Check if we have a token
        const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!currentToken) {
          throw new Error('Authentication required: No token found. Please log in.')
        } else {
          throw new Error('Authentication failed: Token may be expired or invalid. Please log in again.')
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // 获取所有待办事项
  async getTodos(): Promise<TodosResponse> {
    return this.request<TodosResponse>('/api/todos')
  }

  // 同步操作到服务器
  async syncOperations(operations: TodoOperation[], lastSyncTime: string | null): Promise<SyncResponse> {
    return this.request<SyncResponse>('/api/todos/sync', {
      method: 'POST',
      body: JSON.stringify({
        operations,
        lastSyncTime,
      }),
    })
  }

  // 获取增量更新
  async getUpdates(since: string): Promise<UpdatesResponse> {
    const params = new URLSearchParams({ since })
    return this.request<UpdatesResponse>(`/api/todos/updates?${params}`)
  }

  // 更新token
  setToken(token: string | null) {
    this.token = token
    try {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    } catch (error) {
      console.error('Failed to save token to localStorage:', error)
    }
  }

  // 刷新token从localStorage
  refreshToken() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    return !!currentToken
  }
}

let todoAPIInstance: TodoAPI | null = null;

export const getTodoAPI = () => {
  if (!todoAPIInstance) {
    todoAPIInstance = new TodoAPI();
  }
  return todoAPIInstance;
};

// 为了向后兼容，保留原有的导出方式
export const todoAPI = {
  get instance() {
    return getTodoAPI();
  }
};
