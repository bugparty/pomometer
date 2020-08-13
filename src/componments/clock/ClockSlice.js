import {createSlice} from '@reduxjs/toolkit'

export const ClockMode = {
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK',
    POMODORO: 'POMODORO',
    STOPPED: 'STOPEED'
}
export const ClockStatus = {
    COUNTING_DOWN: 'counting_down',
    COUNTING_ENDED: 'counting_ended',
    RESET: 'reset'
}

export const ClockSlice = createSlice({
    name: 'clock',
    initialState: {
        mode: ClockMode.POMODORO,
        status: ClockStatus.RESET,
        timeInterval: 25 * 60,
        timeLeft: 25 * 60,
    },
    reducers: {
        set_status: (state, action) => {
            state.status = action.payload
        },
        set_time_interval: (state, action) => {
            state.timeInterval = action.payload
        }
    }
})

export const {set_status, set_time_interval} = ClockSlice.actions
export default ClockSlice.reducer

