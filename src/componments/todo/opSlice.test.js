import expect from "expect";
import oplogs, { addOp } from "./opSlice";
import { combineReducers } from "redux";
import {Op} from "./opSlice"
const opLogsReducer = combineReducers({
  oplogs,
});
describe("Reducer", () => {
  it("returns the initial state", () => {
    expect(opLogsReducer(undefined, {})).toEqual({
      oplogs: [],
    });
  });

  it("handles the addOp action", () => {
    let ret = opLogsReducer(undefined, addOp( "todoid", "subid", Op.start_pomodoro,"hello", 100));
    expect(ret).toMatchObject({
      oplogs: [
        {
          todoId: 'todoid',
          subTodoId: 'subid',
          duration: 100,
          text: "hello",
          op: Op.start_pomodoro
        },
      ],
    });
  });
});
