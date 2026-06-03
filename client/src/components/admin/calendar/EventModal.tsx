import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Tag, AlertCircle, FileText } from 'lucide-react';
import type { CalendarEvent } from '../types/calendar';
import { formatDate, formatTime, parseISODate } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent | CalendarEvent) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
  initialHour?: number;
  //userId?: string;
}

const EVENT_TYPES = [
  { value: 'task', label: 'Task', color: '#3b82f6' },
  { value: 'meeting', label: 'Meeting', color: '#8b5cf6' },
  { value: 'promotion', label: 'Promotion', color: '#ec4899' },
  { value: 'delivery', label: 'Delivery', color: '#f59e0b' },
  { value: 'order_deadline', label: 'Order Deadline', color: '#ef4444' },
  { value: 'inventory_check', label: 'Inventory Check', color: '#10b981' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
  initialHour = 9,
  //userId,
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    eventType: 'task',
    status: 'scheduled',
    priority: 'medium',
    color: '#3b82f6',
    allDay: false,
    location: '',
    reminderMinutes: null as number | null,
  });

  useEffect(() => {
    if (event) {
      const startDate = parseISODate(event.start_time);
      const endDate = parseISODate(event.end_time);

      setFormData({
        title: event.title,
        description: event.description,
        startDate: formatDate(startDate),
        startTime: formatTime(startDate),
        endDate: formatDate(endDate),
        endTime: formatTime(endDate),
        eventType: event.event_type,
        status: event.status,
        priority: event.priority,
        color: event.color,
        allDay: event.all_day,
        location: event.location,
        reminderMinutes: event.reminder_minutes,
      });
    } else if (initialDate) {
      const start = new Date(initialDate);
      start.setHours(initialHour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(initialHour + 1, 0, 0, 0);

      setFormData(prev => ({
        ...prev,
        startDate: formatDate(start),
        startTime: formatTime(start),
        endDate: formatDate(end),
        endTime: formatTime(end),
      }));
    }
  }, [event, initialDate, initialHour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start_time = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
    const end_time = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

    onSave({
      //user_id: userId,
      title: formData.title,
      description: formData.description,
      start_time,
      end_time,
      event_type: formData.eventType,
      status: formData.status,
      priority: formData.priority,
      color: formData.color,
      all_day: formData.allDay,
      location: formData.location,
      reminder_minutes: formData.reminderMinutes,
    } as CalendarEvent);
  };

  const handleEventTypeChange = (type: string) => {
    const eventType = EVENT_TYPES.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      eventType: type,
      color: eventType?.color || prev.color,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                disabled={formData.allDay}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                disabled={formData.allDay}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
              All day event
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Type *
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => handleEventTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder (minutes before)
            </label>
            <input
              type="number"
              value={formData.reminderMinutes || ''}
              onChange={(e) => setFormData({ ...formData, reminderMinutes: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: type.color })}
                  className={`w-10 h-10 rounded-lg transition-transform ${
                    formData.color === type.color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: type.color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {event && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(event._id)}
                className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
