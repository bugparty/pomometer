import React, { Component } from "react";
import { connect } from "react-redux";
import { reset_timer,stop_timer, ClockStatus, set_stopped_at } from "./ClockSlice";
import { Clock } from "./Clock";
// Helper function that takes store state
// and returns the current elapsed time
function getElapsedTime(baseTime, startedAt, stoppedAt = new Date().getTime()) {
  if (!startedAt) {
    return 0;
  } else {
    return stoppedAt - startedAt + baseTime;
  }
}

function getTimeRemaining(
  baseTime,
  startedAt,
  timeInterval,
  stoppedAt = new Date().getTime()
) {
  let elapsed = getElapsedTime(baseTime, startedAt, stoppedAt);
  return timeInterval - elapsed;
}

class ClockTimer extends Component {
  constructor(props) {
    super(props);
    // here, getTimeRemaining is a helper function that returns an
    // object with { total, seconds, minutes, hours, days }
    this.state = {
      timeLeft: getTimeRemaining(
        props.baseTime,
        props.startedAt,
        props.timeInterval,
        props.stoppedAt
      ),
    };
    this.tick = this.tick.bind(this);
  }

  // Wait until the component has mounted to start the animation frame
  componentDidMount() {
    this.start();
  }

  // Clean up by cancelling any animation frame previously scheduled
  componentWillUnmount() {
    this.stop();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.clockState !== this.props.clockState) {
      console.log("start");
      this.start();
    }
  }

  start() {
    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  tick() {
    //console.log(this.props.clockState)
    if (this.props.clockState === ClockStatus.COUNTING_DOWN) {
      const timeLeft = getTimeRemaining(
        this.props.baseTime,
        this.props.startedAt,
        this.props.timeInterval
      );
      //debugger
      if (parseInt(timeLeft / 1000) < parseInt(this.state.timeLeft / 1000)) {
        //console.log('update stopeed_at', timeLeft)
        this.props.set_stopped_at(new Date().getTime());
      }
      if (timeLeft <= 0) {
        this.stop();
        this.props.stop_timer();
        // dispatch any other actions to do on expiration
      } else {
        // dispatch anything that might need to be done on every tick
        this.setState(
          { timeLeft },
          () => (this.frameId = requestAnimationFrame(this.tick))
        );
      }
    } else if (this.props.clockState === ClockStatus.RESET) {
      this.setState({ timeLeft: this.props.timeInterval });
    }
  }

  render() {
    return <Clock time={this.state.timeLeft} />;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    baseTime: state.clock.baseTime,
    startedAt: state.clock.startedAt,
    timeInterval: state.clock.timeInterval * 1000,
    stoppedAt: state.clock.stoppedAt,
    clockState: state.clock.status,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    reset_timer: () => dispatch(reset_timer()),
    set_stopped_at: (time) => dispatch(set_stopped_at(time)),
    stop_timer: () => dispatch(stop_timer()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClockTimer);
