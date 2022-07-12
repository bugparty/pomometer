import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import en_US from "./locales/en-US";
import zh_CN from "./locales/zh-CN";
import de_DE from "./locales/de-DE";
import { IntlProvider } from "react-intl";
import store from "./componments/store";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://a2a8db40e6b34807ad64804b47e1ceed@o157982.ingest.sentry.io/6557759",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
//intl
export function getMessages() {
  switch (navigator.language.split("-")[0]) {
    case "en":
      return en_US.messages;
    case "zh":
      return zh_CN.messages;
    case "de":
      return de_DE.messages;
    default:
      return en_US.messages;
  }
}

const rootElement = document.getElementById("root");
if (rootElement instanceof HTMLElement)
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
