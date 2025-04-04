import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import en_US from "./locales/en-US";
import { IntlProvider } from "react-intl";
import store from "./componments/store";
import { Provider } from "react-redux";
import {mockMatchMedia} from "./setupTests";

beforeEach(() => {
    mockMatchMedia()
});
it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
      <Provider store={store}>
          <App />
      </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
