import React, { Component } from "react";
import "./App.css";
import AudioController  from "./componments/AudioController";
import { ClockController } from "./componments/clock/ClockController";
import { Footer } from "./componments/Footer";
import { Introduce } from "./componments/Introduce";
import { Navbar } from "./componments/Navbar";
import AddTodo from "./componments/todo/containers/AddTodo";
import VisibleOpLogList from "./componments/todo/containers/VisibleOpLogList";
import VisibleTodoList from "./componments/todo/containers/VisibleTodoList";
import TodoFilter from "./componments/todo/TodoFilter";
import OpFilter from "./componments/todo/OpFilter";
import {FormattedMessage} from "react-intl";
import ReactGA from 'react-ga';
ReactGA.initialize('UA-5311721-14', {testMode: process.env.NODE_ENV === 'test'});
ReactGA.pageview(window.location.pathname + window.location.search, undefined, "index");
interface AppProps {}

interface AppState {}

class App extends Component<AppProps, AppState> {
  componentDidMount() {
    setTimeout(()=>{
      let item = window.performance.getEntries().find(item => item.name === "first-contentful-paint");
      if (item){
        console.log('page load time', item.startTime)
        // http://localhost:8080
        fetch('https://api.ip.sb/geoip')
          .then(response => {
            if (!response.ok) {
              throw new Error("HTTP error " + response.status);
            }
            return response.json();
          })
          .then(json => {
            let label = json['isp'] +"-"+ json['region'] +"-"+ json['city']
            console.log("isp", label)
            if (item){
              ReactGA.timing({
                category:'page load',
                variable:'first-contentful-paint',
                value: item.startTime,
                label: label
              })
            }

          })
          .catch(function (e) {
            console.log(e)
          })

      }
    }, 10000)
  }

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
              <VisibleOpLogList />
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
