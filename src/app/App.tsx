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
import GoogleTasksSyncInitializer from "./componments/todo/GoogleTasksSyncInitializer";
import Toast from "./componments/common/Toast";
import {FormattedMessage} from "react-intl";
import ReactGA from 'react-ga';
import { connect, ConnectedProps } from "react-redux";
import {RootState} from "./componments/rootReducer";
import { AppDispatch } from "./componments/store";
import { checkAuthStatus } from "./componments/auth/authSlice";
import en_US from "./locales/en-US";
import zh_CN from "./locales/zh-CN";
import de_DE from "./locales/de-DE";

// Initialize ReactGA only on client side
if (typeof window !== 'undefined') {
  ReactGA.initialize('UA-5311721-14', {testMode: process.env.NODE_ENV === 'test'});
  ReactGA.pageview(window.location.pathname + window.location.search, undefined, "index");
}

const mapStateToProps = (state: RootState) => ({
    language: state.clock.language,
});

const mapDispatchToProps = {
  checkAuthStatus
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppState {}

type Messages = {
    [key: string]: { [key: string]: string };
};

const messages: Messages = {
    "en-US": en_US.messages,
    "zh-CN": zh_CN.messages,
    "de-DE": de_DE.messages,
};

class App extends Component<PropsFromRedux, AppState> {
  
  componentDidMount() {
    // Check login status
    if (typeof window !== 'undefined') {
      this.props.checkAuthStatus();
    }
  }

  render() {
    return (
      <div className="App min-h-screen">
        <div className="AppWrapper min-h-full flex flex-col">
          <Navbar/>
          <div className="flex flex-col lg:flex-row flex-1">
            <div className="TodoContainer w-full lg:w-1/4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  <FormattedMessage id="app.tab.todolist" defaultMessage="Todo list"/>
                </h2>
               
              </div>
              <AddTodo />
              <TodoFilter />
              <VisibleTodoList />
            </div>
            <div className="flex flex-col mt-4">
              <ClockController/>
              <Introduce />
            </div>
            <div className="OpLogContainer w-full lg:w-1/4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 mx-2"><FormattedMessage id="app.tab.logs" defaultMessage="Logs"/></h2>
              <OpFilter />
              <VisibleOpLogList />
            </div>
          </div>
           <Footer/>
          <AudioController/>
          <GoogleTasksSyncInitializer />
          <Toast />
        </div>
       
      </div>
    );
  }
}

export default connector(App);
