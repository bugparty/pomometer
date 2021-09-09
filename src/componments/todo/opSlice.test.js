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
    let ret = opLogsReducer(undefined, addOp(  Op.start_pomodoro));
    expect(ret).toMatchObject({
      oplogs: [
        {
          op: Op.start_pomodoro
        },
      ],
    });
  });
});
