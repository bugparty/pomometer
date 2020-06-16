import {combineReducers} from 'redux'
import {ADD_TODO, SET_VISIBILITY_FILTER, TOGGLE_TODO, DELETE_TODO,
    VisibilityFilters} from "../actions";

function todos(state = [], action) {
    console.log("action", action.type, "obj", action)
    switch (action.type) {
        case ADD_TODO:
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ]
        case TOGGLE_TODO:
            return state.map((todo, index) => {
                if (todo.id === action.id) {
                    return Object.assign({}, todo, {
                        completed: !todo.completed
                    })
                }
                return todo
            })
        case DELETE_TODO:
            return state.filter( todo => todo.id != action.id)
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
function nextId(state = 0, action) {
    return state
}

const todoApp = combineReducers( {
        visibilityFilter,
        todos,
    nextId
    })

export default todoApp