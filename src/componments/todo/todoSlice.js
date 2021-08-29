import {createSlice} from '@reduxjs/toolkit'
import {v4 as uuidv4} from 'uuid'

const findTodoById = (state, id) => {
    return state.todos.find(i => i.id === id)
}
const findSubTodoById = (todo, subId) => {
    return todo.subItems.find(i => i.id === subId)
}
export const todoSlice = createSlice({
    name: 'todos',
    initialState: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [{
            id: 'default',
            text: 'default',
            createdDate: (new Date()).toJSON(),
            subItems: []
        }]
    },
    reducers: {
        addTodo: {
            reducer(state, action) {
                state.todos.push({
                    id: action.payload.id,
                    text: action.payload.text,
                    subItems: [],
                    createdDate: action.payload.createdDate,
                    completed: false
                })
            },
            prepare(text) {
                return {
                    payload: {
                        id: uuidv4(),
                        text: text,
                        createdDate: (new Date()).toJSON()
                    }
                }
            }
        },
        toggleTodo: (state, action) => {

            const todo = findTodoById(state, action.payload)
            todo.completed = !todo.completed
        },
        deleteTodo: (state, action) => {
            const index = state.todos.findIndex(todo => todo.id === action.payload)
            state.todos.splice(index, 1)
        },
        addSubTodo: {
            reducer(state, action) {
                const todo = findTodoById(state, action.payload.id)
                if (todo == null) return
                todo.subItems.push({
                    id: action.payload.subId,
                    text: action.payload.subText,
                    createdDate: action.payload.createdDate,
                    completed: false,
                    focus: false
                })
            }, prepare(id, text) {
                return {
                    payload: {
                        id: id,
                        subId: uuidv4(),
                        subText: text,
                        createdDate: (new Date()).toJSON()
                    }
                }
            }
        },
        toggleSubTodo: {
            reducer(state, action) {
                const todo = findTodoById(state, action.payload.id)
                if (todo == null) return
                const subtodo = findSubTodoById(todo, action.payload.subId)
                if (subtodo == null) return
                subtodo.completed = !subtodo.completed
            },
            prepare(id, subId) {
                return {
                    payload: {
                        id: id,
                        subId: subId
                    }
                }
            }
        },
        deleteSubTodo: {
            reducer(state, action) {
                const todo = findTodoById(state, action.payload.id)
                if (todo == null) return
                const index = todo.subItems.findIndex(i => i.id === action.payload.subId)
                if (index !== -1) todo.subItems.splice(index, 1)
            },
            prepare(id, subId) {
                return {
                    payload: {
                        id: id,
                        subId: subId
                    }
                }
            }
        },
        focusSubTodo: {
            reducer(state, action) {
                if (action.payload.id == null) return
                state.focusTodo = action.payload.id
                if (action.payload.subId == null) return
                state.focusSubTodo = action.payload.subId
            },
            prepare(id, subId) {
                return {
                    payload: {
                        id: id,
                        subId: subId
                    }
                }
            }
        },
    }
})
// console.log(todoSlice)

export const {
    addTodo, toggleTodo, deleteTodo, addSubTodo, toggleSubTodo, deleteSubTodo,
    focusSubTodo
} = todoSlice.actions

export default todoSlice.reducer