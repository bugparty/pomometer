import {createSlice} from '@reduxjs/toolkit'
import {v4 as uuidv4} from 'uuid'

export const todoSlice = createSlice({
    name: 'todos',
    initialState: [],
    reducers: {
        addTodo: {
            reducer(state, action) {
                state.push({
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
            const todo = state.find(i => i.id === action.payload)
            todo.completed = !todo.completed
        },
        deleteTodo: (state, action) => {
            const index = state.findIndex(todo => todo.id === action.payload)
            state.splice(index, 1)
        },
        addSubTodo: {
            reducer(state, action) {
                const todo = state.find(i => i.id === action.payload.id)
                if (todo == null) return
                todo.subItems.push({
                    id: action.payload.subId,
                    text: action.payload.subText,
                    createdDate: action.payload.createdDate,
                    completed: false
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
                const todo = state.find(i => i.id === action.payload.id)
                if (todo == null) return
                const subtodo = todo.subItems.find(i => i.id === action.payload.subId)
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
                const todo = state.find(i => i.id === action.payload.id)
                if (todo == null) return
                const index = todo.subItems.findIndex(i => i.id === action.payload.subId)
                if (index !== -1)  todo.subItems.splice(index,1)
            },
            prepare(id, subId) {
                return {
                    payload: {
                        id: id,
                        subId: subId
                    }
                }
            }
        }
    }
})
// console.log(todoSlice)

export const {addTodo, toggleTodo, deleteTodo, addSubTodo, toggleSubTodo, deleteSubTodo} = todoSlice.actions

export default todoSlice.reducer