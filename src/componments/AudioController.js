import React from 'react';
let isMounted = false;
export class AudioController extends React.Component{

    constructor(props) {
        super(props);
        this.playAlarm = this.playAlarm.bind(this);
        this.playTic = this.playTic.bind(this);
        this.stopTic = this.stopTic.bind(this);
    }
    playAlarm() {
        let alarm = document.getElementById('80alarm');
        alarm.play();
    }
    playTic() {
        if( (this.props.enableTickingSound && this.mode ==="pomodoro")
            || (this.props.enableRestTickingSound && this.mode !== "pomodoro")){
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
                <audio id="80alarm"><source src="/asserts/80sAlarm.mp3" preload="auto" type="audio/mpeg"/>
                    Your browser does not support the audio element.
                </audio>
                <audio id="tictac" loop={true}><source src="/asserts/tictac.mp3" preload="auto" type="audio/mpeg"/>
                    Your browser does not support the audio element.
                </audio>
            </div>
        )
    }
}

