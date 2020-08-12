import expect from 'expect';
import todoAppReducers from "../reducers";

import {
    addTodo, addSubTodo, deleteTodo, deleteSubTodo, setVisibilityFilter, VisibilityFilters, toggleSubTodo,
    toggleTodo
} from "../actions";

describe('Reducer', () => {
    it('returns the initial state', () => {
        expect(todoAppReducers(undefined, {})).toEqual({
            todos:[],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        });
    });

    it('handles the addTodo action', () => {
        const text = "hello"
        expect(todoAppReducers(undefined, addTodo(text))).toMatchObject({
            todos:[
                {
                    completed: false,
                    text: text,
                    subItems:[]
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the toggleTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos[0].id
        expect(todoAppReducers(state, toggleTodo(id))).toMatchObject({
            todos:[
                {
                    id: id,
                    completed: true,
                    text: text,
                    subItems:[]
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the deleteTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        state = todoAppReducers(state, addTodo(text))
        let id = state.todos[0].id
        expect(todoAppReducers(state, deleteTodo(id))).toMatchObject({
            todos:[
            {
                completed: false,
                text: text,
                subItems:[]
            }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the addSubTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos[0].id
        const subtext = "sub hello"
        expect(todoAppReducers(state, addSubTodo(id, subtext))).toMatchObject({
            todos:[
                {
                    completed: false,
                    text: text,
                    subItems:[{
                        completed: false,
                        text: subtext
                    }]
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the toggleSubTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos[0].id
        const subtext = "sub hello"
        state = todoAppReducers(state, addSubTodo(id, subtext))
        let subid = state.todos[0].subItems[0].id

        expect(todoAppReducers(state, toggleSubTodo(id, subid))).toMatchObject({
            todos:[
                {
                    completed: false,
                    text: text,
                    subItems:[{
                        id: subid,
                        completed: true,
                        text: subtext
                    }]
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the deleteSubTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos[0].id
        const subtext = "sub hello"
        state = todoAppReducers(state, addSubTodo(id, subtext))
        let subid = state.todos[0].subItems[0].id

        expect(todoAppReducers(state, deleteSubTodo(id, subid))).toMatchObject({
            todos:[
                {
                    completed: false,
                    text: text,
                    subItems:[]
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });
});