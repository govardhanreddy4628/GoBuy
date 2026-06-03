// context/calendarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CalendarEvent } from '../types/calendar';
import * as calendarService from '../services/calendarService';

interface CalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
  createEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  getEventById: (id: string) => Promise<CalendarEvent | null>;
  getEventsByType: (eventType: string, start?: Date, end?: Date) => Promise<CalendarEvent[]>;
  getUpcomingEvents: (limit?: number) => Promise<CalendarEvent[]>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used within CalendarProvider');
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch events between optional dates
  const fetchEvents = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      const data = await calendarService.getCalendarEvents(startDate, endDate);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      const newEvent = await calendarService.createCalendarEvent(event);
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      const updated = await calendarService.updateCalendarEvent(id, updates);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err) {
      console.error('Error updating event:', err);
      return null;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      const success = await calendarService.deleteCalendarEvent(id);
      if (success) setEvents((prev) => prev.filter((e) => e.id !== id));
      return success;
    } catch (err) {
      console.error('Error deleting event:', err);
      return false;
    }
  };

  const getEventById = async (id: string): Promise<CalendarEvent | null> => {
    try {
      return await calendarService.getEventById(id);
    } catch (err) {
      console.error('Error fetching event by ID:', err);
      return null;
    }
  };

  const getEventsByType = async (eventType: string, start?: Date, end?: Date): Promise<CalendarEvent[]> => {
    try {
      return await calendarService.getEventsByType(eventType, start, end);
    } catch (err) {
      console.error('Error fetching events by type:', err);
      return [];
    }
  };

  const getUpcomingEvents = async (limit?: number): Promise<CalendarEvent[]> => {
    try {
      return await calendarService.getUpcomingEvents(limit);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      return [];
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        loading,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventsByType,
        getUpcomingEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
