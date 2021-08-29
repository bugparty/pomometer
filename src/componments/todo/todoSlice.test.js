import expect from 'expect';
import visibilityFilter, {VisibilityFilters} from "./visibilityFilterSlice"
import todos, {
    addSubTodo, addTodo, deleteSubTodo, deleteTodo, toggleSubTodo, toggleTodo,
    focusSubTodo
} from "./todoSlice";
import {combineReducers} from "redux";

const todoAppReducers = combineReducers({
    visibilityFilter,
    todos
})
describe('Reducer', () => {
    it('returns the initial state', () => {
        expect(todoAppReducers(undefined, {})).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined,
                todos: [{
                    id: 'default',
                    text: 'default'
                }]
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL
        });
    });

    it('handles the addTodo action', () => {
        const text = "hello"
        let ret = todoAppReducers(undefined, addTodo(text))
        expect(ret).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined,
                todos: [{
                    id: 'default',
                    text: 'default'
                },
                    {
                        completed: false,
                        text: text,
                        subItems: []
                    }
                ],
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL,

        })
        ret.todos.todos.forEach(todo => expect(todo.createdDate).toBeDefined())
    });

    it('handles the toggleTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos.todos[1].id
        expect(todoAppReducers(state, toggleTodo(id))).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined,
                todos: [{
                    id: 'default',
                    text: 'default'
                },
                    {
                        id: id,
                        completed: true,
                        text: text,
                        subItems: []
                    }
                ],
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL,
        })
    });

    it('handles the deleteTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos.todos[1].id
        expect(todoAppReducers(state, deleteTodo(id))).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined ,
                todos: [
                    {
                        id: 'default',
                        text: 'default'
                    }
                ],
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the addSubTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos.todos[1].id
        const subtext = "sub hello"
        let ret = todoAppReducers(state, addSubTodo(id, subtext))
        expect(ret).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined,
                todos: [{
                    id: 'default',
                    text: 'default'
                },
                    {
                        completed: false,
                        text: text,
                        subItems: [{
                            completed: false,
                            text: subtext
                        }]
                    }
                ],
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
        ret.todos.todos.forEach(todo => todo.subItems.forEach(subtodo => expect(subtodo.createdDate).toBeDefined()))
    });

    it('handles the toggleSubTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos.todos[1].id
        const subtext = "sub hello"
        state = todoAppReducers(state, addSubTodo(id, subtext))
        let subid = state.todos.todos[1].subItems[0].id

        expect(todoAppReducers(state, toggleSubTodo(id, subid))).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined,
                todos: [{
                    id: 'default',
                    text: 'default'
                },
                    {
                        completed: false,
                        text: text,
                        subItems: [{
                            id: subid,
                            completed: true,
                            text: subtext
                        }]
                    }
                ],
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });

    it('handles the deleteSubTodo action', () => {
        const text = "hello"
        let state = todoAppReducers(undefined, addTodo(text))
        let id = state.todos.todos[1].id
        const subtext = "sub hello"
        state = todoAppReducers(state, addSubTodo(id, subtext))
        let subid = state.todos.todos[1].subItems[0].id

        expect(todoAppReducers(state, deleteSubTodo(id, subid))).toMatchObject({
            todos: {
                focusTodo: undefined,
                focusSubTodo: undefined,
                todos: [{
                    id: 'default',
                    text: 'default'
                },
                    {
                        completed: false,
                        text: text,
                        subItems: []
                    }
                ],
            },
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
    });
    it('handles the focusSubTodo action', () => {
        let state = todoAppReducers(undefined, addTodo( '1'))
        let ret = todoAppReducers(state, addTodo('2'))
        ret = todoAppReducers(ret, focusSubTodo('1', undefined))
        expect(ret).toMatchObject({
            todos: {
                focusTodo: '1',
                focusSubTodo: undefined,

            },
            visibilityFilter: VisibilityFilters.SHOW_ALL
        })
        expect(ret.todos).toMatchObject({
            todos: [{
                id: 'default',
                text: 'default'
            },
                {
                    text: '1',
                    subItems: []
                },
                {
                    text: '2',
                    subItems: []
                }
            ],
        })
        ret.todos.todos.forEach(todo => todo.subItems.forEach(subtodo => expect(subtodo.createdDate).toBeDefined()))
    });
});