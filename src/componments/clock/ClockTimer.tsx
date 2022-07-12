import React, { Component } from "react";
import {Dispatch} from "redux";
import {connect, ConnectedProps} from "react-redux";
import { reset_timer,stop_timer, ClockStatus, set_stopped_at } from "./ClockSlice";
import { Clock } from "./Clock";
import {RootState} from "../store";

// Helper function that takes store state
// and returns the current elapsed time
function getElapsedTime(baseTime:number|undefined, startedAt:number|undefined, stoppedAt = new Date().getTime()) {
  if (!startedAt) {
    return 0;
  } else {
    if (baseTime === undefined){
      console.log("basetime undefined")
      return startedAt - startedAt
    }else return stoppedAt - startedAt + baseTime;
  }
}

function getTimeRemaining(
  baseTime:number|undefined,
  startedAt:number|undefined,
  timeInterval:number,
  stoppedAt = new Date().getTime()
) {
  let elapsed = getElapsedTime(baseTime, startedAt, stoppedAt);
  let timeLeft = timeInterval - elapsed
  return timeLeft > 0 ? timeLeft : 0;
}
interface RootProps {}
const mapStateToProps = (state:RootState, ownProps: RootProps) => {
  return {
    baseTime: state.clock.baseTime,
    startedAt: state.clock.startedAt,
    timeInterval: state.clock.timeInterval * 1000,
    stoppedAt: state.clock.stoppedAt,
    clockState: state.clock.status,
  };
};

const mapDispatchToProps = (dispatch:Dispatch, ownProps: RootProps) => {
  return {
    reset_timer: () => dispatch(reset_timer()),
    set_stopped_at: (time:number) => dispatch(set_stopped_at(time)),
    stop_timer: () => dispatch(stop_timer()),
  };
};
const connector = connect(mapStateToProps, mapDispatchToProps)
export type PropsFromRedux = ConnectedProps<typeof connector>
interface ClockTimerProps{

}
interface  ClockTimerState{
  timeLeft: number,
  stoppedAt: number|undefined,

}
type MyProps = PropsFromRedux & ClockTimerProps
class ClockTimer extends Component<MyProps,ClockTimerState> {
  private frameId: number| undefined;
  constructor(props: MyProps | Readonly<MyProps>) {
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
      stoppedAt: props.stoppedAt,
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

  componentDidUpdate(prevProps:Readonly<MyProps>, prevState:Readonly<ClockTimerState>, snapshot?: any) {
    if (prevProps.clockState !== this.props.clockState) {
      console.log("clock timer start");
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
    if (this.frameId !== undefined){
      cancelAnimationFrame(this.frameId);
    }
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
      if (timeLeft <= 0) {
        //this.stop();
        this.props.stop_timer();
        this.setState({ timeLeft: 0 });
        this.stop();
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
    let timeLeft = getTimeRemaining(
        this.props.baseTime,
        this.props.startedAt,
        this.props.timeInterval
    );
    if (this.props.clockState === ClockStatus.RESET) {
      timeLeft = this.props.timeInterval
    }
    return <Clock time={timeLeft} />;
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(ClockTimer);
