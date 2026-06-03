import { getDaysInMonth, getFirstDayOfMonth, isToday, isSameDay } from '../utils/dateUtils';
import type { CalendarEvent } from '../types/calendar';

interface YearViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function YearView({ currentDate, events, onDayClick, onEventClick }: YearViewProps) {
  const year = currentDate.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  const renderMonth = (month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {days.push(null)}

    for (let i = 1; i <= daysInMonth; i++) {days.push(new Date(year, month, i))}

    return (
      <div key={month} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">{monthNames[month]}</h3>
        </div>

        <div className="p-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 h-6 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isTodayDate = day ? isToday(day) : false;

              return (
                <div
                  key={index}
                  onClick={() => day && onDayClick(day)}
                  className={`aspect-square flex items-center justify-center rounded text-xs cursor-pointer transition-colors ${
                    !day
                      ? 'bg-gray-50'
                      : isTodayDate
                      ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                      : dayEvents.length > 0
                      ? 'bg-blue-100 text-gray-900 font-medium hover:bg-blue-200'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                  title={dayEvents.length > 0 ? `${dayEvents.length} event(s)` : ''}
                >
                  {day && (
                    <div className="flex flex-col items-center">
                      <span>{day.getDate()}</span>
                      {dayEvents.length > 0 && (
                        <span className={`text-xs ${isTodayDate ? 'text-blue-200' : 'text-blue-600'}`}>•</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{year}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthNames.map((_, month) => renderMonth(month))}
      </div>
    </div>
  );
}
