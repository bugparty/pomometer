import { combineReducers } from "redux";
import { serverAwareTodoReducer } from "./todo/todoSlice";
import clockSlice from "./clock/ClockSlice";
import opSlice from "./todo/opSlice";
import visibilityFilterSlice from "./todo/visibilityFilterSlice";
import OpVisibilityFilterSlice from "./todo/OpVisibilityFilterSlice";
import authSlice from "./auth/authSlice";

export const rootReducer = combineReducers({
  todos: serverAwareTodoReducer,
  visibilityFilter: visibilityFilterSlice,
  oplogs: opSlice,
  clock: clockSlice,
  opfilter: OpVisibilityFilterSlice,
  auth: authSlice,
});
export type RootState = ReturnType<typeof rootReducer>