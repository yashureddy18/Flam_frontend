import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Event, RecurrencePattern } from '../types';
import { isSameDay } from 'date-fns';

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  getEventsForDay: (date: Date) => Event[];
  hasEventConflict: (newEvent: Omit<Event, 'id'>, excludeId?: string) => boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  // Load events from localStorage on initial render
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents, (key, value) => {
          // Convert string dates back to Date objects
          if (key === 'date' || key === 'endTime' || key === 'endDate') {
            return value ? new Date(value) : undefined;
          }
          return value;
        });
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Failed to parse stored events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: uuidv4()
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  const getEventsForDay = (date: Date): Event[] => {
    // Filter regular events for the specific date
    const regularEvents = events.filter(event => 
      isSameDay(new Date(event.date), date) && !event.recurrence
    );

    // Handle recurring events
    const recurringEvents = events
      .filter(event => event.recurrence)
      .filter(event => {
        const eventDate = new Date(event.date);
        const recurrence = event.recurrence as RecurrencePattern;
        
        // Check if the recurring event applies to the given date
        switch(recurrence.type) {
          case 'daily':
            // Check if the date falls within the daily pattern
            return isDateInRecurrencePattern(date, eventDate, recurrence);
          
          case 'weekly':
            // Check if the day of week matches and it's within the recurrence pattern
            return recurrence.daysOfWeek?.includes(date.getDay()) && 
                  isDateInRecurrencePattern(date, eventDate, recurrence);
          
          case 'monthly':
            // Check if the day of month matches and it's within the recurrence pattern
            return date.getDate() === eventDate.getDate() && 
                  isDateInRecurrencePattern(date, eventDate, recurrence);
          
          case 'custom':
            // For custom, we use the interval directly
            return isDateInRecurrencePattern(date, eventDate, recurrence);
          
          default:
            return false;
        }
      });

    return [...regularEvents, ...recurringEvents];
  };

  const isDateInRecurrencePattern = (
    date: Date, 
    eventDate: Date, 
    recurrence: RecurrencePattern
  ): boolean => {
    // If the target date is before the first occurrence, it's not in the pattern
    if (date < eventDate) return false;

    // Check end date if specified
    if (recurrence.endDate && date > new Date(recurrence.endDate)) {
      return false;
    }

    // Basic logic for different recurrence types
    const diffTime = Math.abs(date.getTime() - eventDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    switch(recurrence.type) {
      case 'daily':
        // Check if the number of days since the start date is divisible by the interval
        return diffDays % recurrence.interval === 0;
      
      case 'weekly':
        // Check if the weeks since the start date is divisible by the interval
        // and the day of week matches
        const diffWeeks = Math.floor(diffDays / 7);
        return diffWeeks % recurrence.interval === 0 && 
               recurrence.daysOfWeek?.includes(date.getDay());
      
      case 'monthly':
        // Check if the months since the start date is divisible by the interval
        // and the day of month matches
        const diffMonths = 
          (date.getFullYear() - eventDate.getFullYear()) * 12 + 
          (date.getMonth() - eventDate.getMonth());
        return diffMonths % recurrence.interval === 0 && 
               date.getDate() === eventDate.getDate();
      
      case 'custom':
        // For custom, check if the days since start is divisible by the interval
        return diffDays % recurrence.interval === 0;
      
      default:
        return false;
    }
  };

  const hasEventConflict = (newEvent: Omit<Event, 'id'>, excludeId?: string): boolean => {
    const eventsForDay = getEventsForDay(new Date(newEvent.date))
      .filter(event => !excludeId || event.id !== excludeId);
    
    // Check for time conflicts
    const newEventTime = new Date(newEvent.date).getTime();
    const newEventEndTime = newEvent.endTime ? new Date(newEvent.endTime).getTime() : newEventTime + 3600000; // Default to 1 hour
    
    return eventsForDay.some(event => {
      const existingEventTime = new Date(event.date).getTime();
      const existingEventEndTime = event.endTime ? 
        new Date(event.endTime).getTime() : 
        existingEventTime + 3600000; // Default to 1 hour
      
      // Check if the events overlap
      return (
        (newEventTime >= existingEventTime && newEventTime < existingEventEndTime) ||
        (newEventEndTime > existingEventTime && newEventEndTime <= existingEventEndTime) ||
        (newEventTime <= existingEventTime && newEventEndTime >= existingEventEndTime)
      );
    });
  };

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsForDay,
      hasEventConflict
    }}>
      {children}
    </EventContext.Provider>
  );
};