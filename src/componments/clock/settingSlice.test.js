import expect from 'expect'
import settingReducer, {
    set_long_break,
    set_pomodoro_break,
    set_rest_ticking_sound,
    set_short_break,
    set_ticking_sound
} from './settingSlice'

describe('VisibilityFilterReducer', () => {
    it('returns the initial state', () => {
        expect(settingReducer(undefined, {})).toEqual({
            short_break_duration: 5 * 60,
            long_break_duration: 25 * 60,
            pomodoro_duration: 30 * 60,
            ticking_sound_enabled: true,
            rest_ticking_sound_enabled: false
        })
    })

    it('test short break', () => {
        let duration = 30
        expect(settingReducer(undefined, set_short_break(duration))).toEqual({
            short_break_duration: duration,
            long_break_duration: 25 * 60,
            pomodoro_duration: 30 * 60,
            ticking_sound_enabled: true,
            rest_ticking_sound_enabled: false
        })
    })

    it('test long break', () => {
        let duration = 30
        expect(settingReducer(undefined, set_long_break(duration))).toMatchObject({
            long_break_duration: duration
        })
    })

    it('test pomodoro duration', () => {
        let duration = 30
        expect(settingReducer(undefined, set_pomodoro_break(duration))).toMatchObject({
            pomodoro_duration: duration
        })
    })

    it('test ticking sound', () => {
        let status = false
        expect(settingReducer(undefined, set_ticking_sound(status))).toMatchObject({
            ticking_sound_enabled: status
        })
    })

    it('test ticking sound', () => {
        let status = true
        expect(settingReducer(undefined, set_rest_ticking_sound(status))).toMatchObject({
            rest_ticking_sound_enabled: status
        })
    })
})