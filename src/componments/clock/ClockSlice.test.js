import expect from 'expect'
import clockReducer, {ClockMode, ClockStatus} from './ClockSlice'

describe('ClockReducer', () => {
    it('returns the initial state', () => {
        expect(clockReducer(undefined, {})).toEqual({
            mode: ClockMode.POMODORO,
            status: ClockStatus.RESET,
            timeInterval: 25 * 60,
            timeLeft: 25 * 60,
        })
    })
})