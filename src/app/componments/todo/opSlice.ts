import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  set_mode,
  start_timer,
  reset_timer,
  stop_timer,
  set_status,
  set_short_break,
  set_long_break,
  set_pomodoro_break,
} from "../clock/ClockSlice";
import {
  addTodo,
  addSubTodo,
  toggleSubTodo,
  toggleTodo,
  focusSubTodo,
  deleteTodo,
  deleteSubTodo,
} from "./todoSlice";

export enum Operation {
  start_short_rest = "start_short_rest",
  start_long_rest =  "start_long_rest",
  start_pomodoro =  "start_pomodoro",
  reset_timer =  "reset_timer",
}
// All operation actions that can be recorded in the op log
export type OpAction =
  // Clock-related actions we record
  | ReturnType<typeof set_mode>
  | ReturnType<typeof start_timer>
  | ReturnType<typeof reset_timer>
  | ReturnType<typeof stop_timer>
  | ReturnType<typeof set_status>
  | ReturnType<typeof set_short_break>
  | ReturnType<typeof set_long_break>
  | ReturnType<typeof set_pomodoro_break>
  // Todo-related actions we record
  | ReturnType<typeof addTodo>
  | ReturnType<typeof addSubTodo>
  | ReturnType<typeof toggleSubTodo>
  | ReturnType<typeof toggleTodo>
  | ReturnType<typeof focusSubTodo>
  | ReturnType<typeof deleteTodo>
  | ReturnType<typeof deleteSubTodo>;
export interface OpLogParams {
  id: string,
  op: OpAction,
  createdDate: number
}
export interface OpState{
  ops: OpLogParams []
}
const initialState : OpState = {
  ops: []
}

export const opSlice = createSlice({
  name: "oplogs",
  initialState: initialState,
  reducers: {
    addOp: {
      reducer(state, action: PayloadAction<OpLogParams>) {
        state.ops.push({
          id: action.payload.id,
          op: action.payload.op,
          createdDate: action.payload.createdDate,
        });
      },
      prepare(op : OpAction) {
        return {
          payload: {
            id: uuidv4(),
            op: op,
            createdDate: new Date().getTime(),
          },
        };
      },
    },
  },
});
// console.log(todoSlice)

export const { addOp } = opSlice.actions;

export default opSlice.reducer;
