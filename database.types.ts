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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      pricing_plans: {
        Row: {
          id: string
          name: string
          tier: "basic" | "pro" | "unlimited"
          price_monthly: number
          description: string | null
          features: Json
          limits: Json
          stripe_price_id: string | null
          stripe_product_id: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tier: "basic" | "pro" | "unlimited"
          price_monthly: number
          description?: string | null
          features?: Json
          limits?: Json
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tier?: "basic" | "pro" | "unlimited"
          price_monthly?: number
          description?: string | null
          features?: Json
          limits?: Json
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          pricing_plan_id: string | null
          plan_tier: "basic" | "pro" | "unlimited"
          price_monthly: number
          status: "active" | "canceled" | "unpaid" | "trialing" | "past_due"
          leads_per_month: number | null
          sources: string[] | null
          features: string[] | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          stripe_customer_id: string | null
          started_at: string
          trial_end: string | null
          current_period_start: string | null
          current_period_end: string | null
          canceled_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pricing_plan_id?: string | null
          plan_tier: "basic" | "pro" | "unlimited"
          price_monthly: number
          status?: "active" | "canceled" | "unpaid" | "trialing" | "past_due"
          leads_per_month?: number | null
          sources?: string[] | null
          features?: string[] | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          stripe_customer_id?: string | null
          started_at?: string
          trial_end?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pricing_plan_id?: string | null
          plan_tier?: "basic" | "pro" | "unlimited"
          price_monthly?: number
          status?: "active" | "canceled" | "unpaid" | "trialing" | "past_due"
          leads_per_month?: number | null
          sources?: string[] | null
          features?: string[] | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          stripe_customer_id?: string | null
          started_at?: string
          trial_end?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      enrich_jobs: {
        Row: {
          created_at: string
          enrich_info: Json | null
          id: string
          scrap_info: Json | null
          source: string | null
          status: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          enrich_info?: Json | null
          id?: string
          scrap_info?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          enrich_info?: Json | null
          id?: string
          scrap_info?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          enrich_info: Json | null
          id: string
          scrap_info: Json | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          url: string
          user_id: string
          verify_email_status: Database["public"]["Enums"]["verify_email_status"]
        }
        Insert: {
          created_at?: string
          enrich_info?: Json | null
          id?: string
          scrap_info?: Json | null
          source: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          url: string
          user_id: string
          verify_email_status?: Database["public"]["Enums"]["verify_email_status"]
        }
        Update: {
          created_at?: string
          enrich_info?: Json | null
          id?: string
          scrap_info?: Json | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          url?: string
          user_id?: string
          verify_email_status?: Database["public"]["Enums"]["verify_email_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_users_with_available_enrich_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
        }[]
      }
      get_user_subscription_limits: {
        Args: {
          user_id_param: string
        }
        Returns: Json
      }
      can_user_perform_action: {
        Args: {
          user_id_param: string
          action_type: string
          current_usage?: Json
        }
        Returns: boolean
      }
      get_user_active_subscription: {
        Args: {
          user_id_param: string
        }
        Returns: {
          subscription_id: string
          plan_tier: string
          price_monthly: number
          status: string
          limits: Json
          features: Json
          trial_end: string | null
          current_period_end: string | null
        }[]
      }
      is_subscription_active: {
        Args: {
          user_id_param: string
        }
        Returns: boolean
      }
      create_subscription_from_plan: {
        Args: {
          user_id_param: string
          pricing_plan_id_param: string
          stripe_subscription_id_param?: string
          trial_days?: number
        }
        Returns: string
      }
      update_subscription_status: {
        Args: {
          stripe_subscription_id_param: string
          new_status: string
          current_period_start_param?: string
          current_period_end_param?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      lead_source: "shopify" | "etsy" | "g2" | "woocommerce"
      lead_status:
      | "pending"
      | "scraped"
      | "enriching"
      | "enriched"
      | "failed"
      | "scrap_failed"
      verify_email_status: "pending" | "verified" | "failed"
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
      lead_source: ["shopify", "etsy", "g2", "woocommerce"],
      lead_status: [
        "pending",
        "scraped",
        "enriching",
        "enriched",
        "failed",
        "scrap_failed",
      ],
      verify_email_status: ["pending", "verified", "failed"],
    },
  },
} as const
