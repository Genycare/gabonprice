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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      price_history: {
        Row: {
          id: string
          median_price: number
          product_id: string
          recorded_on: string
        }
        Insert: {
          id?: string
          median_price: number
          product_id: string
          recorded_on?: string
        }
        Update: {
          id?: string
          median_price?: number
          product_id?: string
          recorded_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_ratings: {
        Row: {
          created_at: string
          id: string
          price_id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_id: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_ratings_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_reports: {
        Row: {
          created_at: string
          id: string
          price_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_id: string
          reason: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price_id?: string
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_reports_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          amount: number
          city: string
          created_at: string
          helpful_votes: number
          id: string
          is_median_outlier: boolean
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          photo_url: string | null
          product_id: string
          province: string
          purchase_date: string
          status: string
          store_name: string
          unhelpful_votes: number
          user_id: string
        }
        Insert: {
          amount: number
          city: string
          created_at?: string
          helpful_votes?: number
          id?: string
          is_median_outlier?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          photo_url?: string | null
          product_id: string
          province: string
          purchase_date: string
          status?: string
          store_name: string
          unhelpful_votes?: number
          user_id: string
        }
        Update: {
          amount?: number
          city?: string
          created_at?: string
          helpful_votes?: number
          id?: string
          is_median_outlier?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          photo_url?: string | null
          product_id?: string
          province?: string
          purchase_date?: string
          status?: string
          store_name?: string
          unhelpful_votes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          median_price: number | null
          name: string
          price_trend_7d: number | null
          search_vector: unknown
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          median_price?: number | null
          name: string
          price_trend_7d?: number | null
          search_vector?: unknown
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          median_price?: number | null
          name?: string
          price_trend_7d?: number | null
          search_vector?: unknown
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          is_banned: boolean
          karma_score: number
          level: string
          preferred_province: string | null
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean
          is_banned?: boolean
          karma_score?: number
          level?: string
          preferred_province?: string | null
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          is_banned?: boolean
          karma_score?: number
          level?: string
          preferred_province?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_ban_user: { Args: { p_user_id: string }; Returns: undefined }
      admin_delete_price: { Args: { p_price_id: string }; Returns: undefined }
      admin_get_stats: { Args: never; Returns: Json }
      admin_resolve_report: {
        Args: { p_report_id: string }
        Returns: undefined
      }
      admin_restore_price: { Args: { p_price_id: string }; Returns: undefined }
      compute_user_level: { Args: { karma: number }; Returns: string }
      delete_my_account: { Args: never; Returns: undefined }
      get_my_profile: {
        Args: never
        Returns: {
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          is_banned: boolean
          karma_score: number
          level: string
          preferred_province: string | null
          username: string
        }
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      recalc_product_median: {
        Args: { p_product_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
