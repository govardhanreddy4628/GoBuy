import { getWeekDays, getWeekdayShort, isToday, formatTime, parseISODate } from '../utils/dateUtils';
import type { CalendarEvent } from '../types/calendar';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function WeekView({ currentDate, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = parseISODate(event.start_time);
      const eventHour = eventStart.getHours();

      return (
        eventStart.getDate() === day.getDate() &&
        eventStart.getMonth() === day.getMonth() &&
        eventStart.getFullYear() === day.getFullYear() &&
        eventHour === hour
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        <div className="p-4 text-sm font-semibold text-gray-500">Time</div>
        {weekDays.map(day => (
          <div
            key={day.toISOString()}
            className={`p-4 text-center border-l ${
              isToday(day) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="text-sm font-semibold text-gray-900">
              {getWeekdayShort(day.getDay())}
            </div>
            <div
              className={`text-2xl font-bold mt-1 ${
                isToday(day)
                  ? 'bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto'
                  : 'text-gray-900'
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
            <div className="p-2 text-sm text-gray-500 border-r">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const dayEvents = getEventsForDayAndHour(day, hour);
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  onClick={() => onTimeSlotClick(day, hour)}
                  className={`border-l p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isToday(day) ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {dayEvents.map(event => (
                    <div
                      key={event._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: event.color, color: 'white' }}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="opacity-90">
                        {formatTime(parseISODate(event.start_time))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
