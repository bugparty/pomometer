import {v4 as uuidv4} from 'uuid'
/*
*action types
 */
export const ADD_TODO = 'ADD_TODO'
export const TOGGLE_TODO = 'TOGGLE_TODO'
export const DELETE_TODO = 'DELETE_TODO'
export const SET_VISIBILITY_FILTER = 'SET_VISIBLITY_FILTER'

/*
* other constants
 */
export const VisibilityFilters = {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_COMPLETED: 'SHOW_COMPLETED',
    SHOW_ACTIVE: 'SHOW_ACTIVE'
}

/*
* action creators
 */
export const addTodo = text=> {
    return {
        type: ADD_TODO,
            id: uuidv4(),
        text,
        createdDate:(new Date()).toJSON()
    }
}

export const deleteTodo = id => ({
    type: DELETE_TODO,
    id
})
export function toggleTodo(id) {
    return { type: TOGGLE_TODO, id}
}
export function setVisibilityFilter(filter) {
    return { type: SET_VISIBILITY_FILTER, filter}
}
