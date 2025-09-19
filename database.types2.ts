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
					id: string;
					name: string;
					tier: 'basic' | 'pro' | 'unlimited';
					price_monthly: number;
					description: string | null;
					features: Json;
					limits: Json;
					stripe_price_id: string | null;
					stripe_product_id: string | null;
					is_active: boolean;
					sort_order: number;
					created_at: string;
					updated_at: string;
				}
				Insert: {
					id?: string;
					name: string;
					tier: 'basic' | 'pro' | 'unlimited';
					price_monthly: number;
					description?: string | null;
					features?: Json;
					limits?: Json;
					stripe_price_id?: string | null;
					stripe_product_id?: string | null;
					is_active?: boolean;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				}
				Update: {
					id?: string;
					name?: string;
					tier?: 'basic' | 'pro' | 'unlimited';
					price_monthly?: number;
					description?: string | null;
					features?: Json;
					limits?: Json;
					stripe_price_id?: string | null;
					stripe_product_id?: string | null;
					is_active?: boolean;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				}
			},
			subscriptions: {
				Row: {
					id: string;
					user_id: string;
					plan_tier: 'basic' | 'pro' | 'unlimited';
					price_monthly: number;
					status: 'active' | 'canceled' | 'unpaid';
					leads_per_month: number | null;
					sources: string[] | null;
					features: string[] | null;
					stripe_price_id: string | null;
					pricing_plan_id: string | null;
					started_at: string;
					trial_end: string | null;
					canceled_at: string | null;
					updated_at: string;
				}
				Insert: {
					id?: string;
					user_id: string;
					plan_tier: 'basic' | 'pro' | 'unlimited';
					price_monthly: number;
					status?: 'active' | 'canceled' | 'unpaid';
					leads_per_month?: number | null;
					sources?: string[] | null;
					features?: string[] | null;
					stripe_price_id?: string | null;
					pricing_plan_id?: string | null;
					started_at?: string;
					trial_end?: string | null;
					canceled_at?: string | null;
					updated_at?: string;
				}
				Update: {
					id?: string;
					user_id?: string;
					plan_tier?: 'basic' | 'pro' | 'unlimited';
					price_monthly?: number;
					status?: 'active' | 'canceled' | 'unpaid';
					leads_per_month?: number | null;
					sources?: string[] | null;
					features?: string[] | null;
					stripe_price_id?: string | null;
					pricing_plan_id?: string | null;
					started_at?: string;
					trial_end?: string | null;
					canceled_at?: string | null;
					updated_at?: string;
				}
			},
			stripe_customers: {
				Row: {
					id: string;
					user_id: string;
					stripe_customer_id: string;
					status: 'active' | 'inactive' | 'canceled';
					created_at: string;
					updated_at: string;
				}
				Insert: {
					id?: string;
					user_id: string;
					stripe_customer_id: string;
					status?: 'active' | 'inactive' | 'canceled';
					created_at?: string;
					updated_at?: string;
				}
				Update: {
					id?: string;
					user_id?: string;
					stripe_customer_id?: string;
					status?: 'active' | 'inactive' | 'canceled';
					created_at?: string;
					updated_at?: string;
				}
			}
			leads: {
				Row: {
					id: string;
					created_at: string;
					updated_at: string;
					user_id: string;
					source: 'shopify' | 'etsy' | 'g2' | 'woocommerce';
					url: string;
					status: 'pending' | 'scraped' | 'enriching' | 'enriched' | 'failed';
					verify_email_status: 'pending' | 'verified' | 'failed';
					scrap_info: Json | null;
					enrich_info: Json | null;
				}
				Insert: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					user_id: string;
					source: 'shopify' | 'etsy' | 'g2' | 'woocommerce';
					url: string;
					status?: 'pending' | 'scraped' | 'enriching' | 'enriched' | 'failed';
					verify_email_status: 'pending' | 'verified' | 'failed';
					scrap_info?: Json | null;
					enrich_info?: Json | null;
				}
				Update: {
					id?: string;
					created_at?: string;
					updated_at?: string;
					user_id?: string;
					source: 'shopify' | 'etsy' | 'g2' | 'woocommerce';
					url?: string;
					status?: 'pending' | 'scraped' | 'enriching' | 'enriched' | 'failed';
					verify_email_status: 'pending' | 'verified' | 'failed';
					scrap_info?: Json | null;
					enrich_info?: Json | null;
				}
			}
		}
		Views: {
		}
		Functions: {
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
		}
		Enums: {
			lead_source: ['shopify', 'etsy', 'g2', 'woocommerce'];
			lead_status: ["pending", "scraped", "enriching", "enriched", "failed"],
			verify_email_status: ["pending", "verified", "failed"],
			subscription_status:
			| "active"
			| "past_due"
			| "canceled"
			| "unpaid"
		}
		CompositeTypes: {
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
			plan_tier: ["basic", "pro", "unlimited"],
			subscription_status: ["active", "canceled", "unpaid"],
			stripe_customer_status: ["active", "inactive", "canceled"],
		},
	},
} as const
