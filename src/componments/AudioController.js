import React from "react";
import { isSafari } from "../util";
import {connect} from "react-redux";
import {ClockStatus, ClockMode} from "./clock/ClockSlice";

let isMounted = false;
class AudioController extends React.Component {
  constructor(props) {
    super(props);
    this.playAlarm = this.playAlarm.bind(this);
    this.playTic = this.playTic.bind(this);
    this.stopTic = this.stopTic.bind(this);
    this.state = {
      alarm: "/asserts/80sAlarm.mp3",
    };
  }
  playAlarm() {
    if (false && isSafari) {
      let audio = new Audio(this.state.alarm);
      audio.load();
      audio.play();
    } else {
      let alarm = document.getElementById("80alarm");
      alarm.play();
    }
  }
  playTic() {
    if (
      (this.props.enableTickingSound && this.props.mode === ClockMode.POMODORO) ||
      (this.props.enableRestTickingSound && this.props.mode !== ClockMode.POMODORO)
    ) {
      const audioTicTac = document.getElementById("tictac");
      audioTicTac.play();
    }
  }
  stopTic() {
    const audioTicTac = document.getElementById("tictac");
    audioTicTac.pause();
  }
  componentDidMount() {
    isMounted = true;
  }
  render() {
    if (isMounted) {
      if (
        !this.props.enableTickingSound ||
        !this.props.enableRestTickingSound
      ) {
        this.stopTic();
      }
      switch (this.props.status) {
        case ClockStatus.RESET:
          this.stopTic();
          break;
        case ClockStatus.COUNTING_DOWN:
          this.playTic();
          break;
        case ClockStatus.COUNTING_ENDED:
          this.stopTic();
          this.playAlarm();
          break;
        default:
          break;
      }
    }
    return (
      <div>
        <audio id="80alarm">
          <source
            src={process.env.PUBLIC_URL + this.state.alarm}
            preload="auto"
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
        <audio id="tictac" loop={true}>
          <source
            src={process.env.PUBLIC_URL + "/asserts/tictac.mp3"}
            preload="auto"
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
}
function mapStateToProps(state){
  return {
    enableTickingSound: state.clock.ticking_sound_enabled,
    enableRestTickingSound: state.clock.rest_ticking_sound_enabled,
    mode: state.clock.mode,
    status: state.clock.status,
  }
}
export default connect(mapStateToProps)(AudioController)