// services/calendarService.ts
import axios from 'axios';
import type { CalendarEvent } from '../types/calendar';

//const API_BASE = process.env.REACT_APP_API_BASE || '/api/calendar';
const API_BASE = `${import.meta.env.VITE_BACKEND_URL_LOCAL}/api/v1/calendar`;

// Get events between two dates
export async function getCalendarEvents(start?: Date, end?: Date): Promise<CalendarEvent[]> {
  const params: any = {};
  if (start) params.start_time = start.toISOString();
  if (end) params.end_time = end.toISOString();

  const res = await axios.get(`${API_BASE}`, { params });
  return res.data.events; // backend returns { events }
}

// Create a new event
export async function createCalendarEvent(event: Partial<CalendarEvent>) {
  const res = await axios.post(`${API_BASE}`, event);
  return res.data;
}

// Update an event by ID
export async function updateCalendarEvent(id: string, event: Partial<CalendarEvent>) {
  const res = await axios.put(`${API_BASE}/${id}`, event);
  return res.data;
}

// Delete an event by ID
export async function deleteCalendarEvent(id: string) {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data.success; // backend returns { success: true }
}

// Get a single event by ID
export async function getEventById(id: string) {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
}

// Get events by type
export async function getEventsByType(eventType: string, start?: Date, end?: Date) {
  const params: any = {};
  if (start) params.start_time = start.toISOString();
  if (end) params.end_time = end.toISOString();

  const res = await axios.get(`${API_BASE}/type/${eventType}`, { params });
  return res.data; // backend returns an array directly
}

// Get upcoming events
export async function getUpcomingEvents(limit?: number) {
  const params = limit ? { limit } : {};
  const res = await axios.get(`${API_BASE}/upcoming`, { params });
  return res.data || [];
}
