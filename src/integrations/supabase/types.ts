export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          reminder_type: string
          salon_id: string | null
          scheduled_time: string
          sent_at: string | null
          status: string
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          reminder_type: string
          salon_id?: string | null
          scheduled_time: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          reminder_type?: string
          salon_id?: string | null
          scheduled_time?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          service_duration: number
          service_name: string
          service_price: number
          staff_id: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          service_duration?: number
          service_name: string
          service_price: number
          staff_id?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          service_duration?: number
          service_name?: string
          service_price?: number
          staff_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string | null
          client_name: string
          client_phone: string | null
          color: string | null
          created_at: string | null
          date: string
          duration: number | null
          end_time: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          price: number | null
          salon_id: string | null
          service: string
          staff_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          color?: string | null
          created_at?: string | null
          date: string
          duration?: number | null
          end_time: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          salon_id?: string | null
          service: string
          staff_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          color?: string | null
          created_at?: string | null
          date?: string
          duration?: number | null
          end_time?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          salon_id?: string | null
          service?: string
          staff_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      business_analytics: {
        Row: {
          cancelled_appointments: number | null
          completed_appointments: number | null
          created_at: string | null
          daily_revenue: number | null
          date: string
          id: string
          new_clients: number | null
          no_show_appointments: number | null
          returning_clients: number | null
          salon_id: string
          total_appointments: number | null
        }
        Insert: {
          cancelled_appointments?: number | null
          completed_appointments?: number | null
          created_at?: string | null
          daily_revenue?: number | null
          date: string
          id?: string
          new_clients?: number | null
          no_show_appointments?: number | null
          returning_clients?: number | null
          salon_id: string
          total_appointments?: number | null
        }
        Update: {
          cancelled_appointments?: number | null
          completed_appointments?: number | null
          created_at?: string | null
          daily_revenue?: number | null
          date?: string
          id?: string
          new_clients?: number | null
          no_show_appointments?: number | null
          returning_clients?: number | null
          salon_id?: string
          total_appointments?: number | null
        }
        Relationships: []
      }
      client_payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          salon_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          salon_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          salon_id?: string
        }
        Relationships: []
      }
      client_sessions: {
        Row: {
          client_id: string
          created_at: string | null
          expires_at: string
          id: string
          last_accessed: string | null
          session_token: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          last_accessed?: string | null
          session_token: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          last_accessed?: string | null
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_staff: string | null
          client_id: string | null
          client_password: string | null
          created_at: string | null
          email: string
          id: string
          is_portal_enabled: boolean | null
          last_visit: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_stylist: string | null
          salon_id: string | null
          status: string | null
          tags: string | null
          total_spent: number | null
          updated_at: string | null
          visits: number | null
        }
        Insert: {
          assigned_staff?: string | null
          client_id?: string | null
          client_password?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_portal_enabled?: boolean | null
          last_visit?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_stylist?: string | null
          salon_id?: string | null
          status?: string | null
          tags?: string | null
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Update: {
          assigned_staff?: string | null
          client_id?: string | null
          client_password?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_portal_enabled?: boolean | null
          last_visit?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_stylist?: string | null
          salon_id?: string | null
          status?: string | null
          tags?: string | null
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_accounts: {
        Row: {
          account_name: string
          account_type: string
          created_at: string
          current_balance: number
          id: string
          is_active: boolean
          salon_id: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_type: string
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          salon_id: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_type?: string
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          salon_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_analytics: {
        Row: {
          created_at: string
          id: string
          net_profit: number
          period_end: string
          period_start: string
          period_type: string
          profit_margin: number
          salon_id: string
          total_expenses: number
          total_income: number
          transaction_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          net_profit?: number
          period_end: string
          period_start: string
          period_type: string
          profit_margin?: number
          salon_id: string
          total_expenses?: number
          total_income?: number
          transaction_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          net_profit?: number
          period_end?: string
          period_start?: string
          period_type?: string
          profit_margin?: number
          salon_id?: string
          total_expenses?: number
          total_income?: number
          transaction_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          category_name: string
          category_type: string
          created_at: string
          id: string
          is_default: boolean | null
          salon_id: string
        }
        Insert: {
          category_name: string
          category_type: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          salon_id: string
        }
        Update: {
          category_name?: string
          category_type?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          salon_id?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string
          client_name: string | null
          created_at: string
          description: string | null
          id: string
          invoice_id: string | null
          is_tip: boolean | null
          payment_method: string
          salon_id: string
          staff_id: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          is_tip?: boolean | null
          payment_method?: string
          salon_id: string
          staff_id?: string | null
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          is_tip?: boolean | null
          payment_method?: string
          salon_id?: string
          staff_id?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          payment_method: string | null
          product_sale_id: string | null
          reference_id: string | null
          reference_type: string | null
          salon_id: string
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          product_sale_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          salon_id: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          product_sale_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          salon_id?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_product_sale_id_fkey"
            columns: ["product_sale_id"]
            isOneToOne: false
            referencedRelation: "product_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          cost_price: number | null
          created_at: string
          current_stock: number
          description: string | null
          id: string
          is_active: boolean
          last_restocked_at: string | null
          maximum_stock: number | null
          minimum_stock: number
          name: string
          salon_id: string
          selling_price: number | null
          sku: string | null
          supplier_contact: string | null
          supplier_name: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          last_restocked_at?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          name: string
          salon_id: string
          selling_price?: number | null
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          cost_price?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          last_restocked_at?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          name?: string
          salon_id?: string
          selling_price?: number | null
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_sales: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          payment_method: string | null
          profit: number
          quantity: number
          sale_date: string
          salon_id: string
          total_cost: number
          total_revenue: number
          transaction_id: string | null
          unit_cost: number
          unit_selling_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          payment_method?: string | null
          profit?: number
          quantity?: number
          sale_date?: string
          salon_id: string
          total_cost?: number
          total_revenue?: number
          transaction_id?: string | null
          unit_cost?: number
          unit_selling_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          payment_method?: string | null
          profit?: number
          quantity?: number
          sale_date?: string
          salon_id?: string
          total_cost?: number
          total_revenue?: number
          transaction_id?: string | null
          unit_cost?: number
          unit_selling_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cost_price: number | null
          created_at: string | null
          current_stock: number
          description: string | null
          id: string
          is_active: boolean
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          salon_id: string
          selling_price: number
          sku: string | null
          supplier_contact: string | null
          supplier_name: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          salon_id: string
          selling_price?: number
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          salon_id?: string
          selling_price?: number
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          closing_hours: string | null
          created_at: string | null
          description: string | null
          email: string
          full_name: string | null
          id: string
          opening_hours: string | null
          phone: string | null
          role: string | null
          salon_name: string | null
          social_media: Json | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string | null
          website: string | null
          working_days: string[] | null
        }
        Insert: {
          address?: string | null
          closing_hours?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          full_name?: string | null
          id: string
          opening_hours?: string | null
          phone?: string | null
          role?: string | null
          salon_name?: string | null
          social_media?: Json | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website?: string | null
          working_days?: string[] | null
        }
        Update: {
          address?: string | null
          closing_hours?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          full_name?: string | null
          id?: string
          opening_hours?: string | null
          phone?: string | null
          role?: string | null
          salon_name?: string | null
          social_media?: Json | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website?: string | null
          working_days?: string[] | null
        }
        Relationships: []
      }
      receipt_templates: {
        Row: {
          created_at: string
          footer_text: string | null
          header_text: string | null
          id: string
          include_salon_info: boolean | null
          include_service_details: boolean | null
          include_staff_name: boolean | null
          is_default: boolean | null
          logo_url: string | null
          salon_id: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          include_salon_info?: boolean | null
          include_service_details?: boolean | null
          include_staff_name?: boolean | null
          is_default?: boolean | null
          logo_url?: string | null
          salon_id: string
          template_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          include_salon_info?: boolean | null
          include_service_details?: boolean | null
          include_staff_name?: boolean | null
          is_default?: boolean | null
          logo_url?: string | null
          salon_id?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          auto_send: boolean | null
          auto_send_enabled: boolean
          created_at: string
          follow_up_enabled: boolean | null
          follow_up_template: string | null
          id: string
          message_template: string
          optimal_send_time: string | null
          reminder_timing: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          auto_send?: boolean | null
          auto_send_enabled?: boolean
          created_at?: string
          follow_up_enabled?: boolean | null
          follow_up_template?: string | null
          id?: string
          message_template?: string
          optimal_send_time?: string | null
          reminder_timing?: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          auto_send?: boolean | null
          auto_send_enabled?: boolean
          created_at?: string
          follow_up_enabled?: boolean | null
          follow_up_template?: string | null
          id?: string
          message_template?: string
          optimal_send_time?: string | null
          reminder_timing?: string
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_settings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          area: Database["public"]["Enums"]["permission_area"]
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          area: Database["public"]["Enums"]["permission_area"]
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          area?: Database["public"]["Enums"]["permission_area"]
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: number
          id: string
          is_active: boolean
          name: string
          popular: boolean
          price: number
          salon_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          name: string
          popular?: boolean
          price?: number
          salon_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          name?: string
          popular?: boolean
          price?: number
          salon_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          break_end: string | null
          break_start: string | null
          commission_rate: number | null
          created_at: string | null
          efficiency: number | null
          email: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          image_url: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          salon_id: string | null
          specialties: string[] | null
          staff_code: string | null
          staff_login_id: string | null
          staff_login_password: string | null
          status: string | null
          updated_at: string | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          commission_rate?: number | null
          created_at?: string | null
          efficiency?: number | null
          email?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          salon_id?: string | null
          specialties?: string[] | null
          staff_code?: string | null
          staff_login_id?: string | null
          staff_login_password?: string | null
          status?: string | null
          updated_at?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          commission_rate?: number | null
          created_at?: string | null
          efficiency?: number | null
          email?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          salon_id?: string | null
          specialties?: string[] | null
          staff_code?: string | null
          staff_login_id?: string | null
          staff_login_password?: string | null
          status?: string | null
          updated_at?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_availability: {
        Row: {
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          is_available: boolean | null
          reason: string | null
          salon_id: string
          staff_id: string
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          reason?: string | null
          salon_id: string
          staff_id: string
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          reason?: string | null
          salon_id?: string
          staff_id?: string
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_performance: {
        Row: {
          appointments_completed: number | null
          created_at: string | null
          id: string
          month: string
          new_clients: number | null
          regular_clients: number | null
          salon_id: string
          staff_id: string
          total_clients: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          appointments_completed?: number | null
          created_at?: string | null
          id?: string
          month: string
          new_clients?: number | null
          regular_clients?: number | null
          salon_id: string
          staff_id: string
          total_clients?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          appointments_completed?: number | null
          created_at?: string | null
          id?: string
          month?: string
          new_clients?: number | null
          regular_clients?: number | null
          salon_id?: string
          staff_id?: string
          total_clients?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          notes: string | null
          reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          salon_id: string
          staff_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salon_id: string
          staff_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salon_id?: string
          staff_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_requests_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          salon_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          salon_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          salon_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          client_id: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          is_blocked: boolean | null
          is_business: boolean | null
          last_seen: string | null
          phone_number: string
          profile_pic_url: string | null
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_business?: boolean | null
          last_seen?: string | null
          phone_number: string
          profile_pic_url?: string | null
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_business?: boolean | null
          last_seen?: string | null
          phone_number?: string
          profile_pic_url?: string | null
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_message_queue: {
        Row: {
          appointment_id: string | null
          attempts: number | null
          created_at: string | null
          error_message: string | null
          id: string
          max_attempts: number | null
          message_content: string
          message_type: string | null
          priority: number | null
          recipient_phone: string
          reminder_type: string | null
          salon_id: string
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          message_content: string
          message_type?: string | null
          priority?: number | null
          recipient_phone: string
          reminder_type?: string | null
          salon_id: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          message_content?: string
          message_type?: string | null
          priority?: number | null
          recipient_phone?: string
          reminder_type?: string | null
          salon_id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          appointment_id: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string
          message_type: string | null
          read_at: string | null
          recipient_name: string | null
          recipient_phone: string
          reminder_id: string | null
          salon_id: string
          sent_at: string | null
          status: string | null
          updated_at: string
          whatsapp_message_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          message_type?: string | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone: string
          reminder_id?: string | null
          salon_id: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: string | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          reminder_id?: string | null
          salon_id?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string
          whatsapp_message_id?: string | null
        }
        Relationships: []
      }
      whatsapp_session_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          salon_id: string
          severity: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          salon_id: string
          severity?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          salon_id?: string
          severity?: string | null
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          access_token: string | null
          business_account_id: string | null
          client_info: Json | null
          connection_state: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_activity: string | null
          last_connected_at: string | null
          last_seen: string | null
          max_verification_attempts: number | null
          messages_sent_today: number | null
          phone_number: string | null
          phone_verified: boolean | null
          rate_limit_reset: string | null
          salon_id: string
          session_data: Json | null
          updated_at: string | null
          verification_attempts: number | null
          verification_code: string | null
          verification_expires_at: string | null
          webhook_url: string | null
          webjs_session_data: Json | null
        }
        Insert: {
          access_token?: string | null
          business_account_id?: string | null
          client_info?: Json | null
          connection_state?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_activity?: string | null
          last_connected_at?: string | null
          last_seen?: string | null
          max_verification_attempts?: number | null
          messages_sent_today?: number | null
          phone_number?: string | null
          phone_verified?: boolean | null
          rate_limit_reset?: string | null
          salon_id: string
          session_data?: Json | null
          updated_at?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verification_expires_at?: string | null
          webhook_url?: string | null
          webjs_session_data?: Json | null
        }
        Update: {
          access_token?: string | null
          business_account_id?: string | null
          client_info?: Json | null
          connection_state?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_activity?: string | null
          last_connected_at?: string | null
          last_seen?: string | null
          max_verification_attempts?: number | null
          messages_sent_today?: number | null
          phone_number?: string | null
          phone_verified?: boolean | null
          rate_limit_reset?: string | null
          salon_id?: string
          session_data?: Json | null
          updated_at?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verification_expires_at?: string | null
          webhook_url?: string | null
          webjs_session_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_staff: {
        Args: { login_id: string; login_password: string }
        Returns: {
          staff_id: string
          staff_name: string
          staff_email: string
          salon_id: string
          is_valid: boolean
        }[]
      }
      check_reminder_exists: {
        Args: { appointment_id_param: string; reminder_type_param: string }
        Returns: {
          id: string
        }[]
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_whatsapp_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_appointment_reminder: {
        Args: {
          appointment_id_param: string
          reminder_type_param: string
          scheduled_time_param: string
          whatsapp_url_param: string
        }
        Returns: string
      }
      create_reminder_settings: {
        Args: {
          reminder_timing_param: string
          is_enabled_param: boolean
          message_template_param: string
        }
        Returns: {
          id: string
          salon_id: string
          reminder_timing: string
          is_enabled: boolean
          message_template: string
          created_at: string
          updated_at: string
        }[]
      }
      generate_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_client_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_staff_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_staff_login_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_staff_login_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_reminder_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          salon_id: string
          reminder_timing: string
          is_enabled: boolean
          message_template: string
          created_at: string
          updated_at: string
        }[]
      }
      get_appointment_reminders: {
        Args: { status_filter?: string }
        Returns: {
          id: string
          appointment_id: string
          reminder_type: string
          scheduled_time: string
          sent_at: string
          status: string
          whatsapp_url: string
          created_at: string
          updated_at: string
        }[]
      }
      get_reminder_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          salon_id: string
          reminder_timing: string
          is_enabled: boolean
          message_template: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_by_staff_code: {
        Args: { code: string }
        Returns: {
          user_id: string
          email: string
          salon_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string; salon_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_whatsapp_session: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          salon_id: string
          phone_number: string
          is_connected: boolean
          connection_state: string
          qr_code: string
          last_connected_at: string
          last_seen: string
          device_info: Json
        }[]
      }
      has_permission: {
        Args: {
          user_id: string
          salon_id: string
          area: Database["public"]["Enums"]["permission_area"]
          action: string
        }
        Returns: boolean
      }
      reset_daily_message_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_reminder_settings: {
        Args: {
          reminder_timing_param: string
          is_enabled_param: boolean
          message_template_param: string
        }
        Returns: {
          id: string
          salon_id: string
          reminder_timing: string
          is_enabled: boolean
          message_template: string
          created_at: string
          updated_at: string
        }[]
      }
      update_reminder_status: {
        Args: { reminder_id: string; new_status: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "salon_owner" | "manager" | "staff" | "receptionist"
      permission_area:
        | "dashboard"
        | "appointments"
        | "clients"
        | "staff_management"
        | "services"
        | "inventory"
        | "reports"
        | "settings"
        | "schedule_management"
        | "time_off_requests"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["salon_owner", "manager", "staff", "receptionist"],
      permission_area: [
        "dashboard",
        "appointments",
        "clients",
        "staff_management",
        "services",
        "inventory",
        "reports",
        "settings",
        "schedule_management",
        "time_off_requests",
      ],
    },
  },
} as const
