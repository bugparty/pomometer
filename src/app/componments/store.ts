import {configureStore} from "@reduxjs/toolkit";
import Storage from "./storage";
import todoSlice, { serverAwareTodoReducer } from "./todo/todoSlice";
import clockSlice from "./clock/ClockSlice";
import opSlice from "./todo/opSlice";
import visibilityFilterSlice   from "./todo/visibilityFilterSlice";
import OpVisibilityFilterSlice from "./todo/OpVisibilityFilterSlice"
import authSlice from "./auth/authSlice";
import { combineReducers } from "redux";
import  {opMiddleware, timerMiddleware, googleAnalysisMiddleware} from "./middlewares";
import * as Sentry from "@sentry/react";
const storage = new Storage();
const persistedState = storage.loadState();


const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});
const rootReducer = combineReducers({
  todos: serverAwareTodoReducer,
  visibilityFilter: visibilityFilterSlice,
  oplogs: opSlice,
  clock: clockSlice,
  opfilter: OpVisibilityFilterSlice,
  auth: authSlice,
})


const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat([
      opMiddleware, 
      timerMiddleware,
      googleAnalysisMiddleware
    ]),
  preloadedState: persistedState,
});
// Infer the `RootState` and `AppDispatch` types from the store itself

export type RootState = ReturnType<typeof rootReducer>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch


store.subscribe(() => {
  try {
    storage.saveState(store.getState());
  } catch (error) {
    console.error('Failed to save state to storage:', error)
  }
});

export default store;
