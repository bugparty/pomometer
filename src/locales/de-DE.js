if (!Intl.PluralRules) {
    require("@formatjs/intl-pluralrules/polyfill");
    require("@formatjs/intl-pluralrules/locale-data/en"); // Add locale data for de
}

if (!Intl.RelativeTimeFormat) {
    require("@formatjs/intl-relativetimeformat/polyfill");
    require("@formatjs/intl-relativetimeformat/locale-data/en"); // Add locale data for de
}
const messages = {
    "settings.field.long_break_duration" : "lange Pausendauer",
    "settings.field.pomodoro_duration" : "Tomatendauer",
    "todo.filter.show" : "Zeigen:",
    "app.tab.logs" : "Protokolle",
    "introduction.title" : "Einführung von Pomodoro",
    "todo.filter.all" : "Alle",
    "todo_list.confirm_delete" : "Löschen bestätigen",
    "navi.title" : "AA Pomodoro-Uhr",
    "introduction.p1" : "Die Pomodoro-Technik ist eine Zeitmanagementmethode, die in den 1980er Jahren von Francesco Cirillo gegründet wurde.",
    "settings.enableTickingSound" : "tickendes Geräusch aktivieren",
    "introduction.p2" : "Die Methode verwendet einen Timer, um eine typische 25-minütige Arbeitszeit und eine kurze 5-minütige Pause zu segmentieren, während diese Perioden Pomodoros genannt werden, mit 4 Pomodoros pro Pause für eine lange Pause von 15-30 Minuten.",
    "navi.settings" : "Einstellungen",
    "settings.title" : "Einstellungen",
    "settings.button.save" : "Speichern",
    "todo.filter.completed" : "Vollendet",
    "clock.button.long" : "Lange Pause",
    "todo.subtodo.delete" : "Löschen:",
    "todo.default_subtodo" : "Standard-Unteraufgabe",
    "clock.button.short" : "Kurze Pause",
    "settings.field.short_break_duration" : "kurze Pausendauer",
    "clock.button.standard" : "Tomate",
    "clock.button.reset" : "Zurücksetzen",
    "todo.subtodo.Focus" : "Fokus",
    "todo.filter.active" : "Aktiv",
    "settings.enableRestTickingSound" : "Ticken beim Ausruhen aktivieren",
    "todo.add_todo" : "Füge alle Hinzu",
    "app.tab.todolist" : "Alle Liste",
    "settings.button.reset" : "Zurücksetzen"
}
const de_DE = {
    locale: "de-DE",
    messages: messages,
};

export default de_DE;