import store from '../store'
import { getTodoSyncManager } from '../todo/todoSyncManager'
import { settingsSyncManager } from '../settings/settingsSyncManager'

// 监听认证状态变化，控制所有同步管理器
let prevAuthState = false
let prevToken: string | null = null
let isInitialized = false
let unsubscribe: (() => void) | null = null
let lastHandledTime = 0
const MIN_HANDLE_INTERVAL = 50 // 最小处理间隔50ms

const handleAuthStateChange = () => {
  // 防止过于频繁的处理
  const now = Date.now()
  if (now - lastHandledTime < MIN_HANDLE_INTERVAL) {
    return
  }

  const state = store.getState()
  const currentAuthState = state.auth.isAuthenticated
  const token = state.auth.token

  // 只有当认证状态或token真正发生变化时才处理
  const authStateChanged = prevAuthState !== currentAuthState
  const tokenChanged = prevToken !== token

  if (!authStateChanged && !tokenChanged) {
    // 没有相关变化，直接返回
    return
  }

  lastHandledTime = now

  console.log('Auth state change detected:', { 
    currentAuthState, 
    hasToken: !!token, 
    tokenLength: token ? token.length : 0,
    authStateChanged,
    tokenChanged
  })

  // 认证状态发生变化
  if (authStateChanged) {
    console.log('Auth state changed:', { from: prevAuthState, to: currentAuthState })
    
    // 更新所有同步管理器的认证状态
    getTodoSyncManager().setAuthenticated(currentAuthState)
    settingsSyncManager.setAuthenticated(currentAuthState)
    
    if (currentAuthState) {
      // 登录成功，从服务器拉取数据
      if (token) {
        console.log('Fetching data after successful authentication...')
        // Add a small delay to ensure token is properly set
        setTimeout(() => {
          getTodoSyncManager().fetchDataFromServer()
          settingsSyncManager.fetchDataFromServer()
        }, 100)
      } else {
        console.log('Authenticated but no token available, waiting for token...')
      }
    } else {
      // 登出，清除本地数据
      console.log('User logged out, clearing data...')
    }
    
    prevAuthState = currentAuthState
  }
  
  // 只在 token 发生变化时更新
  if (tokenChanged) {
    console.log('Updating token in sync managers...', {
      previousToken: prevToken ? `${prevToken.substring(0, 10)}...` : null,
      newToken: token ? `${token.substring(0, 10)}...` : null
    })
    getTodoSyncManager().setToken(token)
    settingsSyncManager.setToken(token)
    prevToken = token
  }
}

// 初始化监听器
export const initUnifiedSyncIntegration = () => {
  // 防止重复初始化
  if (isInitialized) {
    console.log('UnifiedSyncIntegration already initialized, skipping...')
    return
  }
  
  // 检查store是否准备好
  if (!store || !store.getState) {
    console.error('Store not ready, delaying initialization...')
    setTimeout(initUnifiedSyncIntegration, 100)
    return
  }
  
  console.log('Initializing UnifiedSyncIntegration...')
  
  // 获取初始状态
  const initialState = store.getState()
  prevAuthState = initialState.auth.isAuthenticated
  prevToken = initialState.auth.token
  
  console.log('Initial auth state:', { 
    isAuthenticated: prevAuthState, 
    hasToken: !!initialState.auth.token,
    tokenLength: initialState.auth.token ? initialState.auth.token.length : 0
  })
  
  // 设置初始认证状态
  getTodoSyncManager().setAuthenticated(prevAuthState)
  settingsSyncManager.setAuthenticated(prevAuthState)
  
  // 初始 token 注入
  const initialToken = initialState.auth.token
  getTodoSyncManager().setToken(initialToken)
  settingsSyncManager.setToken(initialToken)
  
  // 如果初始就是登录状态，拉取服务器数据
  if (prevAuthState && prevToken) {
    console.log('Initial auth state is authenticated and token available, fetching data...')
    // Add a small delay to ensure everything is properly initialized
    setTimeout(() => {
      getTodoSyncManager().fetchDataFromServer()
      settingsSyncManager.fetchDataFromServer()
    }, 100)
  } else if (prevAuthState && !prevToken) {
    console.log('Initial auth state is authenticated but no token, waiting for token...')
  } else {
    console.log('Initial auth state is not authenticated, no data fetching needed...')
  }
  
  // 订阅状态变化（确保只有一个订阅）
  if (unsubscribe) {
    console.log('Cleaning up previous subscription...')
    unsubscribe()
  }
  
  try {
    // 创建新的订阅
    unsubscribe = store.subscribe(handleAuthStateChange)
    console.log('Store subscription created successfully')
  } catch (error) {
    console.error('Failed to create store subscription:', error)
  }
  
  isInitialized = true
  console.log('UnifiedSyncIntegration initialized successfully')
}

// 清理函数
export const cleanupUnifiedSyncIntegration = () => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  isInitialized = false
  prevAuthState = false
  prevToken = null
  lastHandledTime = 0
  console.log('UnifiedSyncIntegration cleaned up')
}
