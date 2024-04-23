import I18n from "i18n-js"

// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import type { Locale } from "date-fns"
import format from "date-fns/format"
import parseISO from "date-fns/parseISO"
import ar from "date-fns/locale/ar-SA"
import ko from "date-fns/locale/ko"
import en from "date-fns/locale/en-US"

type Options = Parameters<typeof format>[2]

const getLocale = (): Locale => {
  const locale = I18n.currentLocale().split("-")[0]
  return locale === "ar" ? ar : locale === "ko" ? ko : en
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const locale = getLocale()
  const dateOptions = {
    ...options,
    locale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}

export const formateHourMinute = (timestamp: number) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();

  const formattedHours = hours < 10 ? `0${hours}` : hours.toString();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  
  return `${formattedHours}:${formattedMinutes}`;
}

export const formatDateTime = (date: Date) => {
  const pad = (num: number): string => num < 10 ? `0${num}` : num.toString();

  const month = pad(date.getMonth() + 1); 
  const day = pad(date.getDate());       
  const year = date.getFullYear();        
  const hour = pad(date.getHours());       
  const minute = pad(date.getMinutes());   

  return `${month}/${day}/${year} ${hour}:${minute}`;
}