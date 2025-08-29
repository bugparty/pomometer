import { GenericSyncManager, SyncAPI, OperationHandler, SyncOperation } from '../sync/GenericSyncManager'
import { getTodoAPI, TodoOperation, TodoOperationPayload } from './todoAPI'
import store from '../store'
import { 
  addTodo as addTodoAction, 
  toggleTodo as toggleTodoAction,
  deleteTodo as deleteTodoAction,
  addSubTodo as addSubTodoAction,
  toggleSubTodo as toggleSubTodoAction,
  deleteSubTodo as deleteSubTodoAction,
  replaceTodos,
  addTodoFromServer,
  addSubTodoFromServer
} from './todoSlice'

// Todo API适配器
class TodoAPIAdapter implements SyncAPI {
  async syncOperations(operations: SyncOperation[], lastSyncTime: string | null) {
    // 转换为TodoOperation类型
    const todoOperations: TodoOperation[] = operations.map(op => ({
      type: op.type,
      payload: op.payload as TodoOperationPayload,
      timestamp: op.timestamp,
      id: op.id
    }))
    
    return await getTodoAPI().syncOperations(todoOperations, lastSyncTime)
  }

  async fetchData() {
    return await getTodoAPI().getTodos()
  }

  setToken(token: string | null) {
    getTodoAPI().setToken(token)
  }
}

// Todo操作处理器
class TodoOperationHandler implements OperationHandler {
  applyOperation(operation: SyncOperation) {
    console.log(`[TodoHandler] ===== APPLYING SERVER OPERATION =====`)
    console.log(`[TodoHandler] Operation type: ${operation.type}`)
    console.log(`[TodoHandler] Operation payload:`, operation.payload)
    
    const { type, payload } = operation
    
    // 类型断言，因为我们知道不同操作类型的payload结构
    const typedPayload = payload as {
      id?: string;
      text?: string;
      completed?: boolean;
      deleted?: boolean;
      focus?: boolean;
      createdDate?: string;
      subId?: string;
      subText?: string;
      startTime?: string;
      endTime?: string;
      description?: string;
    };

    // 注意：这些是从服务器来的操作，不需要再触发同步
    switch (type) {
      case 'ADD_TODO':
        console.log(`[TodoHandler] Applying ADD_TODO from server`)
        store.dispatch(addTodoFromServer({ 
          id: typedPayload.id!, 
          text: typedPayload.text!, 
          createdDate: typedPayload.createdDate!, 
          completed: typedPayload.completed, 
          deleted: typedPayload.deleted, 
          focus: typedPayload.focus 
        }))
        break
      case 'TOGGLE_TODO':
        console.log(`payload ${JSON.stringify(typedPayload)}`);
        console.log(`[TodoHandler] Applying TOGGLE_TODO from server: ${typedPayload.id} -> ${typedPayload.completed}`)
        store.dispatch(toggleTodoAction(typedPayload.id!, typedPayload.completed!))
        break
      case 'DELETE_TODO':
        console.log(`[TodoHandler] Applying DELETE_TODO from server: ${typedPayload.id}`)
        store.dispatch(deleteTodoAction(typedPayload.id!))
        break
      case 'ADD_SUB_TODO':
        console.log(`[TodoHandler] Applying ADD_SUB_TODO from server`)
        store.dispatch(addSubTodoFromServer({ 
          id: typedPayload.id!, 
          subId: typedPayload.subId!, 
          subText: typedPayload.subText!, 
          createdDate: typedPayload.createdDate!, 
          startTime: typedPayload.startTime, 
          endTime: typedPayload.endTime, 
          description: typedPayload.description, 
          completed: typedPayload.completed, 
          deleted: typedPayload.deleted, 
          focus: typedPayload.focus 
        }))
        break
      case 'TOGGLE_SUB_TODO':
        console.log(`[TodoHandler] 🚨 APPLYING TOGGLE_SUB_TODO from server: ${typedPayload.subId} -> ${typedPayload.completed}`)
        console.log(`[TodoHandler] This might OVERWRITE user's recent change!`)
        store.dispatch(toggleSubTodoAction(typedPayload.id!, typedPayload.subId!, typedPayload.completed!))
        break
      case 'DELETE_SUB_TODO':
        console.log(`[TodoHandler] Applying DELETE_SUB_TODO from server`)
        store.dispatch(deleteSubTodoAction(typedPayload.id!, typedPayload.subId!))
        break
      default:
        console.warn('Unknown todo operation type:', type)
    }
    console.log(`[TodoHandler] ===== SERVER OPERATION APPLIED =====`)
  }

  replaceData(data: unknown) {
    console.log(`[TodoHandler] ===== REPLACE ALL TODOS DATA =====`)
    console.log(`[TodoHandler] About to REPLACE ALL todos in Redux store`)
    
    // 类型断言，因为我们知道数据的结构
    const typedData = data as { todos?: import('./todoSlice').TodoItem[] };
    
    console.log(`[TodoHandler] New todos count:`, typedData.todos?.length || 0)
    console.log(`[TodoHandler] Call stack:`, new Error().stack?.split('\n').slice(1, 5))
    
    // 用服务器数据替换本地数据
    if (typedData.todos) {
      store.dispatch(replaceTodos(typedData.todos))
    }
    console.log(`[TodoHandler] ALL TODOS REPLACED in Redux store`)
    console.log(`[TodoHandler] ===== REPLACE ALL TODOS DATA END =====`)
  }
}

// 延迟创建Todo同步管理器实例
let todoSyncManagerInstance: GenericSyncManager | null = null;

export const getTodoSyncManager = () => {
  if (!todoSyncManagerInstance) {
    todoSyncManagerInstance = new GenericSyncManager(
      'todos',
      new TodoAPIAdapter(),
      new TodoOperationHandler(),
      30000 // 30秒同步间隔
    )
  }
  return todoSyncManagerInstance;
}

// 为了向后兼容
export const todoSyncManager = {
  get instance() {
    return getTodoSyncManager();
  },
  addOperation(operation: SyncOperation) {
    return getTodoSyncManager().addOperation(operation);
  },
  getPendingCount() {
    return getTodoSyncManager().getPendingCount();
  },
  forceSync() {
    return getTodoSyncManager().forceSync();
  },
  getSyncStatus() {
    return getTodoSyncManager().getSyncStatus();
  }
}

// 为了保持向后兼容，提供一个包装方法
export const fetchTodosFromServer = () => getTodoSyncManager().fetchDataFromServer()
