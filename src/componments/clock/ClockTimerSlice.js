import {createSlice} from "@reduxjs/toolkit";

const ClockTimerSlice = createSlice({
    name: 'clock_timer',
    initialState: {
        startedAt: undefined,
        stoppedAt: undefined,
        baseTime: undefined
    },
    reducers: {
        reset_timer: {
            reducer: (state, action) => {
                state.baseTime = 0
                state.startedAt = state.startedAt ? action.payload.now : undefined
                state.stoppedAt = state.stoppedAt ? action.payload.now : undefined
            },
            prepare: state => ({payload: {now: new Date().getTime()}})
        },
        start_timer: {
            reducer: (state, action) => {
                state.baseTime = action.payload.baseTime
                state.startedAt = action.payload.now
                state.stoppedAt = undefined
            },
            prepare: (baseTime = 0) => (
                {payload: {now: new Date().getTime(), baseTime}}
            )
        },
        stop_timer: (state) => {
            state.stoppedAt = new Date().getTime()
        }
    }
})

export function getElapsedTime(baseTime, startedAt, stoppedAt = new Date().getTime()) {
    if (!startedAt) {
        return 0;
    } else {
        return stoppedAt - startedAt + baseTime;
    }
}

export const {reset_timer, start_timer, stop_timer} = ClockTimerSlice.actions
export default ClockTimerSlice.reducer