import { todoSyncManager } from './todoSyncManager'
import { TodoOperation } from './todoAPI'
import { 
  addTodo as addTodoAction, 
  toggleTodo as toggleTodoAction,
  deleteTodo as deleteTodoAction,
  addSubTodo as addSubTodoAction,
  toggleSubTodo as toggleSubTodoAction,
  deleteSubTodo as deleteSubTodoAction,
  editSubTodo as editSubTodoAction,
  editTodo as editTodoAction,
  replaceTodos,
  type TodoItem,
} from './todoSlice'
import store from '../store'

// 包装的actions，会同时更新本地状态和添加到同步队列
export const todoSyncActions = {
  // 添加待办事项
  addTodo: (text: string) => {
    // 本地立即执行
    const action = addTodoAction(text)
    store.dispatch(action)
    
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'ADD_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // 切换待办事项状态
  toggleTodo: (id: string, checked: boolean) => {
    // 本地立即执行
    const action = toggleTodoAction(id, checked)
    store.dispatch(action)   
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'TOGGLE_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // 删除待办事项
  deleteTodo: (id: string) => {
    // 本地立即执行
    const action = deleteTodoAction(id)
    store.dispatch(action)
    
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'DELETE_TODO',
      payload: { id },
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // 编辑待办事项标题
  editTodo: (id: string, text: string) => {
    const action = editTodoAction(id, text)
    store.dispatch(action)
    const operation: TodoOperation = {
      type: 'EDIT_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    return action
  },

  // 添加子待办事项
  addSubTodo: (id: string, subText: string, startTime?: string, endTime?: string, description?: string) => {
    // 本地立即执行
    const action = addSubTodoAction(id, subText, startTime, endTime, description)
    store.dispatch(action)
    
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'ADD_SUB_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // 切换子待办事项状态
  toggleSubTodo: (id: string, subId: string, checked: boolean) => {
    // 本地立即执行
    const action = toggleSubTodoAction(id, subId, checked)
    store.dispatch(action)
    
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'TOGGLE_SUB_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // 删除子待办事项
  deleteSubTodo: (id: string, subId: string) => {
    // 本地立即执行
    const action = deleteSubTodoAction(id, subId)
    store.dispatch(action)
    
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'DELETE_SUB_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // 编辑子待办事项
  editSubTodo: (id: string, subId: string, text: string, startTime?: string, endTime?: string, description?: string) => {
    // 本地立即执行
    const action = editSubTodoAction(id, subId, text, startTime, endTime, description)
    store.dispatch(action)
    
    // 添加到同步队列
    const operation: TodoOperation = {
      type: 'EDIT_SUB_TODO',
      payload: action.payload,
      timestamp: new Date().toISOString(),
    }
    todoSyncManager.addOperation(operation)
    
    return action
  },

  // Google Tasks同步：替换所有todos（用于从Google Tasks同步回来的数据）
  replaceFromGoogleTasks: (todos: TodoItem[]) => {
    console.log(`[TodoSyncActions] Replacing todos from Google Tasks: ${todos.length} items`);
    store.dispatch(replaceTodos(todos));
  },
}
