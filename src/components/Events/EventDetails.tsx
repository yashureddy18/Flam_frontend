import React from 'react';
import { format } from 'date-fns';
import { Event } from '../../types';
import { Calendar, Clock, Repeat, AlertTriangle } from 'lucide-react';

interface EventDetailsProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ 
  event, 
  onEdit, 
  onDelete, 
  onBack 
}) => {
  const getRecurrenceText = () => {
    if (!event.recurrence) return 'No recurrence';
    
    const { type, interval, daysOfWeek, endDate, occurrences } = event.recurrence;
    
    let text = '';
    
    switch (type) {
      case 'daily':
        text = `Every ${interval > 1 ? interval : ''} day${interval > 1 ? 's' : ''}`;
        break;
      case 'weekly':
        text = `Every ${interval > 1 ? interval : ''} week${interval > 1 ? 's' : ''}`;
        if (daysOfWeek && daysOfWeek.length > 0) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          text += ` on ${daysOfWeek.map(d => days[d]).join(', ')}`;
        }
        break;
      case 'monthly':
        text = `Every ${interval > 1 ? interval : ''} month${interval > 1 ? 's' : ''}`;
        break;
      case 'custom':
        text = `Every ${interval} days`;
        break;
    }
    
    if (endDate) {
      text += `, until ${format(new Date(endDate), 'MMM d, yyyy')}`;
    } else if (occurrences) {
      text += `, for ${occurrences} occurrences`;
    }
    
    return text;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <div 
          className="w-4 h-4 rounded-full mt-1 mr-2 flex-shrink-0"
          style={{ backgroundColor: event.color }}
        ></div>
        <div>
          <h3 className="text-xl font-bold">{event.title}</h3>
          <div className="text-gray-600 mt-1">
            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-gray-500 mr-2" />
        <span>
          {format(new Date(event.date), 'h:mm a')}
          {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
        </span>
      </div>
      
      {event.recurrence && (
        <div className="flex items-center">
          <Repeat className="h-5 w-5 text-gray-500 mr-2" />
          <span>{getRecurrenceText()}</span>
        </div>
      )}
      
      {event.description && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
        </div>
      )}
      
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        
        <div className="space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;