"use client";
import { useState } from "react";
import { CashflowEvent } from "@/types/portfolio";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface CashflowCalendarProps {
  events: CashflowEvent[];
  onEventClick: (event: CashflowEvent) => void;
}

export default function CashflowCalendar({ events, onEventClick }: CashflowCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.dueDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'overdue': return <AlertTriangle className="w-3 h-3 text-red-400" />;
      default: return <Clock className="w-3 h-3 text-yellow-400" />;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-700" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-700 p-1 ${
            isToday ? 'bg-blue-500 bg-opacity-20' : 'hover:bg-gray-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm ${isToday ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, 2).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-700 rounded px-1"
                    onClick={() => onEventClick(event)}
                    title={`${event.companyName}: ${event.amount.toFixed(2)} APT`}
                  >
                    {getEventStatusIcon(event.status)}
                    <span className="text-xs text-gray-300 truncate">
                      {event.amount.toFixed(1)} APT
                    </span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-xs text-gray-500">+{dayEvents.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Cashflow Calendar</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-white font-medium min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">Received</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-gray-400">Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
