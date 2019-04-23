import appLocaleData from 'react-intl/locale-data/en';
const messages = {
    'clock.button.standard': "Pomodoro", //键值在组件进行国际化时对应的就是id,具体见组件如何使用
    'clock.button.long': 'Long Rst',
    'clock.button.short': 'Short Rst',
    'clock.button.reset': 'Reset'
}
const en_US = {
    locale: 'en-US',
    data: appLocaleData,
    messages:messages
};

export default en_US;
