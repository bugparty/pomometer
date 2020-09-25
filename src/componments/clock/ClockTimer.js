import React, {Component} from 'react'
import {connect} from 'react-redux'
import {reset_timer} from './ClockTimerSlice'
// Helper function that takes store state
// and returns the current elapsed time
function getElapsedTime(baseTime, startedAt, stoppedAt = new Date().getTime()) {
    if (!startedAt) {
        return 0;
    } else {
        return stoppedAt - startedAt + baseTime;
    }
}

function getTimeRemaining(baseTime, startedAt, timeInterval, stoppedAt = new Date().getTime()) {
    return timeInterval - getElapsedTime(baseTime, startedAt, stoppedAt)
}

class ClockTimer extends Component {
    constructor(props) {
        super(props)
        // here, getTimeRemaining is a helper function that returns an
        // object with { total, seconds, minutes, hours, days }
        this.state = {timeLeft: getTimeRemaining(props.baseTime, props.startedAt, props.timeInterval, props.stoppedAt)}
        this.tick = this.tick.bind(this)
    }

    // Wait until the component has mounted to start the animation frame
    componentDidMount() {
        this.start()
    }

    // Clean up by cancelling any animation frame previously scheduled
    componentWillUnmount() {
        this.stop()
    }

    start() {
        this.frameId = requestAnimationFrame(this.tick)
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    tick() {
        const timeLeft = getTimeRemaining(this.props.baseTime, this.props.startedAt, this.props.timeInterval,
            this.props.stoppedAt)
        if (timeLeft.total <= 0) {
            this.stop()
            // dispatch any other actions to do on expiration
        } else {
            // dispatch anything that might need to be done on every tick
            this.setState(
                {timeLeft},
                () => this.frameId = requestAnimationFrame(this.tick)
            )
        }
    }

    render() {
        if (this.props.children) {
            return <div>{this.props.children}</div>
        } else {
            return <p>Need pass a child to me</p>
        }

    }
}

const mapStateToProps = (state, ownProps) => {
    console.log(state)
    return {
        baseTime: state.clockTimer.baseTime,
        startedAt: undefined,
        timeInterval: state.clock.timeInterval,
        stoppedAt: state.clockTimer.stoppedAt
    }
}

const mapDispatchToProps = dispatch => {
    return {
        reset_timer: dispatch(reset_timer())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClockTimer);