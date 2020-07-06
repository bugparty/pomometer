import Storage from "./storage";
import {createStore} from "redux";
import todoApp from './reducers'

let storage = new Storage()
const persistedState = storage.loadState()
console.log('loaded state', persistedState)

const store = createStore(todoApp, persistedState)

store.subscribe(()=> {
    storage.saveState(store.getState())
})

export default store