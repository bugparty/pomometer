import {configureStore} from "@reduxjs/toolkit";
import Storage from "./storage";
import todoSlice from "./todo/todoSlice";
import clockSlice from "./clock/ClockSlice";
import opSlice from "./todo/opSlice";
import visibilityFilterSlice   from "./todo/visibilityFilterSlice";
import OpVisibilityFilterSlice from "./todo/OpVisibilityFilterSlice"
import { combineReducers } from "redux";
let storage = new Storage();
const persistedState = storage.loadState();
console.log("loaded state", persistedState);


const store = configureStore({
  reducer: combineReducers({
    todos: todoSlice,
    visibilityFilter: visibilityFilterSlice,
    oplogs: opSlice,
    clock: clockSlice,
    opfilter: OpVisibilityFilterSlice
  }),
  preloadedState: persistedState,
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch


store.subscribe(() => {
  storage.saveState(store.getState());
});

export default store;
