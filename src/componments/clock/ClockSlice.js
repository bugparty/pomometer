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
        playingTick: false,
        playingAlarm: false
    },
    reducers: {
        set_status: (state, action) => {
            state.status = action.payload
        },
        set_mode: (state, action) => {
            state.mode = action.payload
        },
        set_time_interval: (state, action) => {
            state.timeInterval = action.payload
        },
        set_play_tick: (state, action) => {
            state.playingTick = action.payload
        },
        set_play_alarm: (state, action) => {
            state.playingAlarm = action.payload
        }
    }
})

export const {set_status, set_time_interval, set_play_alarm, set_mode, set_play_tick} = ClockSlice.actions
export default ClockSlice.reducer

