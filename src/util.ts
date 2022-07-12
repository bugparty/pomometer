import { setDay, startOfToday,endOfToday } from 'date-fns'

export function formatSeconds(_seconds: number) {
  let minute = Math.floor(_seconds / 60);
  let seconds = Math.ceil(_seconds % 60);
  return wrapTimeDigit(minute) + ":" + wrapTimeDigit(seconds);
}
export function formatDate(date: Date){
  return (date.getMonth()+1)+ "/" + date.getDate() + ' '+ date.getHours() + ":" + date.getMinutes()

}
export function wrapTimeDigit(timeDigit: number) {
  return timeDigit > 9 ? "" + timeDigit : "0" + timeDigit;
}

export function secondsToMinutesString(_seconds: number) {
  let minute = Math.floor(_seconds / 60);
  return "" + minute;
}

export function secondsToMinutes(_seconds: number) {
  return Math.floor(_seconds / 60);
}
const isSafariBrowser = () => {
  if (navigator == null) return false;
  let ua = navigator.userAgent[1];
  if (ua == null) return false;
  return ua.match(/safari/i) && !ua.match(/chrome/i);
};

export var isSafari = isSafariBrowser();
type TimeRange = {
  start:number;
  end:number;
}
export function getTodayRange():TimeRange{
  let now = new Date()
  let start = now.setHours(0,0,0,0)
  let end = now.setHours(23,59,59,999)
  return {
    start:start,
    end:end
  }
}
export function getThisWeekRange():TimeRange{
  let monday = setDay(startOfToday(), 0).getTime()
  let sunday = setDay(endOfToday(), 6).getTime()
  return {
    start:monday,
    end:sunday
  }
}