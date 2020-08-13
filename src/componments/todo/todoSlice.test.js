import expect from 'expect';
import visibilityFilter, {VisibilityFilters} from "./visibilityFilterSlice"
import todos, {addSubTodo, addTodo, deleteSubTodo, deleteTodo, toggleSubTodo, toggleTodo} from "./todoSlice";
import {combineReducers} from "redux";

const todoAppReducers = combineReducers({
    visibilityFilter,
    todos
})
describe('Reducer', () => {
    it('returns the initial state', () => {
        expect(todoAppReducers(undefined, {})).toEqual({
            todos: [],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        });
    });

    it('handles the addTodo action', () => {
        const text = "hello"
        let ret = todoAppReducers(undefined, addTodo(text))
        expect(ret).toMatchObject({
            todos: [
                {
                    completed: false,
                    text: text,
                    subItems: []
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
        ret.todos.forEach(todo => expect(todo.createdDate).toBeDefined())
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
        let ret = todoAppReducers(state, addSubTodo(id, subtext))
        expect(ret).toMatchObject({
            todos: [
                {
                    completed: false,
                    text: text,
                    subItems: [{
                        completed: false,
                        text: subtext
                    }]
                }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
        ret.todos.forEach(todo => todo.subItems.forEach(subtodo => expect(subtodo.createdDate).toBeDefined()))
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