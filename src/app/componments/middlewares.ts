import {Middleware, MiddlewareAPI, PayloadAction} from "@reduxjs/toolkit";
import { Dispatch } from 'redux';
import {addOp, OpAction} from "./todo/opSlice";
import {ClockStatus, reset_timer, set_stopped_at, start_timer, stop_timer} from "./clock/ClockSlice";
import {setVisibilityFilter} from "./todo/visibilityFilterSlice";
import {logout, clearError} from "./auth/authSlice";
import { RootState } from "./rootReducer";
import ReactGA from 'react-ga';
const isInterestedAction = (action: { type: string }): action is OpAction => {
    // 记录除了这些特定action之外的所有action
    const excludedActions: string[] = [
        addOp.type, 
        set_stopped_at.type,
        setVisibilityFilter.type, 
        logout.type,
        clearError.type
    ];
    return !excludedActions.includes(action.type);
}

// add operation logs
export const opMiddleware: Middleware<unknown, RootState> =
    store => next => action =>{
        if (action && typeof action === 'object' && 'type' in action && isInterestedAction(action as { type: string })){
            store.dispatch(addOp(action as OpAction))
        }
        return next(action)
    }
export const googleAnalysisMiddleware: Middleware<unknown, RootState> =
    store => next => action => {
        if ((action as { type: string }).type !== set_stopped_at.type){
            ReactGA.event({category: 'UserOp',
            action:(action as { type: string }).type })
        }
        return next(action)
    }
let timer : NodeJS.Timeout | null = null
const timer_func = (store: MiddlewareAPI<Dispatch, RootState>)  => {
    // 清除之前的定时器
    if (timer) {
        clearTimeout(timer)
    }
    
    timer = setTimeout(()=>{
        // 检查时钟状态，避免无限循环
        const state = store.getState()
        if (state.clock.status === ClockStatus.COUNTING_DOWN) {
            store.dispatch(set_stopped_at(new Date().getTime()))
        }
    }, 1000);
    //console.log("setTimeout", timer)
}
const clearCountDown = () => {
    if (timer) {
        clearTimeout(timer)
        console.log('going to clear timer', timer)
        timer = null
    }
}
// stop timer when ui is absent
export const timerMiddleware: Middleware<unknown, RootState> =
    store => next => action =>{
        //console.log("timerMiddleware", action)
        if ((action as { type: string }).type === start_timer.type){

            timer_func(store)
        }else if ((action as { type: string }).type === set_stopped_at.type){

            const state = store.getState()

            const startedAt = state.clock.startedAt ?? 0
            const stoppedAt = state.clock.stoppedAt ?? Date.now()
            const duration = (stoppedAt - startedAt) / 1000
            //console.log('duration',duration)
            if (duration > state.clock.timeInterval){
                clearCountDown()
                store.dispatch(stop_timer())
            }else if (store.getState().clock.status === ClockStatus.COUNTING_DOWN){
                timer_func(store)
            }


        }else if ((action as { type: string }).type === reset_timer.type){
            clearCountDown()
        }
        return next(action)
    }
