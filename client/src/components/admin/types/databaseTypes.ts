export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      payments: {
        Row: {
          id: string
          user_id: string
          order_id: string
          customer_name: string
          customer_email: string
          amount: number
          currency: string
          payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'other'
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          transaction_id: string
          payment_date: string
          description: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          customer_name: string
          customer_email: string
          amount: number
          currency?: string
          payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'other'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          transaction_id?: string
          payment_date?: string
          description?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string
          customer_name?: string
          customer_email?: string
          amount?: number
          currency?: string
          payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'other'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          transaction_id?: string
          payment_date?: string
          description?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          sku: string
          category: string
          price: number
          cost: number
          stock_quantity: number
          low_stock_threshold: number
          supplier: string
          brand: string
          status: 'active' | 'inactive' | 'discontinued'
          image_url: string
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          sku: string
          category?: string
          price: number
          cost?: number
          stock_quantity?: number
          low_stock_threshold?: number
          supplier?: string
          brand?: string
          status?: 'active' | 'inactive' | 'discontinued'
          image_url?: string
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          sku?: string
          category?: string
          price?: number
          cost?: number
          stock_quantity?: number
          low_stock_threshold?: number
          supplier?: string
          brand?: string
          status?: 'active' | 'inactive' | 'discontinued'
          image_url?: string
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          event_type: 'promotion' | 'delivery' | 'meeting' | 'task' | 'order_deadline' | 'inventory_check' | 'other'
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          color: string
          all_day: boolean
          location: string
          reminder_minutes: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          start_time: string
          end_time: string
          event_type?: 'promotion' | 'delivery' | 'meeting' | 'task' | 'order_deadline' | 'inventory_check' | 'other'
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          color?: string
          all_day?: boolean
          location?: string
          reminder_minutes?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          event_type?: 'promotion' | 'delivery' | 'meeting' | 'task' | 'order_deadline' | 'inventory_check' | 'other'
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          color?: string
          all_day?: boolean
          location?: string
          reminder_minutes?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];
