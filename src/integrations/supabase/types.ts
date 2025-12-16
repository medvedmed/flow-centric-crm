export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_products: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          total_price: number | null
          unit_price: number
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          total_price?: number | null
          unit_price?: number
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          total_price?: number | null
          unit_price?: number
        }
        Relationships: []
      }
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
        Relationships: []
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
          color: string | null
          created_at: string | null
          date: string | null
          duration: number
          end_time: string
          id: string
          notes: string | null
          organization_id: string | null
          service_id: string | null
          staff_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string | null
          date?: string | null
          duration: number
          end_time: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          service_id?: string | null
          staff_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string | null
          date?: string | null
          duration?: number
          end_time?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          service_id?: string | null
          staff_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          salon_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          salon_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          salon_id?: string
          table_name?: string
        }
        Relationships: []
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
      client_retention_analytics: {
        Row: {
          average_days_between_visits: number | null
          client_category: string
          client_id: string
          created_at: string
          days_since_last_visit: number | null
          first_visit_date: string | null
          id: string
          last_visit_date: string | null
          salon_id: string
          staff_id: string | null
          total_spent: number | null
          total_visits: number
          updated_at: string
        }
        Insert: {
          average_days_between_visits?: number | null
          client_category?: string
          client_id: string
          created_at?: string
          days_since_last_visit?: number | null
          first_visit_date?: string | null
          id?: string
          last_visit_date?: string | null
          salon_id: string
          staff_id?: string | null
          total_spent?: number | null
          total_visits?: number
          updated_at?: string
        }
        Update: {
          average_days_between_visits?: number | null
          client_category?: string
          client_id?: string
          created_at?: string
          days_since_last_visit?: number | null
          first_visit_date?: string | null
          id?: string
          last_visit_date?: string | null
          salon_id?: string
          staff_id?: string | null
          total_spent?: number | null
          total_visits?: number
          updated_at?: string
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
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          last_visit_date: string | null
          notes: string | null
          organization_id: string | null
          phone: string
          preferences: Json | null
          status: string | null
          total_spent: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          last_visit_date?: string | null
          notes?: string | null
          organization_id?: string | null
          phone: string
          preferences?: Json | null
          status?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          last_visit_date?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string
          preferences?: Json | null
          status?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      organizations: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          salon_id?: string
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
          barcode: string | null
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          low_stock_threshold: number | null
          name: string
          organization_id: string | null
          price: number
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name: string
          organization_id?: string | null
          price: number
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          organization_id?: string | null
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          color: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          organization_id?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          popular: boolean
          price: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          popular?: boolean
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          popular?: boolean
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
      staff_retention_metrics: {
        Row: {
          created_at: string
          id: string
          loyal_clients: number
          new_clients: number
          period_end: string
          period_start: string
          retention_rate: number
          returning_clients: number
          salon_id: string
          staff_id: string
          total_unique_clients: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          loyal_clients?: number
          new_clients?: number
          period_end: string
          period_start: string
          retention_rate?: number
          returning_clients?: number
          salon_id: string
          staff_id: string
          total_unique_clients?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          loyal_clients?: number
          new_clients?: number
          period_end?: string
          period_start?: string
          retention_rate?: number
          returning_clients?: number
          salon_id?: string
          staff_id?: string
          total_unique_clients?: number
          updated_at?: string
        }
        Relationships: []
      }
      staff_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          organization_id: string | null
          staff_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          organization_id?: string | null
          staff_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          organization_id?: string | null
          staff_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "time_off_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_name: string
          item_type: string
          quantity: number | null
          total_price: number
          transaction_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_name: string
          item_type: string
          quantity?: number | null
          total_price: number
          transaction_id?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          quantity?: number | null
          total_price?: number
          transaction_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          created_at: string | null
          discount: number | null
          id: string
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          payment_status: string | null
          staff_id: string | null
          subtotal: number
          tax: number | null
          total: number
          transaction_date: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          staff_id?: string | null
          subtotal: number
          tax?: number | null
          total: number
          transaction_date?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          created_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          staff_id?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          transaction_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: []
      }
      whatsapp_automation_settings: {
        Row: {
          created_at: string
          custom_reminder_minutes: number | null
          follow_up_delay_hours: number | null
          follow_up_enabled: boolean | null
          follow_up_template: string | null
          id: string
          is_enabled: boolean | null
          message_template_1h: string | null
          message_template_24h: string | null
          message_template_2h: string | null
          reminder_1h_enabled: boolean | null
          reminder_24h_enabled: boolean | null
          reminder_2h_enabled: boolean | null
          salon_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_reminder_minutes?: number | null
          follow_up_delay_hours?: number | null
          follow_up_enabled?: boolean | null
          follow_up_template?: string | null
          id?: string
          is_enabled?: boolean | null
          message_template_1h?: string | null
          message_template_24h?: string | null
          message_template_2h?: string | null
          reminder_1h_enabled?: boolean | null
          reminder_24h_enabled?: boolean | null
          reminder_2h_enabled?: boolean | null
          salon_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_reminder_minutes?: number | null
          follow_up_delay_hours?: number | null
          follow_up_enabled?: boolean | null
          follow_up_template?: string | null
          id?: string
          is_enabled?: boolean | null
          message_template_1h?: string | null
          message_template_24h?: string | null
          message_template_2h?: string | null
          reminder_1h_enabled?: boolean | null
          reminder_24h_enabled?: boolean | null
          reminder_2h_enabled?: boolean | null
          salon_id?: string
          updated_at?: string
        }
        Relationships: []
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
      whatsapp_reminder_queue: {
        Row: {
          appointment_id: string
          attempts: number | null
          client_name: string
          client_phone: string
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number | null
          message_content: string
          reminder_type: string
          salon_id: string
          scheduled_time: string
          sent_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          attempts?: number | null
          client_name: string
          client_phone: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          message_content: string
          reminder_type: string
          salon_id: string
          scheduled_time: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          attempts?: number | null
          client_name?: string
          client_phone?: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          message_content?: string
          reminder_type?: string
          salon_id?: string
          scheduled_time?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string
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
          is_valid: boolean
          salon_id: string
          staff_email: string
          staff_id: string
          staff_name: string
        }[]
      }
      calculate_staff_retention_metrics: {
        Args: { end_date: string; start_date: string; target_salon_id: string }
        Returns: {
          loyal_clients: number
          new_clients: number
          retention_rate: number
          returning_clients: number
          staff_id: string
          staff_name: string
          total_unique_clients: number
        }[]
      }
      check_reminder_exists: {
        Args: { appointment_id_param: string; reminder_type_param: string }
        Returns: {
          id: string
        }[]
      }
      cleanup_expired_verification_codes: { Args: never; Returns: undefined }
      cleanup_old_whatsapp_logs: { Args: never; Returns: undefined }
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
          is_enabled_param: boolean
          message_template_param: string
          reminder_timing_param: string
        }
        Returns: {
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string
          reminder_timing: string
          salon_id: string
          updated_at: string
        }[]
      }
      debug_automation_settings_access: {
        Args: { target_salon_id: string }
        Returns: {
          can_insert: boolean
          can_select: boolean
          can_update: boolean
          current_user_id: string
          settings_count: number
        }[]
      }
      ensure_organization_for_user: {
        Args: never
        Returns: {
          organization_id: string
          organization_name: string
        }[]
      }
      generate_client_id: { Args: never; Returns: string }
      generate_client_password: { Args: never; Returns: string }
      generate_staff_code: { Args: never; Returns: string }
      generate_staff_login_id: { Args: never; Returns: string }
      generate_staff_login_password: { Args: never; Returns: string }
      get_all_reminder_settings: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string
          reminder_timing: string
          salon_id: string
          updated_at: string
        }[]
      }
      get_appointment_reminders: {
        Args: { status_filter?: string }
        Returns: {
          appointment_id: string
          created_at: string
          id: string
          reminder_type: string
          scheduled_time: string
          sent_at: string
          status: string
          updated_at: string
          whatsapp_url: string
        }[]
      }
      get_auth_org_id: { Args: never; Returns: string }
      get_client_category:
        | {
            Args: { visit_count: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_client_category(visit_count => int8), public.get_client_category(visit_count => int4). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { visit_count: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_client_category(visit_count => int8), public.get_client_category(visit_count => int4). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      get_pending_whatsapp_reminders: {
        Args: never
        Returns: {
          appointment_id: string
          client_name: string
          client_phone: string
          id: string
          message_content: string
          reminder_type: string
          salon_id: string
          scheduled_time: string
        }[]
      }
      get_reminder_settings: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string
          reminder_timing: string
          salon_id: string
          updated_at: string
        }[]
      }
      get_reminders_for_processing: {
        Args: never
        Returns: {
          appointment_id: string
          client_name: string
          client_phone: string
          id: string
          message_content: string
          reminder_type: string
          salon_id: string
        }[]
      }
      get_user_by_staff_code: {
        Args: { code: string }
        Returns: {
          email: string
          salon_id: string
          user_id: string
        }[]
      }
      get_user_org_id: { Args: { user_id: string }; Returns: string }
      get_user_role:
        | { Args: { user_id: string }; Returns: string }
        | {
            Args: { salon_id: string; user_id: string }
            Returns: Database["public"]["Enums"]["app_role"]
          }
      get_whatsapp_session: {
        Args: never
        Returns: {
          connection_state: string
          device_info: Json
          id: string
          is_connected: boolean
          last_connected_at: string
          last_seen: string
          phone_number: string
          qr_code: string
          salon_id: string
        }[]
      }
      has_permission: {
        Args: {
          action: string
          area: Database["public"]["Enums"]["permission_area"]
          salon_id: string
          user_id: string
        }
        Returns: boolean
      }
      hash_password: { Args: { password: string }; Returns: string }
      process_whatsapp_reminders: { Args: never; Returns: undefined }
      reset_daily_message_counts: { Args: never; Returns: undefined }
      set_staff_password: {
        Args: { new_password: string; target_staff_id: string }
        Returns: boolean
      }
      update_reminder_after_sending: {
        Args: { error_msg?: string; new_status: string; reminder_id: string }
        Returns: undefined
      }
      update_reminder_settings: {
        Args: {
          is_enabled_param: boolean
          message_template_param: string
          reminder_timing_param: string
        }
        Returns: {
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string
          reminder_timing: string
          salon_id: string
          updated_at: string
        }[]
      }
      update_reminder_status: {
        Args: { new_status: string; reminder_id: string }
        Returns: undefined
      }
      user_has_role: {
        Args: { allowed_roles: string[]; user_id: string }
        Returns: boolean
      }
      verify_password: {
        Args: { hashed_password: string; password: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
