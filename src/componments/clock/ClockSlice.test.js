import expect from 'expect'
import clockReducer, {
    ClockMode,
    ClockStatus,
    reset_timer,
    set_long_break,
    set_mode,
    set_play_alarm,
    set_play_tick,
    set_pomodoro_break,
    set_rest_ticking_sound,
    set_short_break,
    set_status,
    set_ticking_sound,
    set_time_interval,
    start_timer,
    stop_timer
} from './ClockSlice'

describe('ClockReducer', () => {
    it('returns the initial state', () => {
        expect(clockReducer(undefined, {})).toEqual({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
            short_break_duration: 5 * 60,
            long_break_duration: 25 * 60,
            pomodoro_duration: 30 * 60,
            ticking_sound_enabled: true,
            rest_ticking_sound_enabled: false,
            startedAt: undefined,
            stoppedAt: undefined,
            baseTime: undefined
        })
    })

    it('handle set mode', () => {
        expect(clockReducer(undefined, set_mode(ClockMode.LONG_BREAK))).toMatchObject({
            mode: ClockMode.LONG_BREAK,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })
    it('handle set status', () => {
        expect(clockReducer(undefined, set_status(ClockStatus.COUNTING_DOWN))).toMatchObject({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.COUNTING_DOWN,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })

    it('handle  set interval', () => {
        expect(clockReducer(undefined, set_time_interval(60))).toMatchObject({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 60,
            timeLeft: 25 * 60,
        })
    })

    it('handle set play alram', () => {
        expect(clockReducer(undefined, set_play_alarm(true))).toMatchObject({
            mode: ClockMode.POMODORO,
            playingAlarm: true,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })

    it('handle set play tick', () => {
        expect(clockReducer(undefined, set_play_tick(true))).toMatchObject({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: true,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })

    it('test short break', () => {
        let duration = 30
        expect(clockReducer(undefined, set_short_break(duration))).toMatchObject({
            short_break_duration: duration,
            long_break_duration: 25 * 60,
            pomodoro_duration: 30 * 60,
            ticking_sound_enabled: true,
            rest_ticking_sound_enabled: false
        })
    })

    it('test long break', () => {
        let duration = 30
        expect(clockReducer(undefined, set_long_break(duration))).toMatchObject({
            long_break_duration: duration
        })
    })

    it('test pomodoro duration', () => {
        let duration = 30
        expect(clockReducer(undefined, set_pomodoro_break(duration))).toMatchObject({
            pomodoro_duration: duration
        })
    })

    it('test ticking sound', () => {
        let status = false
        expect(clockReducer(undefined, set_ticking_sound(status))).toMatchObject({
            ticking_sound_enabled: status
        })
    })

    it('test ticking sound', () => {
        let status = true
        expect(clockReducer(undefined, set_rest_ticking_sound(status))).toMatchObject({
            rest_ticking_sound_enabled: status
        })
    })

    it('handle reset ', () => {
        expect(clockReducer(undefined, reset_timer())).toMatchObject({
            startedAt: undefined,
            stoppedAt: undefined,
            baseTime: 0
        })
    })
    it('handle stop timer ', () => {
        let state = clockReducer(undefined, stop_timer())
        expect(state).toMatchObject({
            startedAt: undefined,
            baseTime: undefined
        })
        expect(state.stoppedAt).toBeGreaterThan(1601029820223)
    })
    it('handle start timer ', () => {
        let state = clockReducer(undefined, start_timer())
        expect(state).toMatchObject({
            stoppedAt: undefined,
            baseTime: 0
        })
        expect(state.startedAt).toBeGreaterThan(1601029820223)

    })
})