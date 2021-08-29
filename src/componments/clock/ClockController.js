import React from "react";
import { Clock } from "./Clock";
import ClockButtons from "./ClockButtons2";
import ClockTimer from "./ClockTimer";

export class ClockController extends React.Component {
  constructor(props) {
    super(props);
    this.state = { timeInterval: 25 * 60, timeLeft: 25 * 60, timer: null };
    this.timeBegin = this.timeBegin.bind(this);
    this.timeReset = this.timeReset.bind(this);
    this.setDuration = this.setDuration.bind(this);
    this.handleLong = this.handleLong.bind(this);
    this.handleLongReset = this.handleLongReset.bind(this);
    this.handleShortReset = this.handleShortReset.bind(this);
  }

  timeBegin() {
    let that = this;
    let timer = setInterval(() => {
      if (that.state.timeLeft <= 0) {
        clearInterval(that.state.timer);
        that.setState({ timeLeft: 0 });
        that.props.setEnd();
      } else {
        that.setState({ timeLeft: that.state.timeLeft - 1 });
      }
    }, 1000);
    this.setState({ timer: timer });
    this.props.setBegin();
  }

  setDuration(seconds) {
    clearInterval(this.state.timer);
    this.setState({ timeInterval: seconds, timeLeft: seconds });
  }

  timeReset() {
    clearInterval(this.state.timer);
    this.setState({ timeLeft: this.state.timeInterval });
    this.props.setReset();
  }

  handleLong() {
    this.props.setMode("pomodoro");
    this.setDuration(this.props.pomodoro_duration);
    this.timeBegin();
  }
  handleLongReset() {
    this.props.setMode("longRest");
    this.setDuration(this.props.long_break_duration);
    this.timeBegin();
  }

  handleShortReset() {
    this.props.setMode("shortRest");
    this.setDuration(this.props.short_break_duration);
    this.timeBegin();
  }
  render() {
    return (
      <div>
        <ClockTimer>
          <Clock />
        </ClockTimer>
        <ClockButtons />
      </div>
    );
  }
}
