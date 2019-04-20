import appLocaleData from "react-intl/locale-data/zh";

const messages = {
    'clock.button.standard': "标准番茄钟", //键值在组件进行国际化时对应的就是id,具体见组件如何使用
    'clock.button.long': '长休息',
    'clock.button.short': '短休息',
    'clock.button.reset': '重置',
    'navi.title': 'AA番茄钟',
    'navi.settings': '设置'
}
const zh_CN = {
    locale: 'zh-CN',
    data: appLocaleData,
    messages: messages
};

export default zh_CN;

