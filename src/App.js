import React, {Component} from 'react';
import './App.css';
import {Navbar} from './componments/Navbar';
import {ClockController} from './componments/clock/ClockController';
import {AudioController} from "./componments/AudioController";
import {Footer} from './componments/Footer';
import {Introduce} from "./componments/Introduce";
import AddTodo from "./componments/todo/containers/AddTodo";
import VisibleTodoList from "./componments/todo/containers/VisibleTodoList";
import TodoFooter from "./componments/todo/TodoFooter";

class App extends Component {
    constructor(props) {
        super(props);
        let tickingSound = localStorage.getItem('enableTickingSound');
        if (tickingSound == null) {
            tickingSound = true;
        }
        let restTickingSound = localStorage.getItem('enableRestTickingSound');
        if (restTickingSound == null) {
            restTickingSound = false;
        }
        this.state = {
            status: 'reset',
            mode: 'pomodoro',
            enableTickingSound: tickingSound,
            enableRestTickingSound: restTickingSound,
            pomodoro_duration: 25 * 60, short_break_duration: 5 * 60, long_break_duration: 15 * 60
        };
        this.setBegin = this.setBegin.bind(this);
        this.setEnd = this.setEnd.bind(this);
        this.setReset = this.setReset.bind(this);
        this.setTickingSound = this.setTickingSound.bind(this);
        this.saveOptions = this.saveOptions.bind(this);
        this.setRestTickingSound = this.setRestTickingSound.bind(this);
        this.setMode = this.setMode.bind(this);
    }

    setBegin() {
        this.setState({status: 'begin'})
    }

    setEnd() {
        this.setState({status: 'end'})
    }

    setReset() {
        this.setState({status: 'reset'})
    }

    setMode(mode) {
        this.setState({mode: mode})
    }

    setTickingSound(isEnable) {
        localStorage.setItem('enableTickingSound', isEnable);
        this.setState({'enableTickingSound': isEnable});
    }
    setRestTickingSound(isEnable) {
        localStorage.setItem('enableRestTickingSound', isEnable);
        this.setState({'enableRestTickingSound': isEnable});
    }

    saveOptions(options) {
        this.setState(options);
    }

    render() {
        return (

            <div className="App">
                <div className="AppWrapper">
                    <Navbar enableTickingSound={this.state.enableTickingSound}
                            enableRestTickingSound={this.state.enableRestTickingSound}
                            setTickingSound={this.setTickingSound} setRestTickingSound={this.setRestTickingSound}
                            pomodoro_duration={this.state.pomodoro_duration}
                            short_break_duration={this.state.short_break_duration}
                            long_break_duration={this.state.long_break_duration} saveOptions={this.saveOptions}/>
                    <div className="columns">
                        <div className="TodoContainer column is-one-fifth">
                            <h2 className="h2">Todo list</h2>
                            <AddTodo/>
                            <VisibleTodoList/>
                            <TodoFooter/>
                        </div>
                        <div className="ClockContainer column">
                            <ClockController setBegin={this.setBegin} setEnd={this.setEnd} setReset={this.setReset}
                                             pomodoro_duration={this.state.pomodoro_duration}
                                             short_break_duration={this.state.short_break_duration}
                                             long_break_duration={this.state.long_break_duration}
                                             setMode={this.setMode}
                            />
                            <Introduce/>
                        </div>
                    </div>

                    <AudioController status={this.state.status} mode={this.state.mode}
                                     enableTickingSound={this.state.enableTickingSound}
                                     enableRestTickingSound={this.state.enableRestTickingSound}/>

                </div>
                <Footer/>
            </div>
        );
    }
}

export default App;
