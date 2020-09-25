import expect from 'expect'
import clockTimerReducer, {reset_timer, start_timer, stop_timer} from './ClockTimerSlice'

describe('CLockTimerSlice', () => {
    it('return the initial state', () => {
        expect(clockTimerReducer(undefined, {})).toEqual({
            startedAt: undefined,
            stoppedAt: undefined,
            baseTime: undefined
        })
    })
    it('handle reset ', () => {
        expect(clockTimerReducer(undefined, reset_timer())).toEqual({
            startedAt: undefined,
            stoppedAt: undefined,
            baseTime: 0
        })
    })
    it('handle stop timer ', () => {
        let state = clockTimerReducer(undefined, stop_timer())
        expect(state).toMatchObject({
            startedAt: undefined,
            baseTime: undefined
        })
        expect(state.stoppedAt).toBeGreaterThan(1601029820223)
    })
    it('handle start timer ', () => {
        let state = clockTimerReducer(undefined, start_timer())
        expect(state).toMatchObject({
            stoppedAt: undefined,
            baseTime: 0
        })
        expect(state.startedAt).toBeGreaterThan(1601029820223)

    })
})