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
import TodoFilter from "./componments/todo/TodoFilter";
import OpFilter from "./componments/todo/OpFilter";
import {FormattedMessage} from "react-intl";

interface AppProps {}

interface AppState {}

class App extends Component<AppProps, AppState> {
  render() {
    return (
      <div className="App">
        <div className="AppWrapper">
          <Navbar/>
          <div className="columns">
            <div className="TodoContainer column is-one-quarter">
              <h2 className="h2"><FormattedMessage id="app.tab.todolist" defaultMessage="Todo list"/> </h2>
              {/* @ts-expect-error */}
              <AddTodo />
              <TodoFilter />
              <VisibleTodoList />
            </div>
            <div className="ClockContainer column">
              <ClockController/>
              <Introduce />
            </div>
            <div className="OpLogContainer column is-one-quarter">
              <h2 className="h2"><FormattedMessage id="app.tab.logs" defaultMessage="Logs"/></h2>
              <OpFilter />
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
