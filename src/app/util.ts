import { setDay, startOfToday,endOfToday } from 'date-fns'

export function formatSeconds(_seconds: number) {
  const minute = Math.floor(_seconds / 60);
  const seconds = Math.ceil(_seconds % 60);
  return wrapTimeDigit(minute) + ":" + wrapTimeDigit(seconds);
}
export function formatDate(date: Date){
  return (date.getMonth()+1)+ "/" + date.getDate() + ' '+ date.getHours() + ":" + date.getMinutes()

}
export function wrapTimeDigit(timeDigit: number) {
  return timeDigit > 9 ? "" + timeDigit : "0" + timeDigit;
}

export function secondsToMinutesString(_seconds: number) {
  const minute = Math.floor(_seconds / 60);
  return "" + minute;
}

export function secondsToMinutes(_seconds: number) {
  return Math.floor(_seconds / 60);
}
const isSafariBrowser = () => {
  if (typeof navigator === 'undefined' || navigator == null) return false;
  const ua = navigator.userAgent;
  if (ua == null) return false;
  return ua.match(/safari/i) && !ua.match(/chrome/i);
};

export const isSafari = typeof window !== 'undefined' ? isSafariBrowser() : false;
type TimeRange = {
  start:number;
  end:number;
}
export function getTodayRange():TimeRange{
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()
  return {
    start: start,
    end: end
  }
}
export function getThisWeekRange():TimeRange{
  const now = new Date()
  const monday = setDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1).getTime() // 1 = Monday
  const sunday = setDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 7).getTime() // 7 = Sunday
  return {
    start: monday,
    end: sunday
  }
}