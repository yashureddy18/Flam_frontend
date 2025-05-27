import React, { useState, useEffect } from 'react';
import { format, parse, addHours } from 'date-fns';
import { Event, EventFormData, RecurrencePattern } from '../../types';
import { useEvents } from '../../context/EventContext';

interface EventFormProps {
  date: Date;
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#14B8A6', // Teal
];

const EventForm: React.FC<EventFormProps> = ({ date, event, onSuccess, onCancel }) => {
  const { addEvent, updateEvent, hasEventConflict } = useEvents();
  const [error, setError] = useState<string | null>(null);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(!!event?.recurrence);

  const initialFormData: EventFormData = {
    title: event?.title || '',
    date: format(event?.date || date, 'yyyy-MM-dd'),
    time: format(event?.date || date, 'HH:mm'),
    endTime: event?.endTime ? format(event.endTime, 'HH:mm') : format(addHours(event?.date || date, 1), 'HH:mm'),
    description: event?.description || '',
    color: event?.color || DEFAULT_COLORS[0],
    recurrenceType: event?.recurrence?.type || 'none',
    recurrenceInterval: event?.recurrence?.interval || 1,
    recurrenceDaysOfWeek: event?.recurrence?.daysOfWeek || [date.getDay()],
    recurrenceEndDate: event?.recurrence?.endDate ? format(event.recurrence.endDate, 'yyyy-MM-dd') : '',
    recurrenceOccurrences: event?.recurrence?.occurrences || 0,
  };

  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  useEffect(() => {
    // Reset the form if the event changes
    setFormData(initialFormData);
    setShowRecurrenceOptions(!!event?.recurrence);
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleDayOfWeekToggle = (day: number) => {
    setFormData(prev => {
      const days = [...prev.recurrenceDaysOfWeek];
      const index = days.indexOf(day);
      
      if (index === -1) {
        days.push(day);
      } else {
        days.splice(index, 1);
      }
      
      return { ...prev, recurrenceDaysOfWeek: days };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    // Parse date and times
    const eventDate = parse(
      `${formData.date} ${formData.time}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
    );
    
    const eventEndTime = formData.endTime 
      ? parse(`${formData.date} ${formData.endTime}`, 'yyyy-MM-dd HH:mm', new Date())
      : addHours(eventDate, 1);
    
    if (eventEndTime <= eventDate) {
      setError('End time must be after start time');
      return;
    }

    // Build recurrence pattern if applicable
    let recurrence: RecurrencePattern | null = null;
    
    if (formData.recurrenceType !== 'none') {
      recurrence = {
        type: formData.recurrenceType as 'daily' | 'weekly' | 'monthly' | 'custom',
        interval: parseInt(formData.recurrenceInterval.toString(), 10),
      };
      
      if (formData.recurrenceType === 'weekly') {
        recurrence.daysOfWeek = formData.recurrenceDaysOfWeek;
      }
      
      if (formData.recurrenceEndDate) {
        recurrence.endDate = parse(formData.recurrenceEndDate, 'yyyy-MM-dd', new Date());
      }
      
      if (formData.recurrenceOccurrences > 0) {
        recurrence.occurrences = formData.recurrenceOccurrences;
      }
    }

    // Create the event object
    const eventData: Omit<Event, 'id'> = {
      title: formData.title,
      date: eventDate,
      endTime: eventEndTime,
      description: formData.description,
      color: formData.color,
      recurrence,
    };

    // Check for conflicts
    if (hasEventConflict(eventData, event?.id)) {
      setError('This event conflicts with an existing event');
      return;
    }

    // Add or update the event
    if (event) {
      updateEvent({ ...eventData, id: event.id });
    } else {
      addEvent(eventData);
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event title"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Time
        </label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Event description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-full ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recurrence
        </label>
        <select
          name="recurrenceType"
          value={formData.recurrenceType}
          onChange={(e) => {
            handleChange(e);
            setShowRecurrenceOptions(e.target.value !== 'none');
          }}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      {showRecurrenceOptions && (
        <div className="space-y-4 p-3 bg-gray-50 rounded-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeat every
            </label>
            <div className="flex items-center">
              <input
                type="number"
                name="recurrenceInterval"
                value={formData.recurrenceInterval}
                onChange={handleChange}
                min="1"
                className="w-16 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-600">
                {formData.recurrenceType === 'daily' ? 'day(s)' : 
                 formData.recurrenceType === 'weekly' ? 'week(s)' : 
                 formData.recurrenceType === 'monthly' ? 'month(s)' : 
                 'day(s)'}
              </span>
            </div>
          </div>
          
          {formData.recurrenceType === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repeat on
              </label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDayOfWeekToggle(index)}
                    className={`w-8 h-8 rounded-full ${
                      formData.recurrenceDaysOfWeek.includes(index)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ends
            </label>
            <div className="space-y-2">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="recurrenceEnd"
                    checked={!formData.recurrenceEndDate && formData.recurrenceOccurrences === 0}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        recurrenceEndDate: '',
                        recurrenceOccurrences: 0
                      }));
                    }}
                    className="mr-2"
                  />
                  Never
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="recurrenceEnd"
                    checked={!!formData.recurrenceEndDate}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        recurrenceEndDate: format(
                          addHours(new Date(), 24 * 7), 
                          'yyyy-MM-dd'
                        ),
                        recurrenceOccurrences: 0
                      }));
                    }}
                    className="mr-2"
                  />
                  On date
                </label>
                {!!formData.recurrenceEndDate && (
                  <input
                    type="date"
                    name="recurrenceEndDate"
                    value={formData.recurrenceEndDate}
                    onChange={handleChange}
                    className="ml-6 mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="recurrenceEnd"
                    checked={formData.recurrenceOccurrences > 0}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        recurrenceEndDate: '',
                        recurrenceOccurrences: 10
                      }));
                    }}
                    className="mr-2"
                  />
                  After occurrences
                </label>
                {formData.recurrenceOccurrences > 0 && (
                  <input
                    type="number"
                    name="recurrenceOccurrences"
                    value={formData.recurrenceOccurrences}
                    onChange={handleChange}
                    min="1"
                    className="ml-6 mt-1 w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {event ? 'Update' : 'Create'} Event
        </button>
      </div>
    </form>
  );
};

export default EventForm;