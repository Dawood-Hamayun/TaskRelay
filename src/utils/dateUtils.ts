// frontend/src/utils/dateUtils.ts - Complete Date Utilities
export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Check if it's today, tomorrow, or yesterday
    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    }

    // Check if it's this week
    const daysDiff = Math.abs(Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    if (daysDiff < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Default format
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid datetime';
  }
};

export const formatDateTimeForInput = (date: Date): string => {
  try {
    // Format for datetime-local input: YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getCalendarDays = (currentDate: Date): Date[] => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // First day of the calendar (including previous month's days)
  const startCalendar = new Date(firstDay);
  startCalendar.setDate(firstDay.getDate() - firstDay.getDay());
  
  // Last day of the calendar (including next month's days)
  const endCalendar = new Date(lastDay);
  const daysToAdd = 6 - lastDay.getDay();
  endCalendar.setDate(lastDay.getDate() + daysToAdd);
  
  const days: Date[] = [];
  const currentDay = new Date(startCalendar);
  
  while (currentDay <= endCalendar) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  return days;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfWeek = (date: Date): Date => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isWithinRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) >= 1) {
    return formatDate(date.toISOString());
  } else if (Math.abs(diffInHours) >= 1) {
    return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ${diffInHours > 0 ? 'from now' : 'ago'}`;
  } else if (Math.abs(diffInMinutes) >= 1) {
    return `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''} ${diffInMinutes > 0 ? 'from now' : 'ago'}`;
  } else {
    return 'Just now';
  }
};

// Meeting specific utilities
export const getMeetingTimeStatus = (meetingDate: string): 'past' | 'current' | 'upcoming' => {
  const now = new Date();
  const meeting = new Date(meetingDate);
  
  if (meeting < now) {
    return 'past';
  } else if (meeting.toDateString() === now.toDateString()) {
    return 'current';
  } else {
    return 'upcoming';
  }
};

export const isMeetingToday = (meetingDate: string): boolean => {
  const today = new Date();
  const meeting = new Date(meetingDate);
  return isSameDay(meeting, today);
};

export const getMeetingDuration = (startDate: string, durationMinutes: number): string => {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  
  return `${formatTime(start.toISOString())} - ${formatTime(end.toISOString())}`;
};