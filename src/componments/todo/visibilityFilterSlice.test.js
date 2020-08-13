import expect from 'expect'
import {combineReducers} from "redux"
import {setVisibilityFilter , nope , VisibilityFilters} from "./visibilityFilterSlice"
import {
    addTodo, addSubTodo, deleteTodo, deleteSubTodo,  toggleSubTodo,
    toggleTodo
} from "./todoSlice";
import todos from './todoSlice'
import visibilityFilter from './visibilityFilterSlice'

const todoAppReducers = combineReducers( {
    visibilityFilter,
    todos
})
// const todoAppReducers = {
//     todos: todos,
//     visibility: visibilityFilter
// }
describe('VisibilityFilterReducer', () => {
    it('returns the initial state', () => {
        expect(todoAppReducers(undefined, {})).toEqual({
            todos:[],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        });
    });
    let state = todoAppReducers(undefined, addTodo("abc"))
    state = todoAppReducers(state, addTodo("bcd"))
    let id1 = state.todos[0].id
    let id2 = state.todos[1].id

    it('handles the SHOW_ALL action', () => {
        // build a test state

        expect(todoAppReducers(state, setVisibilityFilter(VisibilityFilters.SHOW_ALL))).toMatchObject({
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the SHOW_ACTIVE action', () => {

        expect(todoAppReducers(state, setVisibilityFilter(VisibilityFilters.SHOW_ACTIVE))).toMatchObject({
            visibilityFilter: VisibilityFilters.SHOW_ACTIVE
        })
    });

    it('handles the SHOW_COMPLETED action', () => {

        expect(todoAppReducers(state, setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))).toMatchObject({
            visibilityFilter: VisibilityFilters.SHOW_COMPLETED
        })
    });

});