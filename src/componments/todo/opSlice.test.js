import expect from 'expect';
import oplogs, {addOp} from "./opSlice";
import {combineReducers} from "redux";

const opLogsReducer = combineReducers({
    oplogs
})
describe('Reducer', () => {
    it('returns the initial state', () => {
        expect(opLogsReducer(undefined, {})).toEqual({
            oplogs: []

        });
    });

    it('handles the addTodo action', () => {
        let ret = opLogsReducer(undefined, addOp("abc","hello", 100))
        expect(ret).toMatchObject({
            oplogs: [{
                duration: 100,
                text: "hello",
                todoId : "abc"
            }],

        })
        ret.todos.forEach(todo => expect(todo.createdDate).toBeDefined())
    });



});