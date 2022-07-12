import React from "react";
import { isSafari } from "../util";
import {connect, ConnectedProps} from "react-redux";
import {ClockStatus, ClockMode} from "./clock/ClockSlice";
import {RootState} from "./store";
function mapStateToProps(state:RootState){
  return {
    enableTickingSound: state.clock.ticking_sound_enabled,
    enableRestTickingSound: state.clock.rest_ticking_sound_enabled,
    mode: state.clock.mode,
    status: state.clock.status,
  }
}
const connector = connect(mapStateToProps)
export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux
let isMounted = false;
class AudioController extends React.Component<Props,any> {
  constructor(props: Props | Readonly<Props>) {
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
      if (alarm instanceof HTMLAudioElement){
        alarm.play()
      }
    }
  }
  playTic() {

    if (
      (this.props.enableTickingSound && this.props.mode === ClockMode.POMODORO) ||
      (this.props.enableRestTickingSound && this.props.mode !== ClockMode.POMODORO)
    ) {
      console.log('playTic')
      const audioTicTac = document.getElementById("tictac");
      if (audioTicTac instanceof HTMLAudioElement){
        audioTicTac.play()
      }
    }
  }
  stopTic() {
    console.log('stopTic')
    const audioTicTac = document.getElementById("tictac");
    if (audioTicTac instanceof HTMLAudioElement){
      audioTicTac.pause()
    }
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
    let base_url
    if (process.env.PUBLIC_URL){
      base_url = process.env.PUBLIC_URL
    }else {
      base_url = ''
    }
    // @ts-ignore
    return (
      <div>
        <audio id="80alarm">
          <source
            src={base_url + this.state.alarm}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
        <audio id="tictac" loop={true}>
          <source
            src={base_url +  "/asserts/tictac.mp3"}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
}

export default connect(mapStateToProps)(AudioController)