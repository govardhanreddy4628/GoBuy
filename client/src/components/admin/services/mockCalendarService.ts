import { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from "../types/databaseTypes";


const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    user_id: 'demo-user-id',
    title: 'Product Launch Meeting',
    description: 'Discuss Q4 product launch strategy',
    start_time: new Date(2025, 9, 15, 10, 0).toISOString(),
    end_time: new Date(2025, 9, 15, 11, 30).toISOString(),
    event_type: 'meeting',
    status: 'scheduled',
    priority: 'high',
    color: '#8b5cf6',
    all_day: false,
    location: 'Conference Room A',
    reminder_minutes: 30,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user-id',
    title: 'Black Friday Promotion',
    description: 'Start Black Friday sale campaign',
    start_time: new Date(2025, 9, 25, 0, 0).toISOString(),
    end_time: new Date(2025, 9, 25, 23, 59).toISOString(),
    event_type: 'promotion',
    status: 'scheduled',
    priority: 'urgent',
    color: '#ec4899',
    all_day: true,
    location: '',
    reminder_minutes: 1440,
    metadata: { discount: '50%' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user-id',
    title: 'Inventory Check',
    description: 'Monthly inventory audit',
    start_time: new Date(2025, 9, 20, 9, 0).toISOString(),
    end_time: new Date(2025, 9, 20, 17, 0).toISOString(),
    event_type: 'inventory_check',
    status: 'scheduled',
    priority: 'medium',
    color: '#10b981',
    all_day: false,
    location: 'Warehouse',
    reminder_minutes: 60,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'demo-user-id',
    title: 'Supplier Delivery',
    description: 'New stock arrival from supplier',
    start_time: new Date(2025, 9, 18, 14, 0).toISOString(),
    end_time: new Date(2025, 9, 18, 15, 0).toISOString(),
    event_type: 'delivery',
    status: 'scheduled',
    priority: 'high',
    color: '#f59e0b',
    all_day: false,
    location: 'Loading Dock',
    reminder_minutes: 120,
    metadata: { supplier: 'ABC Corp' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockEvents.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= startDate && eventDate <= endDate;
      });
      resolve(filtered);
    }, 300);
  });
}

export async function createCalendarEvent(
  event: CalendarEventInsert
): Promise<CalendarEvent | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent: CalendarEvent = {
        ...event,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: event.description || '',
        event_type: event.event_type || 'task',
        status: event.status || 'scheduled',
        priority: event.priority || 'medium',
        color: event.color || '#3b82f6',
        all_day: event.all_day || false,
        location: event.location || '',
        metadata: event.metadata || {},
      };
      mockEvents.push(newEvent);
      resolve(newEvent);
    }, 300);
  });
}

export async function updateCalendarEvent(
  id: string,
  updates: CalendarEventUpdate
): Promise<CalendarEvent | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEvents[index] = {
          ...mockEvents[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        resolve(mockEvents[index]);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEvents.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

export async function getEventById(id: string): Promise<CalendarEvent | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.id === id);
      resolve(event || null);
    }, 300);
  });
}

export async function getEventsByType(
  eventType: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockEvents.filter(e => e.event_type === eventType);

      if (startDate) {
        filtered = filtered.filter(e => new Date(e.start_time) >= startDate);
      }

      if (endDate) {
        filtered = filtered.filter(e => new Date(e.start_time) <= endDate);
      }

      resolve(filtered);
    }, 300);
  });
}

export async function getUpcomingEvents(limit: number = 10): Promise<CalendarEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      const upcoming = mockEvents
        .filter(e => new Date(e.start_time) >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, limit);
      resolve(upcoming);
    }, 300);
  });
}
