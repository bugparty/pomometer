if (!Intl.PluralRules) {
    require('@formatjs/intl-pluralrules/polyfill');
    require('@formatjs/intl-pluralrules/locale-data/en'); // Add locale data for de
}

if (!Intl.RelativeTimeFormat) {
    require('@formatjs/intl-relativetimeformat/polyfill');
    require('@formatjs/intl-relativetimeformat/locale-data/en'); // Add locale data for de
}
const messages = {
    'clock.button.standard': "Pomodoro", //键值在组件进行国际化时对应的就是id,具体见组件如何使用
    'clock.button.long': 'Long Rst',
    'clock.button.short': 'Short Rst',
    'clock.button.reset': 'Reset',
    'navi.title': 'AA Tomato O\'Clock'
}
const en_US = {
    locale: 'en-US',
    messages:messages
};

export default en_US;
