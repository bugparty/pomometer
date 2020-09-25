import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit'
import Storage from "./storage";
import todoSlice from './todo/todoSlice'
import clockTimerSlice from './clock/ClockTimerSlice'
import clockSlice from './clock/ClockSlice'
import visibilityFilterSlice from './todo/visibilityFilterSlice'
import {combineReducers} from "redux";

let storage = new Storage()
const persistedState = storage.loadState()
console.log('loaded state', persistedState)
const logger = store => next => action => {
    console.group(action.type)
    console.info('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    console.groupEnd()
    return result
}
console.log(todoSlice)
const store =  configureStore({
    reducer: combineReducers({
        todos: todoSlice,
        visibilityFilter: visibilityFilterSlice,
        clock: clockSlice,
        clockTimer: clockTimerSlice
    }),
    middleware: [...getDefaultMiddleware(), logger],
    preloadedState: persistedState
})

store.subscribe(()=> {
    storage.saveState(store.getState())
})

export default store