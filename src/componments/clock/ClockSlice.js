import { createSlice } from "@reduxjs/toolkit";

export const ClockMode = {
  SHORT_BREAK: "SHORT_BREAK",
  LONG_BREAK: "LONG_BREAK",
  POMODORO: "POMODORO",
  STOPPED: "STOPEED",
};
export const ClockStatus = {
  COUNTING_DOWN: "counting_down",
  COUNTING_ENDED: "counting_ended",
  RESET: "reset",
};
export const SettingFilter = {
  SHORT_BREAK_DURATION: "SHORT_BREAK_DURATION",
  LONG_BREAK_DURATION: "LONG_BREAK_DURATION",
  POMODORO_DURATION: "POMODORO_DURATION",
};

export const ClockSlice = createSlice({
  name: "clock",
  initialState: {
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
  },
  reducers: {
    set_status: (state, action) => {
      state.status = action.payload;
    },
    set_mode: (state, action) => {
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
    set_time_interval: (state, action) => {
      state.timeInterval = action.payload;
    },
    set_play_tick: (state, action) => {
      state.playingTick = action.payload;
    },
    set_play_alarm: (state, action) => {
      state.playingAlarm = action.payload;
    },
    set_short_break: (state, action) => {
      state.short_break_duration = action.payload;
    },
    set_long_break: (state, action) => {
      state.long_break_duration = action.payload;
    },
    set_pomodoro_break: (state, action) => {
      state.pomodoro_duration = action.payload;
    },
    set_ticking_sound: (state, action) => {
      state.ticking_sound_enabled = action.payload;
    },
    set_rest_ticking_sound: (state, action) => {
      state.rest_ticking_sound_enabled = action.payload;
    },
    reset_timer: {
      reducer: (state, action) => {
        state.baseTime = 0;
        state.startedAt = state.startedAt ? action.payload.now : undefined;
        state.stoppedAt = state.stoppedAt ? action.payload.now : undefined;
        state.status = ClockStatus.RESET;
      },
      prepare: (state) => ({ payload: { now: new Date().getTime() } }),
    },
    start_timer: {
      reducer: (state, action) => {
        state.baseTime = action.payload.baseTime;
        state.startedAt = action.payload.now;
        state.stoppedAt = undefined;
        state.status = ClockStatus.COUNTING_DOWN;
      },
      prepare: (baseTime = 0) => ({
        payload: { now: new Date().getTime(), baseTime },
      }),
    },
    set_stopped_at: (state, action) => {
      state.stoppedAt = action.payload;
    },
    stop_timer: (state) => {
      state.stoppedAt = new Date().getTime();
    },
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
} = ClockSlice.actions;
export default ClockSlice.reducer;
