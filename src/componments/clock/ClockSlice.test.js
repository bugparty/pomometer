import expect from 'expect'
import clockReducer, {
    ClockMode,
    ClockStatus,
    set_mode,
    set_play_alarm,
    set_play_tick,
    set_status,
    set_time_interval
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
        })
    })

    it('handle set mode', () => {
        expect(clockReducer(undefined, set_mode(ClockMode.LONG_BREAK))).toEqual({
            mode: ClockMode.LONG_BREAK,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })
    it('handle set status', () => {
        expect(clockReducer(undefined, set_status(ClockStatus.COUNTING_DOWN))).toEqual({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.COUNTING_DOWN,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })

    it('handle  set interval', () => {
        expect(clockReducer(undefined, set_time_interval(60))).toEqual({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 60,
            timeLeft: 25 * 60,
        })
    })

    it('handle set play alram', () => {
        expect(clockReducer(undefined, set_play_alarm(true))).toEqual({
            mode: ClockMode.POMODORO,
            playingAlarm: true,
            playingTick: false,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })

    it('handle set play tick', () => {
        expect(clockReducer(undefined, set_play_tick(true))).toEqual({
            mode: ClockMode.POMODORO,
            playingAlarm: false,
            playingTick: true,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })
})