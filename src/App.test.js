import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import en_US from "./locales/en-US";
import { IntlProvider } from "react-intl";
import store from "./componments/store";
import { Provider } from "react-redux";
beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
});
it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
      <Provider store={store}>
          <IntlProvider locale={navigator.language} messages={en_US.messages}>
              <App />
          </IntlProvider>
      </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
