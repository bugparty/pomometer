if (!Intl.PluralRules) {
  require("@formatjs/intl-pluralrules/polyfill");
  require("@formatjs/intl-pluralrules/locale-data/zh"); // Add locale data for de
}

if (!Intl.RelativeTimeFormat) {
  require("@formatjs/intl-relativetimeformat/polyfill");
  require("@formatjs/intl-relativetimeformat/locale-data/zh"); // Add locale data for de
}
const messages = {
  "clock.button.standard": "标准番茄钟", //键值在组件进行国际化时对应的就是id,具体见组件如何使用
  "clock.button.long": "长休息",
  "clock.button.short": "短休息",
  "clock.button.reset": "重置",
  "navi.title": "AA番茄钟",
  "navi.settings": "设置",
  "settings.title": "设置",
  "settings.enableTickingSound": "开启时钟滴答声音",
  "settings.enableRestTickingSound": "开启休息时钟滴答声音",
  "settings.button.save": "保存",
  "settings.button.reset": "重置",
  "settings.field.pomodoro_duration": "番茄钟时长",
  "settings.field.short_break_duration": "短休息时长",
  "settings.field.long_break_duration": "长休息时长",
  "introduction.title": "番茄工作法说明",
  "introduction.p1":
    "番茄工作法（英语：Pomodoro Technique）是一种时间管理法方法，在1980年代由Francesco Cirillo创立。",
  "introduction.p2":
    "该方法使用一个定时器来分割出一个一般为25分钟的工作时间和5分钟的短休息时间，而那些时间段被称为pomodoros，每休息4个pomodoros,进行一个15-30分钟的长休息",
};
const zh_CN = {
  locale: "zh-CN",
  messages: messages,
};

export default zh_CN;
