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
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_staff: string | null
          created_at: string | null
          email: string
          id: string
          last_visit: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_stylist: string | null
          status: string | null
          tags: string | null
          total_spent: number | null
          updated_at: string | null
          visits: number | null
        }
        Insert: {
          assigned_staff?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_visit?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_stylist?: string | null
          status?: string | null
          tags?: string | null
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Update: {
          assigned_staff?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_visit?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_stylist?: string | null
          status?: string | null
          tags?: string | null
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Relationships: []
      }
      knowledge: {
        Row: {
          Address: string | null
          email: string
          location: string | null
          name: number
          nots: string | null
          "phone number": string | null
        }
        Insert: {
          Address?: string | null
          email: string
          location?: string | null
          name?: number
          nots?: string | null
          "phone number"?: string | null
        }
        Update: {
          Address?: string | null
          email?: string
          location?: string | null
          name?: number
          nots?: string | null
          "phone number"?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          efficiency: number | null
          email: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          created_at?: string | null
          efficiency?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          created_at?: string | null
          efficiency?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
