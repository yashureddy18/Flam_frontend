import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addDays,
  getDay,
  parse,
  addMonths
} from 'date-fns';

// Get all days for a month including padding days from prev/next months
export const getCalendarDays = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, monthStart),
    isToday: isSameDay(day, new Date())
  }));
};

// Format date consistently throughout the app
export const formatDate = (date: Date, formatStr: string = 'MMM d, yyyy') => {
  return format(date, formatStr);
};

// Parse date strings from form inputs
export const parseFormDate = (dateStr: string, timeStr: string) => {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
};

// Get names of weekdays, optionally starting from Monday
export const getWeekdayNames = (short = true, startFromMonday = false) => {
  const days = short 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] 
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (startFromMonday) {
    return [...days.slice(1), days[0]];
  }
  
  return days;
};