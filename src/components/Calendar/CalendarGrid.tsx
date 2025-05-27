import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDay } from '../../types';
import EventItem from '../Events/EventItem';
import { useEvents } from '../../context/EventContext';

interface CalendarGridProps {
  days: CalendarDay[];
  onDayClick: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, onDayClick }) => {
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const { events, updateEvent, hasEventConflict } = useEvents();

  const handleDragStart = (eventId: string) => {
    setDraggedEventId(eventId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();
    if (!draggedEventId) return;

    const event = events.find(e => e.id === draggedEventId);
    if (!event) return;

    // Create a new event with the updated date but same time
    const originalDate = new Date(event.date);
    const newDate = new Date(date);
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes());

    const updatedEvent = {
      ...event,
      date: newDate,
      // Update end time if it exists
      endTime: event.endTime ? new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        new Date(event.endTime).getHours(),
        new Date(event.endTime).getMinutes()
      ) : undefined
    };

    // Check for conflicts
    if (hasEventConflict(updatedEvent, event.id)) {
      alert('Cannot move event: There is a time conflict with an existing event.');
      return;
    }

    // Update the event
    updateEvent(updatedEvent);
    setDraggedEventId(null);
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {days.map((day, i) => (
        <div
          key={i}
          onClick={() => onDayClick(day.date)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, day.date)}
          className={`min-h-[120px] p-1 bg-white transition-colors cursor-pointer
            ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
            ${day.isToday ? 'bg-blue-50' : ''}
            hover:bg-gray-50`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center
              ${day.isToday ? 'bg-blue-600 text-white' : ''}
            `}>
              {format(day.date, 'd')}
            </span>
            <span className="text-xs text-gray-500">
              {day.events.length > 0 ? `${day.events.length} event${day.events.length > 1 ? 's' : ''}` : ''}
            </span>
          </div>
          <div className="mt-1 overflow-y-auto max-h-[80px]">
            {day.events.slice(0, 3).map(event => (
              <EventItem 
                key={event.id} 
                event={event}
                draggable
                onDragStart={() => handleDragStart(event.id)}
              />
            ))}
            {day.events.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                +{day.events.length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;