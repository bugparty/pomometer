import React, { Component } from "react";
import "./App.css";
import AudioController  from "./componments/AudioController";
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

  }
  render() {
    return (
      <div className="App">
        <div className="AppWrapper">
          <Navbar/>
          <div className="columns">
            <div className="TodoContainer column is-one-quarter">
              <h2 className="h2">Todo list</h2>
              {/* @ts-expect-error */}
              <AddTodo />
              <TodoFooter />
              <VisibleTodoList />
            </div>
            <div className="ClockContainer column">
              <ClockController/>
              <Introduce />
            </div>
            <div className="OpLogContainer column is-one-quarter">
              <h2 className="h2">Logs</h2>
              <OpLogList />
            </div>
          </div>

          <AudioController/>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
