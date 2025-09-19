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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      billing_history: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_date: string
          line_items: Json
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string
          stripe_payment_intent_id: string | null
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_date: string
          line_items?: Json
          paid_at?: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string
          stripe_payment_intent_id?: string | null
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          line_items?: Json
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          reputation_score: number
          reputation_summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          reputation_score?: number
          reputation_summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reputation_score?: number
          reputation_summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_room_participants: {
        Row: {
          id: string
          joined_at: string
          last_read_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_general: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_general?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_general?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          company_id: string
          context_id: string | null
          context_type: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          message_body: string
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["communication_status"]
          subject: string | null
          type: Database["public"]["Enums"]["communication_type"]
        }
        Insert: {
          company_id: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_body: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["communication_status"]
          subject?: string | null
          type: Database["public"]["Enums"]["communication_type"]
        }
        Update: {
          company_id?: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_body?: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["communication_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["communication_type"]
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: Database["public"]["CompositeTypes"]["address_type"] | null
          created_at: string
          dot_number: string | null
          email: string | null
          id: string
          logo_url: string | null
          mc_number: string | null
          name: string
          owner_id: string
          phone: string | null
          slug: string
          status: Database["public"]["Enums"]["company_status"]
          stripe_customer_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Database["public"]["CompositeTypes"]["address_type"] | null
          created_at?: string
          dot_number?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          mc_number?: string | null
          name: string
          owner_id: string
          phone?: string | null
          slug: string
          status?: Database["public"]["Enums"]["company_status"]
          stripe_customer_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Database["public"]["CompositeTypes"]["address_type"] | null
          created_at?: string
          dot_number?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          mc_number?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["company_status"]
          stripe_customer_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          company_id: string
          created_at: string
          current_location:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          current_vehicle_id: string | null
          deleted_at: string | null
          employee_id: string
          hire_date: string
          id: string
          is_idle: boolean | null
          license_class: string | null
          license_expires: string
          license_number: string
          license_state: string
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          current_location?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          current_vehicle_id?: string | null
          deleted_at?: string | null
          employee_id: string
          hire_date: string
          id?: string
          is_idle?: boolean | null
          license_class?: string | null
          license_expires: string
          license_number: string
          license_state: string
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          current_location?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          current_vehicle_id?: string | null
          deleted_at?: string | null
          employee_id?: string
          hire_date?: string
          id?: string
          is_idle?: boolean | null
          license_class?: string | null
          license_expires?: string
          license_number?: string
          license_state?: string
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_current_vehicle_id_fkey"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      load_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          load_id: string
          location:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          new_status: Database["public"]["Enums"]["load_status"]
          old_status: Database["public"]["Enums"]["load_status"] | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          load_id: string
          location?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          new_status: Database["public"]["Enums"]["load_status"]
          old_status?: Database["public"]["Enums"]["load_status"] | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          load_id?: string
          location?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          new_status?: Database["public"]["Enums"]["load_status"]
          old_status?: Database["public"]["Enums"]["load_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "load_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_status_history_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          broker_id: string | null
          commodity: string | null
          company_id: string
          created_at: string
          delivered_at: string | null
          delivery_address: string
          delivery_date: string
          distance_miles: number
          id: string
          load_number: string
          picked_up_at: string | null
          pickup_address: string
          rate_amount: number
          route_type: Database["public"]["Enums"]["route_type"]
          score: number
          score_reason: string | null
          status: Database["public"]["Enums"]["load_status"]
          updated_at: string
          weight_lbs: number
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          broker_id?: string | null
          commodity?: string | null
          company_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_address: string
          delivery_date: string
          distance_miles: number
          id?: string
          load_number: string
          picked_up_at?: string | null
          pickup_address: string
          rate_amount: number
          route_type?: Database["public"]["Enums"]["route_type"]
          score?: number
          score_reason?: string | null
          status?: Database["public"]["Enums"]["load_status"]
          updated_at?: string
          weight_lbs: number
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          broker_id?: string | null
          commodity?: string | null
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_date?: string
          distance_miles?: number
          id?: string
          load_number?: string
          picked_up_at?: string | null
          pickup_address?: string
          rate_amount?: number
          route_type?: Database["public"]["Enums"]["route_type"]
          score?: number
          score_reason?: string | null
          status?: Database["public"]["Enums"]["load_status"]
          updated_at?: string
          weight_lbs?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_loads_broker_id"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_feature_mappings: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          is_included: boolean
          limit_value: number | null
          plan_id: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          is_included?: boolean
          limit_value?: number | null
          plan_id: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          is_included?: boolean
          limit_value?: number | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_feature_mappings_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "plan_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_feature_mappings_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          category: string
          created_at: string
          description: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          display_name: string
          features: Json
          id: string
          is_active: boolean
          max_drivers: number | null
          max_loads_per_month: number | null
          max_vehicles: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          stripe_price_id: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean
          max_drivers?: number | null
          max_loads_per_month?: number | null
          max_vehicles?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          stripe_price_id?: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_drivers?: number | null
          max_loads_per_month?: number | null
          max_vehicles?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          stripe_price_id?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          address: Database["public"]["CompositeTypes"]["address_type"]
          created_at: string
          id: string
          is_completed: boolean
          load_id: string | null
          planned_arrival: string | null
          planned_departure: string | null
          route_id: string
          sequence_number: number
          stop_type: string
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          address: Database["public"]["CompositeTypes"]["address_type"]
          created_at?: string
          id?: string
          is_completed?: boolean
          load_id?: string | null
          planned_arrival?: string | null
          planned_departure?: string | null
          route_id: string
          sequence_number: number
          stop_type: string
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          address?: Database["public"]["CompositeTypes"]["address_type"]
          created_at?: string
          id?: string
          is_completed?: boolean
          load_id?: string | null
          planned_arrival?: string | null
          planned_departure?: string | null
          route_id?: string
          sequence_number?: number
          stop_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          actual_distance_miles: number | null
          actual_duration_minutes: number | null
          actual_end_time: string | null
          actual_start_time: string | null
          company_id: string
          created_at: string
          driver_id: string | null
          id: string
          planned_distance_miles: number | null
          planned_duration_minutes: number | null
          planned_end_time: string | null
          planned_start_time: string | null
          route_name: string | null
          route_number: string | null
          status: Database["public"]["Enums"]["route_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_distance_miles?: number | null
          actual_duration_minutes?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          company_id: string
          created_at?: string
          driver_id?: string | null
          id?: string
          planned_distance_miles?: number | null
          planned_duration_minutes?: number | null
          planned_end_time?: string | null
          planned_start_time?: string | null
          route_name?: string | null
          route_number?: string | null
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_distance_miles?: number | null
          actual_duration_minutes?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          company_id?: string
          created_at?: string
          driver_id?: string | null
          id?: string
          planned_distance_miles?: number | null
          planned_duration_minutes?: number | null
          planned_end_time?: string | null
          planned_start_time?: string | null
          route_name?: string | null
          route_number?: string | null
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_loads: string[] | null
          affected_routes: string[] | null
          alert_level: Database["public"]["Enums"]["signal_severity"]
          company_id: string
          created_at: string
          id: string
          is_acknowledged: boolean
          message: string
          signal_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_loads?: string[] | null
          affected_routes?: string[] | null
          alert_level: Database["public"]["Enums"]["signal_severity"]
          company_id: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          message: string
          signal_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_loads?: string[] | null
          affected_routes?: string[] | null
          alert_level?: Database["public"]["Enums"]["signal_severity"]
          company_id?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          message?: string
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_alerts_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_sources: {
        Row: {
          category: string | null
          created_at: string
          endpoint_url: string | null
          id: string
          is_active: boolean
          last_successful_fetch: string | null
          name: string
          priority: number | null
          refresh_interval_minutes: number | null
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          is_active?: boolean
          last_successful_fetch?: string | null
          name: string
          priority?: number | null
          refresh_interval_minutes?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          is_active?: boolean
          last_successful_fetch?: string | null
          name?: string
          priority?: number | null
          refresh_interval_minutes?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          affected_corridors: string[] | null
          coordinates:
          | Database["public"]["CompositeTypes"]["gps_coordinate"][]
          | null
          created_at: string
          description: string | null
          end_time: string | null
          estimated_delay_minutes: number | null
          external_id: string | null
          id: string
          impact_level: string | null
          is_active: boolean
          location: string | null
          metadata: Json | null
          radius_miles: number | null
          severity: Database["public"]["Enums"]["signal_severity"]
          source_id: string | null
          start_time: string
          title: string
          type: Database["public"]["Enums"]["signal_type"]
          updated_at: string
        }
        Insert: {
          affected_corridors?: string[] | null
          coordinates?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"][]
          | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          estimated_delay_minutes?: number | null
          external_id?: string | null
          id?: string
          impact_level?: string | null
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          radius_miles?: number | null
          severity: Database["public"]["Enums"]["signal_severity"]
          source_id?: string | null
          start_time: string
          title: string
          type: Database["public"]["Enums"]["signal_type"]
          updated_at?: string
        }
        Update: {
          affected_corridors?: string[] | null
          coordinates?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"][]
          | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          estimated_delay_minutes?: number | null
          external_id?: string | null
          id?: string
          impact_level?: string | null
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          radius_miles?: number | null
          severity?: Database["public"]["Enums"]["signal_severity"]
          source_id?: string | null
          start_time?: string
          title?: string
          type?: Database["public"]["Enums"]["signal_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "signal_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          company_id: string
          created_at: string
          current_drivers: number
          current_month_loads: number
          current_period_end: string | null
          current_period_start: string | null
          current_vehicles: number
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          company_id: string
          created_at?: string
          current_drivers?: number
          current_month_loads?: number
          current_period_end?: string | null
          current_period_start?: string | null
          current_vehicles?: number
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          company_id?: string
          created_at?: string
          current_drivers?: number
          current_month_loads?: number
          current_period_end?: string | null
          current_period_start?: string | null
          current_vehicles?: number
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: Database["public"]["CompositeTypes"]["address_type"] | null
          avatar_url: string | null
          company_id: string | null
          contact: Database["public"]["CompositeTypes"]["contact_info"] | null
          created_at: string
          date_of_birth: string | null
          first_name: string
          id: string
          is_active: boolean
          last_login: string | null
          last_name: string
          login_count: number
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: Database["public"]["CompositeTypes"]["address_type"] | null
          avatar_url?: string | null
          company_id?: string | null
          contact?: Database["public"]["CompositeTypes"]["contact_info"] | null
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          id: string
          is_active?: boolean
          last_login?: string | null
          last_name: string
          login_count?: number
          permissions?: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: Database["public"]["CompositeTypes"]["address_type"] | null
          avatar_url?: string | null
          company_id?: string | null
          contact?: Database["public"]["CompositeTypes"]["contact_info"] | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          last_name?: string
          login_count?: number
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          company_id: string
          created_at: string
          current_location:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          deleted_at: string | null
          fuel_type: Database["public"]["Enums"]["vehicle_fuel"] | null
          id: string
          last_maintenance_date: string | null
          license_plate: string | null
          make: string | null
          max_weight_lbs: number | null
          model: string | null
          mpg_rating: number | null
          next_maintenance_due: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          type: Database["public"]["Enums"]["vehicle_type"]
          unit_number: string
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          current_location?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          deleted_at?: string | null
          fuel_type?: Database["public"]["Enums"]["vehicle_fuel"] | null
          id?: string
          last_maintenance_date?: string | null
          license_plate?: string | null
          make?: string | null
          max_weight_lbs?: number | null
          model?: string | null
          mpg_rating?: number | null
          next_maintenance_due?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          type: Database["public"]["Enums"]["vehicle_type"]
          unit_number: string
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          current_location?:
          | Database["public"]["CompositeTypes"]["gps_coordinate"]
          | null
          deleted_at?: string | null
          fuel_type?: Database["public"]["Enums"]["vehicle_fuel"] | null
          id?: string
          last_maintenance_date?: string | null
          license_plate?: string | null
          make?: string | null
          max_weight_lbs?: number | null
          model?: string | null
          mpg_rating?: number | null
          next_maintenance_due?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          type?: Database["public"]["Enums"]["vehicle_type"]
          unit_number?: string
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      company_plan_view: {
        Row: {
          address: Database["public"]["CompositeTypes"]["address_type"] | null
          created_at: string | null
          current_drivers: number | null
          current_month_loads: number | null
          current_vehicles: number | null
          dot_number: string | null
          email: string | null
          id: string | null
          logo_url: string | null
          mc_number: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          plan_display_name: string | null
          plan_features: Json | null
          plan_max_drivers: number | null
          plan_max_loads_per_month: number | null
          plan_max_vehicles: number | null
          plan_name: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"] | null
          slug: string | null
          status: Database["public"]["Enums"]["company_status"] | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_status:
          | Database["public"]["Enums"]["subscription_status"]
          | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      users_view: {
        Row: {
          address: Database["public"]["CompositeTypes"]["address_type"] | null
          auth_created_at: string | null
          auth_updated_at: string | null
          avatar_url: string | null
          company_id: string | null
          company_name: string | null
          company_slug: string | null
          contact: Database["public"]["CompositeTypes"]["contact_info"] | null
          created_at: string | null
          email: string | null
          email_confirmed_at: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          last_sign_in_at: string | null
          login_count: number | null
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_plan_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_driver_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_vehicle_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gbt_bit_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_company_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_load_exist_in_current_company: {
        Args: { load_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      communication_status: "pending" | "sent" | "delivered" | "failed"
      communication_type: "email" | "sms" | "push_notification"
      company_status: "active" | "suspended" | "pending" | "canceled"
      driver_status: "active" | "inactive" | "suspended"
      invoice_status: "draft" | "open" | "paid" | "uncollectible" | "void"
      load_status:
      | "pending"
      | "assigned"
      | "in_transit"
      | "delivered"
      | "canceled"
      plan_tier: "basic" | "pro" | "white_label"
      route_status: "planned" | "active" | "completed" | "canceled"
      route_type: "highway" | "urban" | "mixed" | "rural"
      signal_severity: "low" | "medium" | "high" | "critical"
      signal_type:
      | "weather_disruption"
      | "traffic_incident"
      | "road_closure"
      | "strike_protest"
      | "fuel_shortage"
      | "port_congestion"
      | "border_delay"
      | "equipment_shortage"
      | "market_disruption"
      | "regulatory_change"
      | "construction_delay"
      | "hazmat_incident"
      | "bridge_restriction"
      | "weight_restriction"
      subscription_status:
      | "trialing"
      | "active"
      | "past_due"
      | "canceled"
      | "unpaid"
      user_role: "super_admin" | "company_admin" | "dispatcher" | "driver"
      vehicle_fuel:
      | "diesel"
      | "gasoline"
      | "electric"
      | "hybrid"
      | "propane"
      | "natural_gas"
      vehicle_status: "active" | "maintenance" | "inactive"
      vehicle_type: "truck" | "trailer" | "van"
    }
    CompositeTypes: {
      address_type: {
        street_address: string | null
        city: string | null
        state: string | null
        postal_code: string | null
        country: string | null
        latitude: number | null
        longitude: number | null
      }
      contact_info: {
        phone: string | null
        email: string | null
      }
      gps_coordinate: {
        latitude: number | null
        longitude: number | null
        timestamp: string | null
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      communication_status: ["pending", "sent", "delivered", "failed"],
      communication_type: ["email", "sms", "push_notification"],
      company_status: ["active", "suspended", "pending", "canceled"],
      driver_status: ["active", "inactive", "suspended"],
      invoice_status: ["draft", "open", "paid", "uncollectible", "void"],
      load_status: [
        "pending",
        "assigned",
        "in_transit",
        "delivered",
        "canceled",
      ],
      plan_tier: ["basic", "pro", "white_label"],
      route_status: ["planned", "active", "completed", "canceled"],
      route_type: ["highway", "urban", "mixed", "rural"],
      signal_severity: ["low", "medium", "high", "critical"],
      signal_type: [
        "weather_disruption",
        "traffic_incident",
        "road_closure",
        "strike_protest",
        "fuel_shortage",
        "port_congestion",
        "border_delay",
        "equipment_shortage",
        "market_disruption",
        "regulatory_change",
        "construction_delay",
        "hazmat_incident",
        "bridge_restriction",
        "weight_restriction",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
      ],
      user_role: ["super_admin", "company_admin", "dispatcher", "driver"],
      vehicle_fuel: [
        "diesel",
        "gasoline",
        "electric",
        "hybrid",
        "propane",
        "natural_gas",
      ],
      vehicle_status: ["active", "maintenance", "inactive"],
      vehicle_type: ["truck", "trailer", "van"],
    },
  },
} as const
