export function formatSeconds(_seconds) {
    let minute = Math.floor(_seconds / 60);
    let seconds = _seconds % 60;
    return wrapTimeDigit(minute)+":"+wrapTimeDigit(seconds);
}

function wrapTimeDigit(timeDigit) {
    return timeDigit > 9 ? ""+timeDigit : "0"+timeDigit;
}

export function secondsToMinutesString(_seconds) {
    let minute = Math.floor(_seconds / 60);
    return ''+minute;
}

export function secondsToMinutes(_seconds) {
    let minute = Math.floor(_seconds / 60);
    return minute;
}
let id, ua = navigator.userAgent;
export var isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i));

