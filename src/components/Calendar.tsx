import React from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { useActivityStore } from '../store/activityStore';
import 'react-calendar/dist/Calendar.css';

interface CalendarModalProps {
  onClose: () => void;
}

export function CalendarModal({ onClose }: CalendarModalProps) {
  const { selectedDate, setSelectedDate, loadActivities } = useActivityStore();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    loadActivities(date);
    onClose();
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Date</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="!border-0 !rounded-lg !shadow-none !w-full"
          tileClassName="!rounded-lg hover:!bg-purple-50"
          navigationLabel={({ date }) => format(date, 'MMMM yyyy')}
        />
      </div>
    </div>
  );
}