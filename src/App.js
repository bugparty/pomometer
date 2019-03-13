import React, {Component} from 'react';
import './App.css';
import {Navbar} from './componments/Navbar';
import {ClockController} from './componments/ClockController';
import {AudioController} from "./componments/AudioController";
import {Footer} from './componments/Footer';


class App extends Component {
    constructor(props) {
        super(props);
        let tickingSound = localStorage.getItem('enableTickingSound');
        if (tickingSound == null){
            tickingSound = true;
        }
        this.state = {'status': 'reset', 'enableTickingSound': tickingSound};
        this.setBegin = this.setBegin.bind(this);
        this.setEnd = this.setEnd.bind(this);
        this.setReset = this.setReset.bind(this);
        this.setTickingSound = this.setTickingSound.bind(this);
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

    render() {
        return (
            <div className="App">
                <Navbar enableTickingSound={this.state.enableTickingSound} setTickingSound={this.setTickingSound}/>


                <ClockController setBegin={this.setBegin} setEnd={this.setEnd} setReset={this.setReset}/>
                <article className="section">
                    <h2 >番茄工作法说明</h2>
                    <p>111</p><wbr/>
                    <p>2222</p>
                </article>
                <Footer/>
                <AudioController status={this.state.status}/>

            </div>
        );
    }
}

export default App;
