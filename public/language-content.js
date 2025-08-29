// Language-specific content for the HTML file
const languageContent = {
  "en-US": {
    htmlLang: "en",
    title: "AA Pomodoro, a free online Pomodoro timer based on the Pomodoro Technique",
    description: "AA Pomodoro is an online Pomodoro timer tool that follows the Pomodoro Technique",
    keywords: "Pomodoro, online Pomodoro, Pomodoro timer, Pomodoro Technique, Pomodoro app, productivity tool, time management, time management software",
    noscript: "You need to enable JavaScript to run this app. Introduction to Pomodoro Technique: The Pomodoro Technique is a time management method that was founded in the 1980s by Francesco Cirillo. The method uses a timer to segment a typical 25-minute working time and a short 5-minute break, while those periods are called pomodoros, with 4 pomodoros per break, for a long break of 15-30 minutes."
  },
  "zh-CN": {
    htmlLang: "zh-CN",
    title: "AA番茄钟,免费的基于番茄工作法的在线的番茄计时器",
    description: "AA番茄钟是一个符合番茄工作法的在线番茄钟计时工具",
    keywords: "番茄钟, 在线番茄钟, 番茄计时器, 番茄工作法, 番茄钟app, 生产力工具, 时间管理, 时间管理软件, Pomodoro Technique",
    noscript: "You need to enable JavaScript to run this app. 番茄工作法说明,番茄工作法（英语：Pomodoro Technique）是一种时间管理法方法，在1980年代由Francesco Cirillo创立。该方法使用一个定时器来分割出一个一般为25分钟的工作时间和5分钟的短休息时间，而那些时间段被称为pomodoros，每休息4个pomodoros,进行一个15-30分钟的长休息"
  },
  "de-DE": {
    htmlLang: "de",
    title: "AA Pomodoro, ein kostenloser Online-Pomodoro-Timer basierend auf der Pomodoro-Technik",
    description: "AA Pomodoro ist ein Online-Pomodoro-Timer-Tool, das der Pomodoro-Technik folgt",
    keywords: "Pomodoro, Online-Pomodoro, Pomodoro-Timer, Pomodoro-Technik, Pomodoro-App, Produktivitätstool, Zeitmanagement, Zeitmanagement-Software",
    noscript: "Sie müssen JavaScript aktivieren, um diese App auszuführen. Einführung in die Pomodoro-Technik: Die Pomodoro-Technik ist eine Zeitmanagement-Methode, die in den 1980er Jahren von Francesco Cirillo entwickelt wurde. Die Methode verwendet einen Timer, um eine typische 25-minütige Arbeitszeit und eine kurze 5-minütige Pause zu segmentieren. Diese Zeitabschnitte werden Pomodoros genannt. Nach 4 Pomodoros folgt eine lange Pause von 15-30 Minuten."
  }
};

// Function to update HTML content based on language
function updateHtmlContent(language) {
  const content = languageContent[language] || languageContent["en-US"];
  
  // Update HTML lang attribute
  document.documentElement.lang = content.htmlLang;
  
  // Update meta tags
  document.querySelector('meta[name="description"]').setAttribute('content', content.description);
  document.querySelector('meta[name="keywords"]').setAttribute('content', content.keywords);
  
  // Update title
  document.title = content.title;
  
  // Update noscript content
  const noscriptElement = document.querySelector('noscript');
  if (noscriptElement) {
    noscriptElement.textContent = content.noscript;
  }
}

// Listen for language changes from the Redux store
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'LANGUAGE_CHANGED') {
    updateHtmlContent(event.data.language);
  }
});

// Initialize with default language
document.addEventListener('DOMContentLoaded', function() {
  // Default to English if no language is set
  const defaultLanguage = 'en-US';
  updateHtmlContent(defaultLanguage);
}); 