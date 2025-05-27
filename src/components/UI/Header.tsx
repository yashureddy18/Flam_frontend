import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center">
          <CalendarIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;