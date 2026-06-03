import { Request, Response } from 'express';
import { CalendarEventModel } from '../models/calendarEventModel.js';


// Get events between two dates
export const getCalendarEvents = async (req: Request, res: Response) => {
  const { start_time, end_time } = req.query;

  try {
    const query: any = {};
    if (start_time) query.start_time = { $gte: new Date(start_time as string) };
    if (end_time) query.start_time = { ...query.start_time, $lte: new Date(end_time as string) };

    const events = await CalendarEventModel.find(query).sort({ start_time: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};


// Create a new event
export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const event = new CalendarEventModel(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating calendar event' });
  }
};

// Update an event
export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedEvent = await CalendarEventModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating calendar event' });
  }
};

// Delete an event
export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CalendarEventModel.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting calendar event' });
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await CalendarEventModel.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// Get events by type (with optional date filters)
export const getEventsByType = async (req: Request, res: Response) => {
  const { eventType } = req.params;
  const { start_time, end_time } = req.query;

  try {
    const query: any = { event_type: eventType };
    if (start_time) query.start_time = { $gte: new Date(start_time as string) };
    if (end_time) query.start_time = { ...query.start_time, $lte: new Date(end_time as string) };

    const events = await CalendarEventModel.find(query).sort({ start_time: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events by type' });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const now = new Date();

    const events = await CalendarEventModel.find({ start_time: { $gte: now } })
      .sort({ start_time: 1 })
      .limit(limit);

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching upcoming events' });
  }
};
