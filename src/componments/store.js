import Storage from "./storage";
import {createStore, applyMiddleware} from "redux";
import todoApp from './reducers'
import {ADD_TODO} from "./actions";

let storage = new Storage()
const persistedState = storage.loadState()
console.log('loaded state', persistedState)

const store = createStore(todoApp, persistedState)

store.subscribe(()=> {
    storage.saveState(store.getState())
})

export default store