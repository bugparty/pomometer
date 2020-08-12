import {v4 as uuidv4} from 'uuid'
/*
*action types
 */
export const ADD_TODO = 'todo/add_todo'
export const TOGGLE_TODO = 'todo/taggle_todo'
export const DELETE_TODO = 'todo/delete_todo'
export const SET_VISIBILITY_FILTER = 'todo/set_visibility_filter'
export const ADD_SUB_TODO = 'todo/add_sub_todo'
export const DELETE_SUB_TODO = 'todo/delete_sub_todo'
export const TOGGLE_SUB_TODO = 'todo/taggle_sub_todo'

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
export const addTodo = text => {
    return {
        type: ADD_TODO,
        id: uuidv4(),
        text,
        createdDate: (new Date()).toJSON()
    }
}
export const addSubTodo = (id, subText) => {
    return {
        type: ADD_SUB_TODO,
        id: id,
        subId: uuidv4(),
        subText: subText,
        createdDate: (new Date()).toJSON()
    }
}
export const deleteTodo = id => ({
    type: DELETE_TODO,
    id
})
export const deleteSubTodo = (id, subId) => ({
    type: DELETE_SUB_TODO,
    id,
    subId
})
export function toggleTodo(id) {
    return {type: TOGGLE_TODO, id}
}
export function toggleSubTodo(id,subId) {
    return {type: TOGGLE_SUB_TODO, id, subId}
}
export function setVisibilityFilter(filter) {
    return {type: SET_VISIBILITY_FILTER, filter}
}
