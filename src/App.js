import React, {Component} from 'react';
import './App.css';
import {Navbar} from './componments/Navbar';
import {ClockController} from './componments/ClockController';
import {AudioController} from "./componments/AudioController";
import {Footer} from './componments/Footer';
import {Introduce} from "./componments/Introduce";

class App extends Component {
    constructor(props) {
        super(props);
        let tickingSound = localStorage.getItem('enableTickingSound');
        if (tickingSound == null){
            tickingSound = true;
        }
        this.state = {'status': 'reset', 'enableTickingSound': tickingSound,
        'pomodoro_duration': 25*60, 'short_break_duration': 5*60, 'long_break_duration': 15*60};
        this.setBegin = this.setBegin.bind(this);
        this.setEnd = this.setEnd.bind(this);
        this.setReset = this.setReset.bind(this);
        this.setTickingSound = this.setTickingSound.bind(this);
        this.resetDefault = this.resetDefault.bind(this);
    }
    setBegin() {
        this.setState({'status': 'begin'})
    }

    setEnd() {
        this.setState({'status': 'end'})
    }
    setReset() {
        this.setState({'status': 'reset'})
    }
    setTickingSound(isEnable) {
        localStorage.setItem('enableTickingSound', isEnable);
        this.setState({'enableTickingSound':isEnable});
    }
    resetDefault() {
        this.setState({'pomodoro_duration': 25*60, 'short_break_duration': 5*60, 'long_break_duration': 15*60,
        'enableTickingSound': true});
    }

    render() {
        return (
            <div className="App">
            <div className="AppWrapper">
                <Navbar enableTickingSound={this.state.enableTickingSound} setTickingSound={this.setTickingSound}
                   pomodoro_duration={this.state.pomodoro_duration} short_break_duration={this.state.short_break_duration}
                 long_break_duration={this.state.long_break_duration}/>


                <ClockController setBegin={this.setBegin} setEnd={this.setEnd} setReset={this.setReset} />
                <Introduce/>

                <AudioController status={this.state.status} enableTickingSound={this.state.enableTickingSound}/>

            </div>
                <Footer/>
            </div>
        );
    }
}

export default App;
