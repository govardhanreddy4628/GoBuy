import { useState, useEffect } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { EventModal } from './EventModal';
import type { CalendarEvent } from '../types/calendar';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../services/calendarService';
import { addMonths } from '../utils/dateUtils';
import Sidebar from './Sidebar';
import { YearView } from './YearView';



// interface CalendarProps {
//   userId?: string;
// }

//export function Calendar({ userId }: CalendarProps) {
export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
const [view, setView] = useState<'month' | 'week' | 'day' | 'year'>('month');  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [initialHour, setInitialHour] = useState<number>(9);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate);
      startDate.setDate(1);
      const endDate = addMonths(startDate, 1);

      const fetchedEvents = await getCalendarEvents(startDate, endDate);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    else if (view === 'year') {newDate.setFullYear(newDate.getFullYear() - 1)}
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (view === 'day') { newDate.setDate(newDate.getDate() + 1);}
     else if (view === 'year') { newDate.setFullYear(newDate.getFullYear() + 1);}
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (date: Date) => {
    setInitialDate(date);
    setInitialHour(9);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setInitialDate(date);
    setInitialHour(hour);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleTimeSlotClickDay = (hour: number) => {
    setInitialDate(currentDate);
    setInitialHour(hour);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setCurrentDate(new Date(event.start_time));
    setInitialDate(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: CalendarEvent | CalendarEvent) => {
    try {
      if (selectedEvent && selectedEvent._id) {
        await updateCalendarEvent(selectedEvent._id, eventData as CalendarEvent);
      } else {
        await createCalendarEvent(eventData as CalendarEvent);
      }
      setIsModalOpen(false);
      setSelectedEvent(null);
      setInitialDate(undefined);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (_id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteCalendarEvent(_id);
      setIsModalOpen(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setInitialDate(currentDate);
    setInitialHour(9);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full mx-auto h-[calc(100vh-4rem)] flex flex-col">
      
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setView}
      />

      <div className="flex flex-1">   
        <Sidebar handleNewEvent={handleNewEvent} onEventClick={handleEventClick}/>
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center justify-center mt-4 ml-4 flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      ) : (
        <div className="mt-4 ml-4 mr-2 flex-1">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}

          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClickDay}
            />
          )}

          {view === 'year' && (
            <YearView
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setInitialDate(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        initialDate={initialDate}
        initialHour={initialHour}
        //userId={userId}
      />
    </div>
  );
}
