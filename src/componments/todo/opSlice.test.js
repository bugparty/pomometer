import expect from "expect";
import oplogs, { addOp , Operation} from "./opSlice";
import { combineReducers } from "redux";
const opLogsReducer = combineReducers({
  oplogs,
});
describe("Reducer", () => {
  it("returns the initial state", () => {
    expect(opLogsReducer(undefined, {})).toEqual({
      oplogs: {
        ops:[]
      },
    });
  });

  it("handles the addOp action", () => {
    let ret = opLogsReducer(undefined, addOp(  Operation.start_pomodoro));
    expect(ret).toMatchObject({
      oplogs:{ops: [
          {
            op: Operation.start_pomodoro
          },
        ]} ,
    });
  });
});
