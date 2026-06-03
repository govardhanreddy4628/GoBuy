import express from 'express';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventById,
  getEventsByType,
  getUpcomingEvents,
} from '../controllers/calendarController.js';

const calendarRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// CRUD routes
calendarRouter.get('/', getCalendarEvents); // with startDate & endDate query params
calendarRouter.post('/', createCalendarEvent);
calendarRouter.get('/upcoming', getUpcomingEvents);
calendarRouter.put('/:id', asyncHandler(updateCalendarEvent));
calendarRouter.delete('/:id', asyncHandler(deleteCalendarEvent));
calendarRouter.get('/:id', asyncHandler(getEventById));
calendarRouter.get('/type/:eventType', getEventsByType);

export default calendarRouter;
