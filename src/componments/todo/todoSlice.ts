import {createSlice, Draft, PayloadAction} from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid";

export interface SubTodoItem {
    id: string,
    text: string,
    completed: boolean,
    deleted: boolean,
    focus: boolean,
    createdDate: string,
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
    // @ts-ignore
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
            reducer: function (state, action: PayloadAction<{ id: string, text: string, createdDate: string }>) {
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
            prepare(text: string) {
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
            reducer: function (state, action: PayloadAction<{ id: string, checked: boolean }>) {
                const todo = findTodoById(state, action.payload.id);
                if (typeof todo === 'object') {
                    todo.completed = action.payload.checked;
                }

            },
            prepare: function (id: string, checked: boolean) {
                return {
                    payload: {
                        id: id,
                        checked,
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
        addSubTodo: {
            reducer(state, action: PayloadAction<{ id: string, subId: string, subText: string, createdDate: string }>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                todo.subItems.push({
                    deleted: false,
                    id: action.payload.subId,
                    text: action.payload.subText,
                    createdDate: action.payload.createdDate,
                    completed: false,
                    focus: false
                });
            },
            prepare(id: string, text: string) {
                return {
                    payload: {
                        id: id,
                        subId: uuidv4(),
                        subText: text,
                        createdDate: new Date().toJSON(),
                    },
                };
            },
        },
        toggleSubTodo: {
            reducer(state, action: PayloadAction<{ id: string, subId: string, checked: boolean }>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                const subtodo = findSubTodoById(todo, action.payload.subId);
                if (subtodo == null) return;
                subtodo.completed = action.payload.checked;
            },
            prepare(id: string, subId: string, checked: boolean) {
                return {
                    payload: {
                        id,
                        subId,
                        checked,
                    },
                };
            },
        },
        deleteSubTodo: {
            reducer(state, action: PayloadAction<{ id: string, subId: string }>) {
                const todo = findTodoById(state, action.payload.id);
                if (todo == null) return;
                const index = todo.subItems.findIndex(
                    (i) => i.id === action.payload.subId
                );
                if (index !== -1) todo.subItems.splice(index, 1);
            },
            prepare(id: string, subId: string) {
                return {
                    payload: {
                        id: id,
                        subId: subId,
                    },
                };
            },
        },
        focusSubTodo: {
            reducer(state, action: PayloadAction<{ id: string, subId: string | undefined }>) {
                if (action.payload.id == null) return;
                state.focusTodo = action.payload.id;
                if (action.payload.subId == null) return;
                state.focusSubTodo = action.payload.subId;
            },
            prepare(id: string, subId: string | undefined) {
                return {
                    payload: {
                        id: id,
                        subId: subId,
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
    addSubTodo,
    toggleSubTodo,
    deleteSubTodo,
    focusSubTodo,
} = todoSlice.actions;

export default todoSlice.reducer;
