import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export enum ClockMode {
    SHORT_BREAK= "SHORT_BREAK",
    LONG_BREAK= "LONG_BREAK",
    POMODORO="POMODORO",
    STOPPED= "STOPEED",
}
export enum ClockStatus  {
    COUNTING_DOWN= "counting_down",
    COUNTING_ENDED= "counting_ended",
    RESET= "reset",
}
export enum SettingFilter  {
    SHORT_BREAK_DURATION= "SHORT_BREAK_DURATION",
    LONG_BREAK_DURATION= "LONG_BREAK_DURATION",
    POMODORO_DURATION= "POMODORO_DURATION",
}
export interface ClockState {
    mode: ClockMode,
    status: ClockStatus,
    timeInterval: number,
    timeLeft: number,
    playingTick: boolean,
    playingAlarm: boolean,
    short_break_duration: number,
    long_break_duration: number,
    pomodoro_duration: number,
    ticking_sound_enabled: boolean,
    rest_ticking_sound_enabled: boolean,
    startedAt: number | undefined,
    stoppedAt: number | undefined,
    baseTime: number | undefined,
}
const DEFAULT_STATE:ClockState = {
    mode: ClockMode.POMODORO,
    status: ClockStatus.RESET,
    timeInterval: 25 * 60,
    timeLeft: 25 * 60,
    playingTick: false,
    playingAlarm: false,
    short_break_duration: 5 * 60,
    long_break_duration: 25 * 60,
    pomodoro_duration: 30 * 60,
    ticking_sound_enabled: true,
    rest_ticking_sound_enabled: false,
    startedAt: undefined,
    stoppedAt: undefined,
    baseTime: undefined,
}
export const ClockSlice = createSlice({
    name: "clock",
    initialState: DEFAULT_STATE,
    reducers: {
        set_status: (state, action:PayloadAction<ClockStatus>) => {
            state.status = action.payload;
        },
        set_mode: (state, action:PayloadAction<ClockMode>) => {
            state.mode = action.payload;
            switch (state.mode) {
                case ClockMode.POMODORO:
                    state.timeInterval = state.pomodoro_duration;
                    break;
                case ClockMode.LONG_BREAK:
                    state.timeInterval = state.long_break_duration;
                    break;
                case ClockMode.SHORT_BREAK:
                    state.timeInterval = state.short_break_duration;
                    break;
                default:
                    state.timeInterval = state.pomodoro_duration;
            }
        },
        set_time_interval: (state, action:PayloadAction<number>) => {
            state.timeInterval = action.payload;
        },
        set_play_tick: (state, action:PayloadAction<boolean>) => {
            state.playingTick = action.payload;
        },
        set_play_alarm: (state, action:PayloadAction<boolean>) => {
            state.playingAlarm = action.payload;
        },
        set_short_break: (state, action:PayloadAction<number>) => {
            state.short_break_duration = action.payload;
        },
        set_long_break: (state, action:PayloadAction<number>) => {
            state.long_break_duration = action.payload;
        },
        set_pomodoro_break: (state, action:PayloadAction<number>) => {
            state.pomodoro_duration = action.payload;
        },
        set_ticking_sound: (state, action:PayloadAction<boolean>) => {
            state.ticking_sound_enabled = action.payload;
        },
        set_rest_ticking_sound: (state, action:PayloadAction<boolean>) => {
            state.rest_ticking_sound_enabled = action.payload;
        },
        reset_timer: {
            reducer: (state, action:PayloadAction<{now:number}>) => {
                state.baseTime = 0;
                state.startedAt = state.startedAt ? action.payload.now : undefined;
                state.stoppedAt = state.stoppedAt ? action.payload.now : undefined;
                state.status = ClockStatus.RESET;
            },
            prepare: () => ({payload: {now: new Date().getTime()}}),
        },
        start_timer: {
            reducer: (state, action:PayloadAction<{now:number,baseTime:number}>) => {
                state.baseTime = action.payload.baseTime;
                state.startedAt = action.payload.now;
                state.stoppedAt = undefined;
                state.status = ClockStatus.COUNTING_DOWN;
            },
            prepare: (baseTime:number = 0) => ({
                payload: {now: new Date().getTime(), baseTime},
            }),
        },
        set_stopped_at: (state, action:PayloadAction<number>) => {
            state.stoppedAt = action.payload;

        },
        stop_timer: (state) => {
            state.stoppedAt = new Date().getTime();
            state.status = ClockStatus.COUNTING_ENDED;
        },
        reset_settings: (state) => {
            state.mode = ClockMode.POMODORO
            state.status = ClockStatus.RESET
            state.timeInterval = 25 * 60
            state.timeLeft = 25 * 60
            state.playingTick = false
            state.playingAlarm = false
            state.short_break_duration = 5 * 60
            state.long_break_duration = 25 * 60
            state.pomodoro_duration = 30 * 60
            state.ticking_sound_enabled = true
            state.rest_ticking_sound_enabled = false
        }
    },
});

export const {
    set_status,
    set_time_interval,
    set_play_alarm,
    set_mode,
    set_play_tick,
    set_long_break,
    set_pomodoro_break,
    set_short_break,
    set_rest_ticking_sound,
    set_ticking_sound,
    reset_timer,
    start_timer,
    stop_timer,
    set_stopped_at,
    reset_settings
} = ClockSlice.actions;
export default ClockSlice.reducer;
