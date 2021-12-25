if (!Intl.PluralRules) {
  require("@formatjs/intl-pluralrules/polyfill");
  require("@formatjs/intl-pluralrules/locale-data/zh"); // Add locale data for de
}

if (!Intl.RelativeTimeFormat) {
  require("@formatjs/intl-relativetimeformat/polyfill");
  require("@formatjs/intl-relativetimeformat/locale-data/zh"); // Add locale data for de
}
const messages = {
  "oplog.focus_subtodo" : "从todo: {todo}设置焦点在子任务:{subtodo}",
  "oplog.focus_todo" : "设置焦点在todo: {todo}",
  "oplog.filter.today":"今天",
  "oplog.filter.this_week":"本周",
  "oplog.filter.all":"所有",
  "oplog.filter.show":"过滤器:",
  "settings.field.long_break_duration" : "长休息时长",
  "settings.field.pomodoro_duration" : "番茄钟时长",
  "todo.filter.show" : "显示：",
  "app.tab.logs" : "日志",
  "introduction.title" : "番茄工作法说明",
  "todo.filter.all" : "所有",
  "todo.add_subtask" : "添加子任务",
  "oplog.add_subtodo" : "从todo:{todo}添加子任务:{subtodo}",
  "todo_list.confirm_delete" : "确认删除吗",
  "navi.title" : "AA番茄钟",
  "oplog.start_op_without_duration" : "在 {date} 开始 {op}",
  "introduction.p1" : "番茄工作法（英语：Pomodoro Technique）是一种时间管理法方法，在1980年代由Francesco Cirillo创立。",
  "settings.enableTickingSound" : "开启时钟滴答声音",
  "introduction.p2" : "该方法使用一个定时器来分割出一个一般为25分钟的工作时间和5分钟的短休息时间，而那些时间段被称为pomodoros，每休息4个pomodoros,进行一个15-30分钟的长休息",
  "navi.settings" : "设置",
  "settings.title" : "设置",
  "settings.button.save" : "保存",
  "todo.filter.completed" : "已完成",
  "clock.button.long" : "长休息",
  "todo.subtodo.delete" : "删除",
  "oplog.add_todo" : "添加todo {todo}",
  "oplog.toggle_subtodo" : "完成todo: {todo}的子任务:{subtodo}",
  "todo.default_subtodo" : "默认子todo",
  "clock.button.short" : "短休息",
  "settings.field.short_break_duration" : "短休息时长",
  "clock.button.standard" : "标准番茄钟",
  "clock.button.reset" : "重置",
  "todo.subtodo.Focus" : "设置焦点",
  "todo.filter.active" : "活动",
  "settings.enableRestTickingSound" : "开启休息时钟滴答声音",
  "todo.add_todo" : "添加todo",
  "oplog.start_op_with_duration" : "在 {date} 开始 {op} ,时长 {duration}",
  "oplog.toggle_todo" : "完成todo: {todo}",
  "oplog.delete_todo" : '删除 todo: {todo}',
  "app.tab.todolist" : "Todo列表",
  "settings.button.reset" : "重置"
};
const zh_CN = {
  locale: "zh-CN",
  messages: messages,
};

export default zh_CN;
