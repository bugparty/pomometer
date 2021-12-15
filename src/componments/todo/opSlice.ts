import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export enum Op {
  start_short_rest = "start_short_rest",
  start_long_rest =  "start_long_rest",
  start_pomodoro =  "start_pomodoro",
  reset_timer =  "reset_timer",
}
export interface OpLogParams {
  id: string,
  op: any,
  createdDate: string
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
      prepare(op : any) {
        return {
          payload: {
            id: uuidv4(),
            op: op,
            createdDate: new Date().toJSON(),
          },
        };
      },
    },
  },
});
// console.log(todoSlice)

export const { addOp } = opSlice.actions;

export default opSlice.reducer;
