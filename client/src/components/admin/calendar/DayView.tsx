import { getWeekdayName, formatTime, parseISODate, isToday } from '../utils/dateUtils';
import type { CalendarEvent } from '../types/calendar';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (hour: number) => void;
}

export function DayView({ currentDate, events, onEventClick, onTimeSlotClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventStart = parseISODate(event.start_time);
      const eventHour = eventStart.getHours();

      return (
        eventStart.getDate() === currentDate.getDate() &&
        eventStart.getMonth() === currentDate.getMonth() &&
        eventStart.getFullYear() === currentDate.getFullYear() &&
        eventHour === hour
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`p-6 border-b ${isToday(currentDate) ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="text-sm font-semibold text-gray-600">
          {getWeekdayName(currentDate.getDay())}
        </div>
        <div className="text-3xl font-bold text-gray-900 mt-1">
          {currentDate.getDate()}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);

          return (
            <div
              key={hour}
              onClick={() => onTimeSlotClick(hour)}
              className="border-b min-h-[80px] p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex gap-4">
                <div className="text-sm text-gray-500 w-20 flex-shrink-0">
                  {hour.toString().padStart(2, '0')}:00
                </div>

                <div className="flex-1 space-y-2">
                  {hourEvents.map(event => (
                    <div
                      key={event._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: event.color, color: 'white' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-sm">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {formatTime(parseISODate(event.start_time))} - {formatTime(parseISODate(event.end_time))}
                        </div>
                      </div>
                      {event.description && (
                        <div className="text-xs opacity-90 mt-1">{event.description}</div>
                      )}
                      {event.location && (
                        <div className="text-xs opacity-75 mt-1">📍 {event.location}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
