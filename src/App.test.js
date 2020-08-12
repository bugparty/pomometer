import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import en_US from "./locales/en-US"
import {IntlProvider, FormattedMessage, FormattedNumber} from 'react-intl';
import store from "./componments/store";
import {Provider} from 'react-redux'

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}>
    <IntlProvider locale={navigator.language}  messages={en_US.messages} defaultLocale="en-US">
      <App/>
    </IntlProvider>
  </Provider>, div);
  ReactDOM.unmountComponentAtNode(div);
});

