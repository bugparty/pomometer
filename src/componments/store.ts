import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import Storage from "./storage";
import todoSlice from "./todo/todoSlice";
import clockSlice from "./clock/ClockSlice";
import opSlice from "./todo/opSlice";
import visibilityFilterSlice   from "./todo/visibilityFilterSlice";
import OpVisibilityFilterSlice from "./todo/OpVisibilityFilterSlice"
import { combineReducers, applyMiddleware } from "redux";
import  {opMiddleware, timerMiddleware} from "./middlewares";
let storage = new Storage();
const persistedState = storage.loadState();
console.log("loaded state", persistedState);
const rootReducer = combineReducers({
  todos: todoSlice,
  visibilityFilter: visibilityFilterSlice,
  oplogs: opSlice,
  clock: clockSlice,
  opfilter: OpVisibilityFilterSlice
})


const store = configureStore({
  reducer: rootReducer,
  middleware: [opMiddleware, timerMiddleware,...getDefaultMiddleware()],
  preloadedState: persistedState,
});
// Infer the `RootState` and `AppDispatch` types from the store itself
// @ts-ignore
export type RootState = ReturnType<typeof rootReducer>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch


store.subscribe(() => {
  storage.saveState(store.getState());
});

export default store;
