import {createSlice} from '@reduxjs/toolkit'

export const SettingFilter = {
    SHORT_BREAK_DURATION: 'SHORT_BREAK_DURATION',
    LONG_BREAK_DURATION: 'LONG_BREAK_DURATION',
    POMODORO_DURATION: 'POMODORO_DURATION'
}

export const settingSlice = createSlice({
    name: 'clock_settings',
    initialState: {
        short_break_duration: 5 * 60,
        long_break_duration: 25 * 60,
        pomodoro_duration: 30 * 60,
        ticking_sound_enabled: true,
        rest_ticking_sound_enabled: false
    },
    reducers: {
        set_short_break: (state, action) => {
            state.short_break_duration = action.payload
        },
        set_long_break: (state, action) => {
            state.long_break_duration = action.payload
        },
        set_pomodoro_break: (state, action) => {
            state.pomodoro_duration = action.payload
        },
        set_ticking_sound: (state, action) => {
            state.ticking_sound_enabled = action.payload
        },
        set_rest_ticking_sound: (state, action) => {
            state.rest_ticking_sound_enabled = action.payload
        }
    }
})
export const {set_long_break, set_pomodoro_break, set_short_break, set_rest_ticking_sound, set_ticking_sound}
    = settingSlice.actions

export default settingSlice.reducer