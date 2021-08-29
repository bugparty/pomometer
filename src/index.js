import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import en_US from "./locales/en-US";
import zh_CN from "./locales/zh-CN";
import { IntlProvider } from "react-intl";
import store from "./componments/store";
import { Provider } from "react-redux";
// redux

console.log(store);
//intl
export function getMessages() {
  switch (navigator.language.split("-")[0]) {
    case "en":
      return en_US.messages;
    case "zh":
      return zh_CN.messages;
    default:
      return en_US.messages;
  }
}

const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrate(
    <IntlProvider
      locale={navigator.language}
      defaultLocale="en"
      messages={getMessages()}
    >
      <App />
    </IntlProvider>,
    rootElement
  );
} else {
  ReactDOM.render(
    <Provider store={store}>
      <IntlProvider locale={navigator.language} messages={getMessages()}>
        <App />
      </IntlProvider>
    </Provider>,
    rootElement
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
