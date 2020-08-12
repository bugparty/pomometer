import {combineReducers} from 'redux'
import {
    ADD_TODO, SET_VISIBILITY_FILTER, TOGGLE_TODO, DELETE_TODO,
    VisibilityFilters, ADD_SUB_TODO, TOGGLE_SUB_TODO, DELETE_SUB_TODO
} from "../actions";

function todos(state = [], action) {
    // console.log("action", action.type, "obj", action)
    switch (action.type) {
        case ADD_TODO:
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    subItems: [],
                    createdDate: action.createdDate,
                    completed: false
                }
            ]
        case ADD_SUB_TODO:
            return state.map((todo, index) => {
                if (todo.id === action.id) {
                    return Object.assign({}, todo, {
                        subItems : [
                            ...todo.subItems,
                            {
                                id: action.subId,
                                text: action.subText,
                                createdDate: action.createdDate,
                                completed: false
                            }
                        ]
                    })
                }
                return todo
            })
        case TOGGLE_TODO:
            return state.map((todo, index) => {
                if (todo.id === action.id) {
                    return Object.assign({}, todo, {
                        completed: !todo.completed
                    })
                }
                return todo
            })
        case TOGGLE_SUB_TODO:
            return state.map((todo, index) => {
                if (todo.id === action.id) {
                    return Object.assign({}, todo, {
                        subItems : todo.subItems.map((subtodo, index)=> {
                            if (subtodo.id === action.subId){
                                return Object.assign({}, subtodo, {
                                    completed: !subtodo.completed
                                })
                            }
                            return subtodo
                        })
                    })
                }
                return todo
            })
        case DELETE_TODO:
            return state.filter( todo => todo.id !== action.id)
        case DELETE_SUB_TODO:
            return state.map((todo, index) => {
                if (todo.id === action.id) {
                    return Object.assign({}, todo, {
                        subItems : todo.subItems.filter(subtodo => subtodo.id !== action.subId)
                    })
                }
                return todo
            })
        default:
            return state
    }
}

const {SHOW_ALL} = VisibilityFilters

function visibilityFilter(state= SHOW_ALL, action) {
    switch (action.type) {
        case SET_VISIBILITY_FILTER:
            return action.filter
        default:
            return state
    }
}

const todoAppReducers = combineReducers( {
        visibilityFilter,
        todos
    })

export default todoAppReducers