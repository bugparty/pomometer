import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export const opSlice = createSlice({
  name: "oplogs",
  initialState: [],
  reducers: {
    addOp: {
      reducer(state, action) {
        state.push({
          id: action.payload.id,
          text: action.payload.text,
          todoId: action.payload.todoId,
          duration: action.payload.duration,
          createdDate: action.payload.createdDate,
        });
      },
      prepare(todoId, text, duration) {
        return {
          payload: {
            id: uuidv4(),
            text: text,
            todoId: todoId,
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
