import React from 'react';
import {isSafari} from "../util";

let isMounted = false;
export class AudioController extends React.Component{

    constructor(props) {
        super(props);
        this.playAlarm = this.playAlarm.bind(this);
        this.playTic = this.playTic.bind(this);
        this.stopTic = this.stopTic.bind(this);
        this.state = {
            alarm:"/asserts/80sAlarm.mp3"
        }
    }
    playAlarm() {

        if (false && isSafari) {
            let audio = new Audio(this.state.alarm);
            audio.load();
            audio.play();
        } else {
            let alarm = document.getElementById('80alarm');
            alarm.play();
        }

    }
    playTic() {
        debugger;
        if( (this.props.enableTickingSound && this.props.mode ==="pomodoro")
            || (this.props.enableRestTickingSound && this.props.mode !== "pomodoro")){
            const  audioTicTac = document.getElementById('tictac');
            audioTicTac.play();
        }

    }
    stopTic() {
        const  audioTicTac = document.getElementById('tictac');
        audioTicTac.pause();

    }
    componentDidMount() {
        isMounted= true;

    }
    render() {
        if (isMounted){
            if(!this.props.enableTickingSound){
                this.stopTic();
            }
            switch (this.props.status) {
                case 'reset':
                    this.stopTic();
                    break;
                case 'begin':
                    this.playTic();
                    break;
                case 'end':
                    this.stopTic();
                    this.playAlarm();
                    break;
                default:
                    break;
            }
        }
        return (
            <div>
                <audio id="80alarm"><source src={this.state.alarm} preload="auto" type="audio/mpeg"/>
                    Your browser does not support the audio element.
                </audio>
                <audio id="tictac" loop={true}><source src="/asserts/tictac.mp3" preload="auto" type="audio/mpeg"/>
                    Your browser does not support the audio element.
                </audio>
            </div>
        )
    }
}

