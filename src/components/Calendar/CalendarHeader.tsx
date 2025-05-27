import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="p-4 border-b">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex items-center mb-4 sm:mb-0">
          <h2 className="text-xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex ml-4">
            <button
              className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              onClick={onPrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
              onClick={onNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <button
            className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
            onClick={onToday}
          >
            Today
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 font-semibold text-gray-600 text-sm">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;