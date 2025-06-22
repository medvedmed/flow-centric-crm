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
      appointments: {
        Row: {
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          date: string
          duration: number | null
          end_time: string
          id: string
          notes: string | null
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
          created_at?: string | null
          date: string
          duration?: number | null
          end_time: string
          id?: string
          notes?: string | null
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
          created_at?: string | null
          date?: string
          duration?: number | null
          end_time?: string
          id?: string
          notes?: string | null
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
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          salon_name: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          salon_name?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          salon_name?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string
          reminder_timing: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          message_template?: string
          reminder_timing?: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          message_template?: string
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
      has_permission: {
        Args: {
          user_id: string
          salon_id: string
          area: Database["public"]["Enums"]["permission_area"]
          action: string
        }
        Returns: boolean
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
