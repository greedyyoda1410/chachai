// This file will be auto-generated from Supabase schema
// For now, we'll define the types manually based on our planned schema

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
      categories: {
        Row: {
          id: string
          name_en: string
          name_bn: string
          icon_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name_en: string
          name_bn: string
          icon_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name_en?: string
          name_bn?: string
          icon_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name_en: string
          name_bn: string
          description_en: string
          description_bn: string
          price: number
          takeaway_price: number
          image_url: string | null
          prep_time_minutes: number
          is_for_sale: boolean
          is_available: boolean
          allow_pickup: boolean
          allow_delivery: boolean
          display_order: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          category_id: string
          name_en: string
          name_bn: string
          description_en: string
          description_bn: string
          price: number
          takeaway_price: number
          image_url?: string | null
          prep_time_minutes: number
          is_for_sale?: boolean
          is_available?: boolean
          allow_pickup?: boolean
          allow_delivery?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          name_en?: string
          name_bn?: string
          description_en?: string
          description_bn?: string
          price?: number
          takeaway_price?: number
          image_url?: string | null
          prep_time_minutes?: number
          is_for_sale?: boolean
          is_available?: boolean
          allow_pickup?: boolean
          allow_delivery?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      add_ons: {
        Row: {
          id: string
          name_en: string
          name_bn: string
          price: number
          group_name_en: string
          group_name_bn: string
          applicable_to_items: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_bn: string
          price: number
          group_name_en: string
          group_name_bn: string
          applicable_to_items?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_bn?: string
          price?: number
          group_name_en?: string
          group_name_bn?: string
          applicable_to_items?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          daily_order_number: number
          order_date: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          order_type: 'pickup' | 'delivery'
          status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          pickup_time: string
          delivery_address: Json | null
          delivery_fee: number
          subtotal: number
          vat_amount: number
          total: number
          payment_method: 'pickup' | 'online'
          payment_status: 'pending' | 'paid' | 'refunded'
          customer_notes: string | null
          estimated_prep_time: number
          received_at: string
          preparing_started_at: string | null
          ready_at: string | null
          collected_at: string | null
          cancelled_at: string | null
          placed_at: string
          completed_at: string | null
          tracking_token: string | null
          tracking_token_expires_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          daily_order_number: number
          order_date: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          order_type: 'pickup' | 'delivery'
          status?: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          pickup_time: string
          delivery_address?: Json | null
          delivery_fee?: number
          subtotal: number
          vat_amount: number
          total: number
          payment_method: 'pickup' | 'online'
          payment_status?: 'pending' | 'paid' | 'refunded'
          customer_notes?: string | null
          estimated_prep_time: number
          received_at?: string
          preparing_started_at?: string | null
          ready_at?: string | null
          collected_at?: string | null
          cancelled_at?: string | null
          placed_at?: string
          completed_at?: string | null
          tracking_token?: string | null
          tracking_token_expires_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          daily_order_number?: number
          order_date?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          order_type?: 'pickup' | 'delivery'
          status?: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          pickup_time?: string
          delivery_address?: Json | null
          delivery_fee?: number
          subtotal?: number
          vat_amount?: number
          total?: number
          payment_method?: 'pickup' | 'online'
          payment_status?: 'pending' | 'paid' | 'refunded'
          customer_notes?: string | null
          estimated_prep_time?: number
          received_at?: string
          preparing_started_at?: string | null
          ready_at?: string | null
          collected_at?: string | null
          cancelled_at?: string | null
          placed_at?: string
          completed_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'admin' | 'staff'
          permissions: Json
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'admin' | 'staff'
          permissions?: Json
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'super_admin' | 'admin' | 'staff'
          permissions?: Json
          is_active?: boolean
          last_login?: string | null
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

