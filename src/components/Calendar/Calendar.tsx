import React, { useState } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventModal from '../Events/EventModal';
import { CalendarDay } from '../../types';
import { useEvents } from '../../context/EventContext';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { getEventsForDay } = useEvents();

  const getDaysInMonth = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: CalendarDay[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push({
        date: new Date(day),
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isSameDay(day, new Date()),
        events: getEventsForDay(day).filter(event => 
          searchTerm === '' || 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      });
      day = addDays(day, 1);
    }

    return days;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <CalendarHeader 
        currentDate={currentDate} 
        onPrevMonth={prevMonth} 
        onNextMonth={nextMonth} 
        onToday={goToToday}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <CalendarGrid 
        days={getDaysInMonth()} 
        onDayClick={handleDayClick} 
      />
      {isModalOpen && selectedDate && (
        <EventModal 
          date={selectedDate}
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default Calendar;