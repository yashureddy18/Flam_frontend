import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Event } from '../../types';
import { useEvents } from '../../context/EventContext';
import EventForm from './EventForm';
import EventDetails from './EventDetails';

interface EventModalProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  selectedEvent?: Event;
}

type ModalView = 'list' | 'create' | 'edit' | 'details';

const EventModal: React.FC<EventModalProps> = ({ 
  date, 
  isOpen, 
  onClose, 
  selectedEvent 
}) => {
  const [view, setView] = useState<ModalView>(selectedEvent ? 'details' : 'list');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(selectedEvent || null);
  const { getEventsForDay, deleteEvent } = useEvents();
  
  const events = getEventsForDay(date);

  useEffect(() => {
    if (selectedEvent) {
      setCurrentEvent(selectedEvent);
      setView('details');
    } else {
      setView('list');
    }
  }, [selectedEvent]);

  const handleCreateClick = () => {
    setCurrentEvent(null);
    setView('create');
  };

  const handleEditClick = (event: Event) => {
    setCurrentEvent(event);
    setView('edit');
  };

  const handleViewDetails = (event: Event) => {
    setCurrentEvent(event);
    setView('details');
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
      setCurrentEvent(null);
      setView('list');
    }
  };

  const handleBackClick = () => {
    setView('list');
    setCurrentEvent(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {view === 'create' ? 'Add Event' : 
               view === 'edit' ? 'Edit Event' : 
               view === 'details' ? 'Event Details' : 
               format(date, 'MMMM d, yyyy')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'list' && (
            <div>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      className="p-3 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleViewDetails(event)}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: event.color }}
                        ></div>
                        <h3 className="font-medium">{event.title}</h3>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {format(new Date(event.date), 'h:mm a')}
                        {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No events scheduled for this day
                </div>
              )}
            </div>
          )}

          {view === 'create' && (
            <EventForm 
              date={date} 
              onSuccess={() => setView('list')}
              onCancel={handleBackClick}
            />
          )}

          {view === 'edit' && currentEvent && (
            <EventForm 
              date={date}
              event={currentEvent}
              onSuccess={() => setView('list')}
              onCancel={handleBackClick}
            />
          )}

          {view === 'details' && currentEvent && (
            <EventDetails 
              event={currentEvent}
              onEdit={() => handleEditClick(currentEvent)}
              onDelete={() => handleDeleteClick(currentEvent.id)}
              onBack={handleBackClick}
            />
          )}
        </div>

        {view === 'list' && (
          <div className="p-4 border-t">
            <button
              onClick={handleCreateClick}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;