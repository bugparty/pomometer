import {createSlice, Draft, PayloadAction} from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid";

export interface SubTodoItem {
    id: string,
    text: string,
    completed: boolean,
    deleted: boolean,
    focus: boolean,
    createdDate: string,
    startTime?: string,
    endTime?: string,
    description?: string,
}

export interface TodoItem {
    id: string,
    text: string,
    completed: boolean,
    deleted: boolean,
    focus: boolean,
    createdDate: string,
    subItems: SubTodoItem[],
}

export interface TodoState {
    focusTodo: string | undefined,
    focusSubTodo: string | undefined,
    todos: TodoItem[],
}

// Action Payload 接口定义
interface AddTodoPayload {
    id: string;
    text: string;
    createdDate: string;
}

interface ToggleTodoPayload {
    id: string;
    completed: boolean;
}

interface EditTodoPayload {
    id: string;
    text: string;
}

interface AddSubTodoPayload {
    id: string;
    subId: string;
    subText: string;
    createdDate: string;
    startTime?: string;
    endTime?: string;
    description?: string;
}

interface ToggleSubTodoPayload {
    id: string;
    subId: string;
    completed: boolean;
}

interface DeleteSubTodoPayload {
    id: string;
    subId: string;
}

interface EditSubTodoPayload {
    id: string;
    subId: string;
    text: string;
    startTime?: string;
    endTime?: string;
    description?: string;
}

interface FocusSubTodoPayload {
    id: string;
    subId: string | undefined;
}

interface LoadTodosFromServerPayload {
    todos: TodoItem[];
    lastSyncTime: string;
}

const initialState: TodoState = {
    focusSubTodo: undefined, focusTodo: undefined, todos: [{
        id: "default",
        text: "default",
        completed: false,
        deleted: false,
        focus: false,
        createdDate: new Date().toJSON(),
        subItems: [],
    },]
}
const findTodoById = (state: Draft<TodoState>, id: string) => {
    return state.todos.find((i: TodoItem) => i.id === id);
};
const findSubTodoById = (todo: TodoItem, subId: string) => {
    return todo.subItems.find((i: SubTodoItem) => i.id === subId);
};
export const todoSlice = createSlice({
    name: "todos",
    initialState,
    reducers: {
        addTodo: {
            reducer: function (state, action: PayloadAction<AddTodoPayload>) {
                state.todos.push({
                    id: action.payload.id,
                    text: action.payload.text,
                    subItems: [],
                    createdDate: action.payload.createdDate,
                    completed: false,
                    deleted: false,
                    focus: false,
                });
            },
            prepare(text: string): Omit<PayloadAction<AddTodoPayload>, 'type'> {
                return {
                    payload: {
                        id: uuidv4(),
                        text: text,
                        createdDate: new Date().toJSON(),
                    },
                };
            },
        },
        toggleTodo: {
            reducer: function (state, action: PayloadAction<ToggleTodoPayload>) {
                const todo = findTodoById(state, action.payload.id);
                if (typeof todo === 'object') {
                    todo.completed = action.payload.completed;
                }

            },
            prepare: function (id: string, checked: boolean): Omit<PayloadAction<ToggleTodoPayload>, 'type'> {
                return {
                    payload: {
                        id: id,
                        completed: checked,
                    },
                }
            }
        },
        deleteTodo: (state, action) => {
            const todo = findTodoById(state, action.payload);
            if (typeof todo === 'object') {
                todo.deleted = true;
            }

        },
        editTodo: {
            reducer(state, action: PayloadAction<EditTodoPayload>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                todo.text = action.payload.text;
            },
            prepare(id: string, text: string): Omit<PayloadAction<EditTodoPayload>, 'type'> {
                return {
                    payload: { id, text },
                };
            },
        },
        addSubTodo: {
            reducer(state, action: PayloadAction<AddSubTodoPayload>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                todo.subItems.push({
                    deleted: false,
                    id: action.payload.subId,
                    text: action.payload.subText,
                    createdDate: action.payload.createdDate,
                    completed: false,
                    focus: false,
                    startTime: action.payload.startTime,
                    endTime: action.payload.endTime,
                    description: action.payload.description,
                });
            },
            prepare(id: string, text: string, startTime?: string, endTime?: string, description?: string): Omit<PayloadAction<AddSubTodoPayload>, 'type'> {
                return {
                    payload: {
                        id: id,
                        subId: uuidv4(),
                        subText: text,
                        createdDate: new Date().toJSON(),
                        startTime,
                        endTime,
                        description,
                    },
                };
            },
        },
        toggleSubTodo: {
            reducer(state, action: PayloadAction<ToggleSubTodoPayload>) {
                console.log(`[TodoSlice] ===== TOGGLE_SUB_TODO REDUCER =====`)
                console.log(`[TodoSlice] Payload:`, action.payload)
                
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) {
                    console.log(`[TodoSlice] Todo not found: ${action.payload.id}`)
                    return;
                }
                
                const subtodo = findSubTodoById(todo, action.payload.subId);
                if (subtodo == null) {
                    console.log(`[TodoSlice] Subtodo not found: ${action.payload.subId}`)
                    return;
                }
                
                console.log(`[TodoSlice] Before: subtodo.completed = ${subtodo.completed}`)
                subtodo.completed = action.payload.completed;
                console.log(`[TodoSlice] After: subtodo.completed = ${subtodo.completed}`)
                console.log(`[TodoSlice] ===== TOGGLE_SUB_TODO REDUCER END =====`)
            },
            prepare(id: string, subId: string, checked: boolean): Omit<PayloadAction<ToggleSubTodoPayload>, 'type'> {
                return {
                    payload: {
                        id,
                        subId,
                        completed: checked,
                    },
                };
            },
        },
        deleteSubTodo: {
            reducer(state, action: PayloadAction<DeleteSubTodoPayload>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                const index = todo.subItems.findIndex(
                    (i) => i.id === action.payload.subId
                );
                if (index !== -1) todo.subItems.splice(index, 1);
            },
            prepare(id: string, subId: string): Omit<PayloadAction<DeleteSubTodoPayload>, 'type'> {
                return {
                    payload: {
                        id: id,
                        subId: subId,
                    },
                };
            },
        },
        editSubTodo: {
            reducer(state, action: PayloadAction<EditSubTodoPayload>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                const subtodo = findSubTodoById(todo, action.payload.subId);
                if (subtodo == null) return;
                subtodo.text = action.payload.text;
                if (action.payload.startTime !== undefined) subtodo.startTime = action.payload.startTime;
                if (action.payload.endTime !== undefined) subtodo.endTime = action.payload.endTime;
                if (action.payload.description !== undefined) subtodo.description = action.payload.description;
            },
            prepare(id: string, subId: string, text: string, startTime?: string, endTime?: string, description?: string): Omit<PayloadAction<EditSubTodoPayload>, 'type'> {
                return {
                    payload: {
                        id,
                        subId,
                        text,
                        startTime,
                        endTime,
                        description,
                    },
                };
            },
        },
        focusSubTodo: {
            reducer(state, action: PayloadAction<FocusSubTodoPayload>) {
                if (action.payload.id == null) return;
                state.focusTodo = action.payload.id;
                if (action.payload.subId == null) {
                    state.focusSubTodo = undefined;
                } else {
                    state.focusSubTodo = action.payload.subId;
                }
            },
            prepare(id: string, subId: string | undefined): Omit<PayloadAction<FocusSubTodoPayload>, 'type'> {
                return {
                    payload: {
                        id: id,
                        subId: subId,
                    },
                };
            },
        },
        replaceTodos: (state, action: PayloadAction<TodoItem[]>) => {
            console.log(`[TodoSlice] ===== REPLACE TODOS REDUCER CALLED =====`)
            console.log(`[TodoSlice] Replacing ${state.todos.length} todos with ${action.payload.length} new todos`)
            console.log(`[TodoSlice] action.payload:`, action.payload)
            console.log(`[TodoSlice] This will OVERWRITE all current todos in the store`)
            state.todos = action.payload;
            console.log(`[TodoSlice] Todos replaced successfully`)
            console.log(`[TodoSlice] ===== REPLACE TODOS REDUCER END =====`)
        },
        loadTodosFromServer: {
            reducer(state, action: PayloadAction<LoadTodosFromServerPayload>) {
                state.todos = action.payload.todos;
                // 可以在这里设置同步状态
            },
            prepare(todos: TodoItem[], lastSyncTime: string): Omit<PayloadAction<LoadTodosFromServerPayload>, 'type'> {
                return {
                    payload: {
                        todos,
                        lastSyncTime,
                    },
                };
            },
        },
    },
});
// console.log(todoSlice)

export const {
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    addSubTodo,
    toggleSubTodo,
    deleteSubTodo,
    editSubTodo,
    focusSubTodo,
    replaceTodos,
    loadTodosFromServer,
} = todoSlice.actions;

// 服务器同步专用：避免使用客户端 prepare 里重新生成 ID
export const addTodoFromServer = (payload: { id: string; text: string; createdDate: string; completed?: boolean; deleted?: boolean; focus?: boolean }) => ({
    type: 'todos/addTodoFromServer',
    payload
});

export const addSubTodoFromServer = (payload: { id: string; subId: string; subText: string; createdDate: string; startTime?: string; endTime?: string; description?: string; completed?: boolean; deleted?: boolean; focus?: boolean }) => ({
    type: 'todos/addSubTodoFromServer',
    payload
});

// 定义服务器同步相关的 action 类型
interface AddTodoFromServerAction {
    type: 'todos/addTodoFromServer';
    payload: {
        id: string;
        text: string;
        createdDate: string;
        completed?: boolean;
        deleted?: boolean;
        focus?: boolean;
    };
}

interface AddSubTodoFromServerAction {
    type: 'todos/addSubTodoFromServer';
    payload: {
        id: string;
        subId: string;
        subText: string;
        createdDate: string;
        startTime?: string;
        endTime?: string;
        description?: string;
        completed?: boolean;
        deleted?: boolean;
        focus?: boolean;
    };
}

// 定义所有已知的 Todo Action 类型
type TodoSliceActions = ReturnType<typeof todoSlice.actions[keyof typeof todoSlice.actions]>;

// 类型守卫函数，用于检查 action 是否为服务器 action
function isAddTodoFromServerAction(action: TodoAction): action is AddTodoFromServerAction {
    return action.type === 'todos/addTodoFromServer';
}

function isAddSubTodoFromServerAction(action: TodoAction): action is AddSubTodoFromServerAction {
    return action.type === 'todos/addSubTodoFromServer';
}

// 联合类型：包含所有可能的 action 类型
type TodoAction = 
    | AddTodoFromServerAction 
    | AddSubTodoFromServerAction 
    | TodoSliceActions;

// Extend reducer to handle server insert actions without generating new IDs
// NOTE: Keep logic outside createSlice to avoid changing original slice declarations
const originalReducer = todoSlice.reducer;
export const serverAwareTodoReducer = (state: TodoState, action: TodoAction): TodoState => {
    if (isAddTodoFromServerAction(action)) {
        const exists = findTodoById(state, action.payload.id);
        if (!exists) {
            state.todos.push({
                id: action.payload.id,
                text: action.payload.text,
                createdDate: action.payload.createdDate,
                completed: action.payload.completed ?? false,
                deleted: action.payload.deleted ?? false,
                focus: action.payload.focus ?? false,
                subItems: []
            });
        }
        return state;
    }
    if (isAddSubTodoFromServerAction(action)) {
        const todo = findTodoById(state, action.payload.id);
        if (todo) {
            const exists = todo.subItems.find((s: SubTodoItem) => s.id === action.payload.subId);
            if (!exists) {
                todo.subItems.push({
                    id: action.payload.subId,
                    text: action.payload.subText,
                    createdDate: action.payload.createdDate,
                    completed: action.payload.completed ?? false,
                    deleted: action.payload.deleted ?? false,
                    focus: action.payload.focus ?? false,
                    startTime: action.payload.startTime,
                    endTime: action.payload.endTime,
                    description: action.payload.description,
                });
            }
        }
        return state;
    }
    return originalReducer(state, action as TodoSliceActions);
};

export default serverAwareTodoReducer;
