import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import Storage from "./storage";
import todoSlice from "./todo/todoSlice";
import clockSlice, {ClockStatus, reset_timer} from "./clock/ClockSlice";
import opSlice from "./todo/opSlice";
import visibilityFilterSlice,{setVisibilityFilter}  from "./todo/visibilityFilterSlice";
import { combineReducers } from "redux";
import {addOp} from "./todo/opSlice";
import {set_stopped_at, stop_timer,start_timer } from "./clock/ClockSlice"
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
// add operation logs
const opMiddleware = store => next => action =>{
  if (isInterestedAction(action)){
    store.dispatch(addOp(action))
  }
  return next(action)
}
var timer = null
const timer_func = store => {
  timer = setTimeout(()=>{
    store.dispatch(set_stopped_at(new Date().getTime()))
  }, 1000);
  console.log("setTimeout", timer)
}
const clearCountDown = () => {
  clearTimeout(timer)
  console.log('going to clear timer', timer)
  timer = null

}
// stop timer when ui is absent
const timerMiddleware = store => next => action => {
  console.log("timerMiddleware", action)
  if (action.type === start_timer.type){

    timer_func(store)
  }else if (action.type === set_stopped_at.type){

    let state = store.getState()
    let duration = (state.clock.stoppedAt - state.clock.startedAt) / 1000
    console.log('duration',duration)
    if (duration > state.clock.timeInterval){
        clearCountDown()
        store.dispatch(stop_timer())
    }else if (store.getState().clock.status === ClockStatus.COUNTING_DOWN){
      timer_func(store)
    }
  }else if (action.type === reset_timer.type){
      clearCountDown()
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
  middleware: [...getDefaultMiddleware(), opMiddleware,timerMiddleware],
  preloadedState: persistedState,
});

store.subscribe(() => {
  storage.saveState(store.getState());
});

export default store;
