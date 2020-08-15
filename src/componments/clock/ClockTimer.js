import React, {Component} from 'react'
import {connect} from 'react-redux'
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
        return this.props.children(this.state);
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        active: ownProps.filter === state.visibilityFilter
    }
}

const mapDispatchToProps = dispatch => (dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ClockTimer);