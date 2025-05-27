export interface Event {
  id: string;
  title: string;
  date: Date;
  endTime?: Date;
  description: string;
  color: string;
  recurrence: RecurrencePattern | null;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly recurrence (0 = Sunday, 6 = Saturday)
  endDate?: Date; // Optional end date for the recurrence
  occurrences?: number; // Optional number of occurrences
}

export interface EventFormData {
  title: string;
  date: string;
  time: string;
  endTime: string;
  description: string;
  color: string;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceInterval: number;
  recurrenceDaysOfWeek: number[];
  recurrenceEndDate: string;
  recurrenceOccurrences: number;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}