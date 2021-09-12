if (!Intl.PluralRules) {
  require("@formatjs/intl-pluralrules/polyfill");
  require("@formatjs/intl-pluralrules/locale-data/en"); // Add locale data for de
}

if (!Intl.RelativeTimeFormat) {
  require("@formatjs/intl-relativetimeformat/polyfill");
  require("@formatjs/intl-relativetimeformat/locale-data/en"); // Add locale data for de
}
const messages = {
  "settings.button.save" : "Save",
  "settings.field.long_break_duration" : "long break duration",
  "clock.button.long" : "Long Rst",
  "todo.subtodo.delete" : "Delete",
  "todo.default_subtodo" : "default subtask",
  "settings.field.pomodoro_duration" : "Pomodoro duration",
  "clock.button.short" : "Short Rst",
  "settings.field.short_break_duration" : "short break duration",
  "clock.button.standard" : "Pomodoro",
  "clock.button.reset" : "Reset",
  "app.tab.logs" : "Logs",
  "introduction.title" : "Introduction of Pomodoro",
  "todo.subtodo.Focus" : "Focus",
  "todo_list.confirm_delete" : "Confirm Delete",
  "navi.title" : "AA Pomodoro Clock",
  "settings.enableRestTickingSound" : "enable ticking sound when resting",
  "todo.add_todo" : "Add Todo",
  "app.tab.todolist" : "Todo List",
  "introduction.p1" : "The Pomodoro Technique is a time management method that was founded in the 1980s by Francesco Cirillo.",
  "settings.button.reset" : "Reset",
  "settings.enableTickingSound" : "enable ticking sound",
  "introduction.p2" : "The method uses a timer to segment a typical 25-minute working time and a short 5-minute break, while those periods are called pomodoros, with 4 pomodoros per break, for a long break of 15-30 minutes.",
  "navi.settings" : "Settings",
  "settings.title" : "Settings"
};
const en_US = {
  locale: "en-US",
  messages: messages,
};

export default en_US;
