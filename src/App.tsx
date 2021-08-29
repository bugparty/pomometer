import React, { Component } from "react";
import "./App.css";
import { AudioController } from "./componments/AudioController";
import { ClockController } from "./componments/clock/ClockController";
import { Footer } from "./componments/Footer";
import { Introduce } from "./componments/Introduce";
import { Navbar } from "./componments/Navbar";
import AddTodo from "./componments/todo/containers/AddTodo";
import OpLogList from "./componments/todo/containers/OpLogList";
import VisibleTodoList from "./componments/todo/containers/VisibleTodoList";
import TodoFooter from "./componments/todo/TodoFooter";

type AppMode = "pomodoro" | "longRest" | "shortRest";

interface Options {
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
}

interface AppProps {}

interface AppState extends Options {
  status: "reset" | "begin" | "end";
  mode: AppMode;
  enableTickingSound: boolean;
  enableRestTickingSound: boolean;
}

const isExist = (key: string) => {
  return localStorage.getItem(key) !== null;
};

class App extends Component<AppProps, AppState> {
  constructor(props: any) {
    super(props);

    const tickingSound = isExist("enableTickingSound") || true;
    const restTickingSound = isExist("enableRestTickingSound") || false;

    this.state = {
      status: "reset",
      mode: "pomodoro",
      enableTickingSound: tickingSound,
      enableRestTickingSound: restTickingSound,
      pomodoro_duration: 25 * 60,
      short_break_duration: 5 * 60,
      long_break_duration: 15 * 60,
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
    this.setState({ status: "begin" });
  }

  setEnd() {
    this.setState({ status: "end" });
  }

  setReset() {
    this.setState({ status: "reset" });
  }

  setMode(mode: AppMode) {
    this.setState({ mode: mode });
  }

  setTickingSound(isEnable: boolean) {
    this.setState({ enableTickingSound: isEnable }, () => {
      localStorage.setItem("enableTickingSound", isEnable.toString());
    });
  }

  setRestTickingSound(isEnable: boolean) {
    this.setState({ enableRestTickingSound: isEnable }, () => {
      localStorage.setItem("enableRestTickingSound", isEnable.toString());
    });
  }

  saveOptions(options: Options) {
    this.setState(options);
  }

  render() {
    return (
      <div className="App">
        <div className="AppWrapper">
          <Navbar
            enableTickingSound={this.state.enableTickingSound}
            enableRestTickingSound={this.state.enableRestTickingSound}
            setTickingSound={this.setTickingSound}
            setRestTickingSound={this.setRestTickingSound}
            pomodoro_duration={this.state.pomodoro_duration}
            short_break_duration={this.state.short_break_duration}
            long_break_duration={this.state.long_break_duration}
            saveOptions={this.saveOptions}
          />
          <div className="columns">
            <div className="TodoContainer column is-one-quarter">
              <h2 className="h2">Todo list</h2>
              {/* @ts-expect-error */}
              <AddTodo />
              <TodoFooter />
              <VisibleTodoList />
            </div>
            <div className="ClockContainer column">
              <ClockController
                setBegin={this.setBegin}
                setEnd={this.setEnd}
                setReset={this.setReset}
                pomodoro_duration={this.state.pomodoro_duration}
                short_break_duration={this.state.short_break_duration}
                long_break_duration={this.state.long_break_duration}
                setMode={this.setMode}
              />
              <Introduce />
            </div>
            <div className="OpLogContainer column is-one-quarter">
              <h2 className="h2">Logs</h2>
              <OpLogList />
            </div>
          </div>

          <AudioController
            status={this.state.status}
            mode={this.state.mode}
            enableTickingSound={this.state.enableTickingSound}
            enableRestTickingSound={this.state.enableRestTickingSound}
          />
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
