import {Middleware, MiddlewareAPI, PayloadAction} from "@reduxjs/toolkit";
import {addOp} from "./todo/opSlice";
import {ClockStatus, reset_timer, set_stopped_at, start_timer, stop_timer} from "./clock/ClockSlice";
import {setVisibilityFilter} from "./todo/visibilityFilterSlice";
import  {AppDispatch, RootState} from "./store"
import ReactGA from 'react-ga';
const isInterestedAction = (action: PayloadAction<any>) => {
    return action.type !== addOp.type && action.type !== set_stopped_at.type &&
        action.type !== setVisibilityFilter.type
}

// add operation logs
export const opMiddleware: Middleware<{}, RootState> =
    store => next => action =>{
        if (isInterestedAction(action)){
            store.dispatch(addOp(action))
            
        }
        return next(action)
    }
export const googleAnalysisMiddleware: Middleware<{}, RootState> =
    store => next => action => {
        if (action.type !== set_stopped_at.type && action.type !== addOp.type){
            ReactGA.event({category: 'UserOp',
            action:action.type })
        }
        return next(action)
    }
var timer : NodeJS.Timeout
const timer_func = (store: MiddlewareAPI<AppDispatch, RootState>)  => {
    timer = setTimeout(()=>{
        store.dispatch(set_stopped_at(new Date().getTime()))
    }, 1000);
    //console.log("setTimeout", timer)
}
const clearCountDown = () => {
    clearTimeout(timer)
    console.log('going to clear timer', timer)
    // @ts-ignore
    timer = null

}
// stop timer when ui is absent
export const timerMiddleware: Middleware<{}, RootState> =
    store => next => action =>{
        //console.log("timerMiddleware", action)
        if (action.type === start_timer.type){

            timer_func(store)
        }else if (action.type === set_stopped_at.type){

            let state = store.getState()

            // @ts-ignore
            let duration = (state.clock.stoppedAt - state.clock.startedAt) / 1000
            //console.log('duration',duration)
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