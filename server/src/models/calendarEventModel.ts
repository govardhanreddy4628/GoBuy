import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  event_type: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    event_type: { type: String,  enum: ['promotion', 'delivery', 'meeting', 'task', 'order_deadline', 'inventory_check', 'other'], default: 'meeting' },
    location: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
    color: { type: String, default: '#3b82f6' },
    all_day: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    reminder_minutes: { type: Number, default: null },
    user_id: { type: String, required: false },      //make required: true later
  },
  { timestamps: true }
);

export const CalendarEventModel = mongoose.model<ICalendarEvent>(
  'CalendarEvent',
  CalendarEventSchema
);
