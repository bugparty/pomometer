import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
export const Op = {
  start_short_rest: "start_short_rest",
  start_long_rest: "start_long_rest",
  start_pomodoro: "start_pomodoro",
  reset_timer: "reset_timer",
};
export const opSlice = createSlice({
  name: "oplogs",
  initialState: [],
  reducers: {
    addOp: {
      reducer(state, action) {
        state.push({
          id: action.payload.id,
          op: action.payload.op,
          text: action.payload.text,
          todoId: action.payload.todoId,
          subTodoId: action.payload.subTodoId,
          duration: action.payload.duration,
          createdDate: action.payload.createdDate,
        });
      },
      prepare(todoId, subTodoId, op, text, duration) {
        return {
          payload: {
            id: uuidv4(),
            op: op,
            text: text,
            todoId: todoId,
            subTodoId: subTodoId,
            duration: duration,
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
