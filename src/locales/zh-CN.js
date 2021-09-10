if (!Intl.PluralRules) {
  require("@formatjs/intl-pluralrules/polyfill");
  require("@formatjs/intl-pluralrules/locale-data/zh"); // Add locale data for de
}

if (!Intl.RelativeTimeFormat) {
  require("@formatjs/intl-relativetimeformat/polyfill");
  require("@formatjs/intl-relativetimeformat/locale-data/zh"); // Add locale data for de
}
const messages = {
  "settings.button.save" : "保存",
  "settings.field.long_break_duration" : "长休息时长",
  "clock.button.long" : "长休息",
  "todo.subtodo.delete" : "删除",
  "todo.default_subtodo" : "默认子todo",
  "settings.field.pomodoro_duration" : "番茄钟时长",
  "clock.button.short" : "短休息",
  "settings.field.short_break_duration" : "短休息时长",
  "clock.button.standard" : "标准番茄钟",
  "clock.button.reset" : "重置",
  "app.tab.logs" : "日志",
  "introduction.title" : "番茄工作法说明",
  "todo.subtodo.Focus" : "设置焦点",
  "todo_list.confirm_delete" : "确认删除吗",
  "navi.title" : "AA番茄钟",
  "settings.enableRestTickingSound" : "开启休息时钟滴答声音",
  "todo.add_todo" : "添加todo",
  "app.tab.todolist" : "Todo列表",
  "introduction.p1" : "番茄工作法（英语：Pomodoro Technique）是一种时间管理法方法，在1980年代由Francesco Cirillo创立。",
  "settings.button.reset" : "重置",
  "settings.enableTickingSound" : "开启时钟滴答声音",
  "introduction.p2" : "该方法使用一个定时器来分割出一个一般为25分钟的工作时间和5分钟的短休息时间，而那些时间段被称为pomodoros，每休息4个pomodoros,进行一个15-30分钟的长休息",
  "navi.settings" : "设置",
  "settings.title" : "设置"
};
const zh_CN = {
  locale: "zh-CN",
  messages: messages,
};

export default zh_CN;
