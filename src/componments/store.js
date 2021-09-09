import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import Storage from "./storage";
import todoSlice from "./todo/todoSlice";
import clockSlice from "./clock/ClockSlice";
import opSlice from "./todo/opSlice";
import visibilityFilterSlice,{setVisibilityFilter}  from "./todo/visibilityFilterSlice";
import { combineReducers } from "redux";
import {addOp} from "./todo/opSlice";
import {set_stopped_at } from "./clock/ClockSlice"
let storage = new Storage();
const persistedState = storage.loadState();
console.log("loaded state", persistedState);
const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.info("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  console.groupEnd();
  return result;
};
const isInterestedAction = action => {
  return action.type !== addOp.type && action.type !== set_stopped_at.type &&
      action.type !== setVisibilityFilter.type
}
const opMiddleware = store => next => action =>{
  if (isInterestedAction(action)){
    next(addOp(action))
  }
  return next(action)
}
const store = configureStore({
  reducer: combineReducers({
    todos: todoSlice,
    visibilityFilter: visibilityFilterSlice,
    oplogs: opSlice,
    clock: clockSlice,
  }),
  middleware: [...getDefaultMiddleware(), opMiddleware, logger],
  preloadedState: persistedState,
});

store.subscribe(() => {
  storage.saveState(store.getState());
});

export default store;
