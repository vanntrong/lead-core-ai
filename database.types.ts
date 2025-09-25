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
      invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          billing_reason: string | null
          charge_id: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          hosted_invoice_url: string | null
          id: string
          invoice_pdf: string | null
          payment_intent_id: string | null
          period_end: string | null
          period_start: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          status: Database["public"]["Enums"]["invoice_status"] | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          billing_reason?: string | null
          charge_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          hosted_invoice_url?: string | null
          id: string
          invoice_pdf?: string | null
          payment_intent_id?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          billing_reason?: string | null
          charge_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          payment_intent_id?: string | null
          period_end?: string | null
          period_start?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          enrich_info: Json | null
          flagged: boolean
          id: string
          scrap_info: Json | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          url: string
          user_id: string
          verify_email_info: Json | null
          verify_email_status: Database["public"]["Enums"]["verify_email_status"]
        }
        Insert: {
          created_at?: string
          enrich_info?: Json | null
          flagged?: boolean
          id?: string
          scrap_info?: Json | null
          source: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          url: string
          user_id: string
          verify_email_info?: Json | null
          verify_email_status?: Database["public"]["Enums"]["verify_email_status"]
        }
        Update: {
          created_at?: string
          enrich_info?: Json | null
          flagged?: boolean
          id?: string
          scrap_info?: Json | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          url?: string
          user_id?: string
          verify_email_info?: Json | null
          verify_email_status?: Database["public"]["Enums"]["verify_email_status"]
        }
        Relationships: []
      }
      proxy_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          proxy_host: string
          proxy_ip: string | null
          proxy_port: number
          status: Database["public"]["Enums"]["proxy_status"]
          updated_at: string
          web_source: Database["public"]["Enums"]["lead_source"]
          web_url: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          proxy_host: string
          proxy_ip?: string | null
          proxy_port: number
          status: Database["public"]["Enums"]["proxy_status"]
          updated_at?: string
          web_source: Database["public"]["Enums"]["lead_source"]
          web_url: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          proxy_host?: string
          proxy_ip?: string | null
          proxy_port?: number
          status?: Database["public"]["Enums"]["proxy_status"]
          updated_at?: string
          web_source?: Database["public"]["Enums"]["lead_source"]
          web_url?: string
        }
        Relationships: []
      }
      scraper_logs: {
        Row: {
          created_at: string
          duration: number | null
          error: string | null
          id: string
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["scraper_status"]
          timestamp: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          error?: string | null
          id?: string
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["scraper_status"]
          timestamp?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          error?: string | null
          id?: string
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["scraper_status"]
          timestamp?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["stripe_customer_status"]
          stripe_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["stripe_customer_status"]
          stripe_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["stripe_customer_status"]
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          stripe_price_id: string
          stripe_subscription_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          usage_limit_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          stripe_price_id: string
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          usage_limit_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          stripe_price_id?: string
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          usage_limit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_usage_limit_id_fkey"
            columns: ["usage_limit_id"]
            isOneToOne: false
            referencedRelation: "usage_limits"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          created_at: string
          current_leads: number
          export_enabled: boolean
          id: string
          max_leads: number | null
          period_end: string | null
          period_start: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          sources: Database["public"]["Enums"]["source_type"][] | null
          updated_at: string
          user_id: string
          zapier_export: boolean
        }
        Insert: {
          created_at?: string
          current_leads?: number
          export_enabled?: boolean
          id?: string
          max_leads?: number | null
          period_end?: string | null
          period_start?: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          sources?: Database["public"]["Enums"]["source_type"][] | null
          updated_at?: string
          user_id: string
          zapier_export?: boolean
        }
        Update: {
          created_at?: string
          current_leads?: number
          export_enabled?: boolean
          id?: string
          max_leads?: number | null
          period_end?: string | null
          period_start?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          sources?: Database["public"]["Enums"]["source_type"][] | null
          updated_at?: string
          user_id?: string
          zapier_export?: boolean
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
    }
    Enums: {
      invoice_status: "draft" | "open" | "paid" | "uncollectible" | "void"
      lead_source: "shopify" | "etsy" | "g2" | "woocommerce"
      lead_status:
        | "pending"
        | "scraped"
        | "enriching"
        | "enriched"
        | "failed"
        | "scrap_failed"
      plan_tier: "basic" | "pro" | "unlimited"
      proxy_status: "success" | "failed" | "banned" | "timeout"
      scraper_status: "success" | "fail"
      source_type: "etsy" | "woocommerce" | "shopify" | "g2"
      stripe_customer_status: "active" | "inactive" | "canceled"
      subscription_status: "active" | "canceled" | "unpaid"
      verify_email_status: "pending" | "verified" | "failed" | "invalid"
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
      invoice_status: ["draft", "open", "paid", "uncollectible", "void"],
      lead_source: ["shopify", "etsy", "g2", "woocommerce"],
      lead_status: [
        "pending",
        "scraped",
        "enriching",
        "enriched",
        "failed",
        "scrap_failed",
      ],
      plan_tier: ["basic", "pro", "unlimited"],
      proxy_status: ["success", "failed", "banned", "timeout"],
      scraper_status: ["success", "fail"],
      source_type: ["etsy", "woocommerce", "shopify", "g2"],
      stripe_customer_status: ["active", "inactive", "canceled"],
      subscription_status: ["active", "canceled", "unpaid"],
      verify_email_status: ["pending", "verified", "failed", "invalid"],
    },
  },
} as const
