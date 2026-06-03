import { supabase } from '../lib/supabase';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '../lib/database.types';

export async function getCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }

  return data || [];
}

export async function createCalendarEvent(
  event: CalendarEventInsert
): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(event)
    .select()
    .single();

  if (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }

  return data;
}

export async function updateCalendarEvent(
  id: string,
  updates: CalendarEventUpdate
): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }

  return data;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }

  return true;
}

export async function getEventById(id: string): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function getEventsByType(
  eventType: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarEvent[]> {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('event_type', eventType);

  if (startDate) {
    query = query.gte('start_time', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('start_time', endDate.toISOString());
  }

  const { data, error } = await query.order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching events by type:', error);
    return [];
  }

  return data || [];
}

export async function getUpcomingEvents(limit: number = 10): Promise<CalendarEvent[]> {
  const now = new Date();

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('start_time', now.toISOString())
    .order('start_time', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data || [];
}