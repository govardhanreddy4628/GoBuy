import { useState } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, isToday, isSameDay } from '../utils/dateUtils';
import type { CalendarEvent } from '../types/calendar';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ currentDate, events, onDayClick, onEventClick }: MonthViewProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) {days.push(null)}
  for (let i = 1; i <= daysInMonth; i++) {days.push(new Date(year, month, i))}

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="bg-white shadow h-full">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-400 py-2 text-center text-sm font-semibold text-gray-900">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDate = day ? isToday(day) : false;
          const dayKey = day ? day.toISOString() : `empty-${index}`;
          const isExpanded = expandedDay === dayKey;

          return (
            <div
              key={dayKey} 
              onClick={() => day && onDayClick(day)}
              className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                !day ? 'bg-gray-50' : ''
              }`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isTodayDate
                        ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                        : 'text-gray-900'
                    }`}
                  >
                    {day.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="text-xs p-1.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: event.color, color: 'white' }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="relative">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDay(isExpanded ? null : dayKey);
                          }}
                          className="text-xs text-gray-600 pl-1.5 py-1 cursor-pointer hover:text-gray-900 font-medium bg-gray-100 rounded shadow-sm"
                        >
                          +{dayEvents.length - 3} more
                        </div>
                        {isExpanded && (
                          <div
                            className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                              {dayEvents.slice(3).map(event => (
                                <div
                                  key={event._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDay(null);
                                    onEventClick(event);
                                  }}
                                  className="text-sm p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors border-l-4"
                                  style={{ borderLeftColor: event.color }}
                                >
                                  <div className="font-medium text-gray-900">{event.title}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {new Date(event.start_time).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
