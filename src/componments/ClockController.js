import React from 'react';
import {Clock} from './Clock';
import {ClockButtons} from './ClockButtons';
import {formatSeconds} from "../util";

export class ClockController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {timeInterval: 25*60, timeLeft: 25*60, timer:null};
        this.timeBegin = this.timeBegin.bind(this);
        this.timeReset = this.timeReset.bind(this);
        this.setDuration = this.setDuration.bind(this);
        this.handleLong = this.handleLong.bind(this);
        this.handleLongReset = this.handleLongReset.bind(this);
        this.handleShortReset = this.handleShortReset.bind(this);
    }

    timeBegin() {
        let that = this;
        let timer = setInterval(()=> {
            if (that.state.timeLeft <= 0) {
                clearInterval(that.state.timer);
                that.setState({'timeLeft': 0});
                that.props.setEnd();
            } else {
                that.setState({'timeLeft': that.state.timeLeft-1});
            }

        }, 1000);
        this.setState({'timer':timer});
        this.props.setBegin()
    }

    setDuration(seconds) {
        clearInterval(this.state.timer);
        this.setState({'timeInterval': seconds, 'timeLeft': seconds});
    }

    timeReset() {
        clearInterval(this.state.timer);
        this.setState({'timeLeft': this.state.timeInterval});
        this.props.setReset()
    }

    handleLong() {
        this.setDuration(60*25);
        this.timeBegin();
    }
    handleLongReset() {
        this.setDuration(60*15);
        this.timeBegin();
    }

    handleShortReset() {
        this.setDuration(60*5);
        this.timeBegin();
    }
    render() {
        return (<div>
                <Clock time={formatSeconds(this.state.timeLeft)}/>
                <ClockButtons handleLong={this.handleLong} handleLongReset={this.handleLongReset} handleShortReset={this.handleShortReset}
                timeReset={this.timeReset}/>


            </div>
        )
    }
}
