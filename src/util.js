export function formatSeconds(_seconds) {
  let minute = Math.floor(_seconds / 60);
  let seconds = Math.ceil(_seconds % 60);
  return wrapTimeDigit(minute) + ":" + wrapTimeDigit(seconds);
}
export function formatDate(date){
  return (date.getMonth()+1)+ "/" + date.getDate() + ' '+ date.getHours() + ":" + date.getMinutes()

}
export function wrapTimeDigit(timeDigit) {
  return timeDigit > 9 ? "" + timeDigit : "0" + timeDigit;
}

export function secondsToMinutesString(_seconds) {
  let minute = Math.floor(_seconds / 60);
  return "" + minute;
}

export function secondsToMinutes(_seconds) {
  return Math.floor(_seconds / 60);
}
const isSafariBrowser = () => {
  if (navigator == null) return false;
  let ua = navigator.userAgent[1];
  if (ua == null) return false;
  return ua.match(/safari/i) && !ua.match(/chrome/i);
};

export var isSafari = isSafariBrowser();
