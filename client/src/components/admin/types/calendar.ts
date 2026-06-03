export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface CalendarEvent {
          _id: string;
          user_id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          event_type: 'promotion' | 'delivery' | 'meeting' | 'task' | 'order_deadline' | 'inventory_check' | 'other';
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          color: string;
          all_day: boolean;
          location: string;
          reminder_minutes: number | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
}