import React from 'react';
import { Event } from '../../types';
import { format } from 'date-fns';
import { Repeat } from 'lucide-react';

interface EventItemProps {
  event: Event;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
}

const EventItem: React.FC<EventItemProps> = ({ 
  event, 
  onClick, 
  draggable = false,
  onDragStart 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart();
  };

  return (
    <div
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      className={`
        p-1 mb-1 rounded text-xs truncate cursor-pointer
        hover:opacity-90 transition-opacity
        flex items-center
      `}
      style={{ backgroundColor: event.color }}
    >
      <div className="flex-1 truncate">
        <span className="font-medium text-white">{event.title}</span>
        <span className="text-white text-opacity-90 ml-1">
          {format(new Date(event.date), 'h:mm a')}
        </span>
      </div>
      {event.recurrence && (
        <Repeat className="h-3 w-3 text-white ml-1" />
      )}
    </div>
  );
};

export default EventItem;