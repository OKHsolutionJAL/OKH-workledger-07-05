export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "client" | "support" | "accountant";
          user_type: "admin" | "worker" | "client_company" | "both";
          client_company_code: string | null;
          phone_normalized: string | null;
          company_name: string | null;
          full_name: string | null;
          owner_name: string | null;
          business_name: string | null;
          email: string | null;
          phone: string | null;
          account_status: "active" | "blocked" | "suspended" | "trial";
          plan_id: string | null;
          subscription_status: "free" | "trial" | "active" | "past_due" | "cancelled" | "manual";
          market: "JP" | "AU";
          currency: "JPY" | "AUD";
          last_login_at: string | null;
          country: "JP" | "AU";
          company_country: "JP" | "AU";
          document_market: "JP" | "AU";
          default_document_market: "JP" | "AU";
          address: string | null;
          postal_code: string | null;
          website: string | null;
          invoice_number: string | null;
          invoice_registration_number: string | null;
          bank_info: string | null;
          trading_name: string | null;
          abn: string | null;
          acn: string | null;
          gst_registered: boolean;
          gst_rate: number;
          business_address: string | null;
          bank_name: string | null;
          bsb: string | null;
          account_number: string | null;
          account_name: string | null;
          branch_name: string | null;
          account_type: string | null;
          account_holder: string | null;
          payment_terms: string | null;
          default_currency: "JPY" | "AUD";
          default_due_days: number;
          next_document_sequence: number;
          tax_calculation_mode: "inclusive" | "exclusive" | "none";
          japan_consumption_tax_enabled: boolean;
          japan_tax_rate: number;
          japan_show_consumption_tax: boolean;
          japan_show_invoice_number: boolean;
          japan_invoice_registration_number: string | null;
          australia_gst_registered: boolean;
          australia_gst_calculation_mode: "inclusive" | "exclusive" | "none";
          australia_gst_rate: number;
          australia_show_gst: boolean;
          australia_abn: string | null;
          australia_acn: string | null;
          document_notes: string | null;
          japan_invoice_prefix: string;
          japan_estimate_prefix: string;
          japan_delivery_prefix: string;
          japan_receipt_prefix: string;
          australia_invoice_prefix: string;
          australia_quote_prefix: string;
          australia_receipt_prefix: string;
          australia_statement_prefix: string;
          japan_bank_name: string | null;
          japan_branch_name: string | null;
          japan_account_type: string | null;
          japan_account_number: string | null;
          japan_account_holder: string | null;
          australia_bank_name: string | null;
          australia_bsb: string | null;
          australia_account_number: string | null;
          australia_account_name: string | null;
          default_hourly_rate: number | null;
          default_daily_rate: number | null;
          overtime_rate_percent: number;
          night_rate_percent: number;
          weekend_rate_percent: number;
          holiday_rate_percent: number;
          night_start_time: string;
          night_end_time: string;
          custom_premium_enabled: boolean;
          notes: string | null;
          logo_url: string | null;
          stamp_url: string | null;
          stamp_image: string | null;
          qr_code_url: string | null;
          preferred_language: "pt" | "ja" | "en";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "client" | "support" | "accountant";
          user_type?: "admin" | "worker" | "client_company" | "both";
          client_company_code?: string | null;
          phone_normalized?: string | null;
          company_name?: string | null;
          full_name?: string | null;
          owner_name?: string | null;
          business_name?: string | null;
          email?: string | null;
          phone?: string | null;
          account_status?: "active" | "blocked" | "suspended" | "trial";
          plan_id?: string | null;
          subscription_status?: "free" | "trial" | "active" | "past_due" | "cancelled" | "manual";
          market?: "JP" | "AU";
          currency?: "JPY" | "AUD";
          last_login_at?: string | null;
          country?: "JP" | "AU";
          company_country?: "JP" | "AU";
          document_market?: "JP" | "AU";
          default_document_market?: "JP" | "AU";
          address?: string | null;
          postal_code?: string | null;
          website?: string | null;
          invoice_number?: string | null;
          invoice_registration_number?: string | null;
          bank_info?: string | null;
          trading_name?: string | null;
          abn?: string | null;
          acn?: string | null;
          gst_registered?: boolean;
          gst_rate?: number;
          business_address?: string | null;
          bank_name?: string | null;
          bsb?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          branch_name?: string | null;
          account_type?: string | null;
          account_holder?: string | null;
          payment_terms?: string | null;
          default_currency?: "JPY" | "AUD";
          default_due_days?: number;
          next_document_sequence?: number;
          tax_calculation_mode?: "inclusive" | "exclusive" | "none";
          japan_consumption_tax_enabled?: boolean;
          japan_tax_rate?: number;
          japan_show_consumption_tax?: boolean;
          japan_show_invoice_number?: boolean;
          japan_invoice_registration_number?: string | null;
          australia_gst_registered?: boolean;
          australia_gst_calculation_mode?: "inclusive" | "exclusive" | "none";
          australia_gst_rate?: number;
          australia_show_gst?: boolean;
          australia_abn?: string | null;
          australia_acn?: string | null;
          document_notes?: string | null;
          japan_invoice_prefix?: string;
          japan_estimate_prefix?: string;
          japan_delivery_prefix?: string;
          japan_receipt_prefix?: string;
          australia_invoice_prefix?: string;
          australia_quote_prefix?: string;
          australia_receipt_prefix?: string;
          australia_statement_prefix?: string;
          japan_bank_name?: string | null;
          japan_branch_name?: string | null;
          japan_account_type?: string | null;
          japan_account_number?: string | null;
          japan_account_holder?: string | null;
          australia_bank_name?: string | null;
          australia_bsb?: string | null;
          australia_account_number?: string | null;
          australia_account_name?: string | null;
          default_hourly_rate?: number | null;
          default_daily_rate?: number | null;
          overtime_rate_percent?: number;
          night_rate_percent?: number;
          weekend_rate_percent?: number;
          holiday_rate_percent?: number;
          night_start_time?: string;
          night_end_time?: string;
          custom_premium_enabled?: boolean;
          notes?: string | null;
          logo_url?: string | null;
          stamp_url?: string | null;
          stamp_image?: string | null;
          qr_code_url?: string | null;
          preferred_language?: "pt" | "ja" | "en";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: "admin" | "client" | "support" | "accountant";
          user_type?: "admin" | "worker" | "client_company" | "both";
          client_company_code?: string | null;
          phone_normalized?: string | null;
          company_name?: string | null;
          full_name?: string | null;
          owner_name?: string | null;
          business_name?: string | null;
          email?: string | null;
          phone?: string | null;
          account_status?: "active" | "blocked" | "suspended" | "trial";
          plan_id?: string | null;
          subscription_status?: "free" | "trial" | "active" | "past_due" | "cancelled" | "manual";
          market?: "JP" | "AU";
          currency?: "JPY" | "AUD";
          last_login_at?: string | null;
          country?: "JP" | "AU";
          company_country?: "JP" | "AU";
          document_market?: "JP" | "AU";
          default_document_market?: "JP" | "AU";
          address?: string | null;
          postal_code?: string | null;
          website?: string | null;
          invoice_number?: string | null;
          invoice_registration_number?: string | null;
          bank_info?: string | null;
          trading_name?: string | null;
          abn?: string | null;
          acn?: string | null;
          gst_registered?: boolean;
          gst_rate?: number;
          business_address?: string | null;
          bank_name?: string | null;
          bsb?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          branch_name?: string | null;
          account_type?: string | null;
          account_holder?: string | null;
          payment_terms?: string | null;
          default_currency?: "JPY" | "AUD";
          default_due_days?: number;
          next_document_sequence?: number;
          tax_calculation_mode?: "inclusive" | "exclusive" | "none";
          japan_consumption_tax_enabled?: boolean;
          japan_tax_rate?: number;
          japan_show_consumption_tax?: boolean;
          japan_show_invoice_number?: boolean;
          japan_invoice_registration_number?: string | null;
          australia_gst_registered?: boolean;
          australia_gst_calculation_mode?: "inclusive" | "exclusive" | "none";
          australia_gst_rate?: number;
          australia_show_gst?: boolean;
          australia_abn?: string | null;
          australia_acn?: string | null;
          document_notes?: string | null;
          japan_invoice_prefix?: string;
          japan_estimate_prefix?: string;
          japan_delivery_prefix?: string;
          japan_receipt_prefix?: string;
          australia_invoice_prefix?: string;
          australia_quote_prefix?: string;
          australia_receipt_prefix?: string;
          australia_statement_prefix?: string;
          japan_bank_name?: string | null;
          japan_branch_name?: string | null;
          japan_account_type?: string | null;
          japan_account_number?: string | null;
          japan_account_holder?: string | null;
          australia_bank_name?: string | null;
          australia_bsb?: string | null;
          australia_account_number?: string | null;
          australia_account_name?: string | null;
          default_hourly_rate?: number | null;
          default_daily_rate?: number | null;
          overtime_rate_percent?: number;
          night_rate_percent?: number;
          weekend_rate_percent?: number;
          holiday_rate_percent?: number;
          night_start_time?: string;
          night_end_time?: string;
          custom_premium_enabled?: boolean;
          notes?: string | null;
          logo_url?: string | null;
          stamp_url?: string | null;
          stamp_image?: string | null;
          qr_code_url?: string | null;
          preferred_language?: "pt" | "ja" | "en";
          updated_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_jpy: number;
          price_aud: number;
          currency: "JPY" | "AUD";
          billing_cycle: "monthly" | "yearly" | "manual";
          max_clients: number;
          max_entries_per_month: number;
          can_use_japan_documents: boolean;
          can_use_australia_documents: boolean;
          can_use_expenses: boolean;
          can_use_materials: boolean;
          can_use_tax_export: boolean;
          can_use_support: boolean;
          can_use_courses: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_jpy?: number;
          price_aud?: number;
          currency?: "JPY" | "AUD";
          billing_cycle?: "monthly" | "yearly" | "manual";
          max_clients?: number;
          max_entries_per_month?: number;
          can_use_japan_documents?: boolean;
          can_use_australia_documents?: boolean;
          can_use_expenses?: boolean;
          can_use_materials?: boolean;
          can_use_tax_export?: boolean;
          can_use_support?: boolean;
          can_use_courses?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          price_jpy?: number;
          price_aud?: number;
          currency?: "JPY" | "AUD";
          billing_cycle?: "monthly" | "yearly" | "manual";
          max_clients?: number;
          max_entries_per_month?: number;
          can_use_japan_documents?: boolean;
          can_use_australia_documents?: boolean;
          can_use_expenses?: boolean;
          can_use_materials?: boolean;
          can_use_tax_export?: boolean;
          can_use_support?: boolean;
          can_use_courses?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          client_company_id: string | null;
          client_name: string;
          client_name_jp: string | null;
          company_name: string | null;
          address: string | null;
          phone: string | null;
          phone_normalized: string | null;
          email: string | null;
          contact_person: string | null;
          invoice_number: string | null;
          registration_number: string | null;
          client_country: "JP" | "AU";
          preferred_document_market: "JP" | "AU";
          currency: "JPY" | "AUD";
          hourly_rate: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_company_id?: string | null;
          client_name: string;
          client_name_jp?: string | null;
          company_name?: string | null;
          address?: string | null;
          phone?: string | null;
          phone_normalized?: string | null;
          email?: string | null;
          contact_person?: string | null;
          invoice_number?: string | null;
          registration_number?: string | null;
          client_country?: "JP" | "AU";
          preferred_document_market?: "JP" | "AU";
          currency?: "JPY" | "AUD";
          hourly_rate?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_company_id?: string | null;
          client_name?: string;
          client_name_jp?: string | null;
          company_name?: string | null;
          address?: string | null;
          phone?: string | null;
          phone_normalized?: string | null;
          email?: string | null;
          contact_person?: string | null;
          invoice_number?: string | null;
          registration_number?: string | null;
          client_country?: "JP" | "AU";
          preferred_document_market?: "JP" | "AU";
          currency?: "JPY" | "AUD";
          hourly_rate?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      client_company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: "owner" | "manager" | "viewer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role?: "owner" | "manager" | "viewer";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          user_id?: string;
          role?: "owner" | "manager" | "viewer";
          updated_at?: string;
        };
        Relationships: [];
      };
      contractor_relationships: {
        Row: {
          id: string;
          worker_user_id: string;
          client_company_id: string;
          status: "pending" | "active" | "rejected" | "suspended" | "ended";
          requested_at: string;
          approved_at: string | null;
          rejected_at: string | null;
          suspended_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_user_id: string;
          client_company_id: string;
          status?: "pending" | "active" | "rejected" | "suspended" | "ended";
          requested_at?: string;
          approved_at?: string | null;
          rejected_at?: string | null;
          suspended_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          worker_user_id?: string;
          client_company_id?: string;
          status?: "pending" | "active" | "rejected" | "suspended" | "ended";
          requested_at?: string;
          approved_at?: string | null;
          rejected_at?: string | null;
          suspended_at?: string | null;
          ended_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      issued_documents: {
        Row: {
          id: string;
          worker_user_id: string;
          client_company_id: string | null;
          client_id: string | null;
          document_number: string;
          document_type: string;
          document_market: "JP" | "AU";
          title: string;
          period_year: number;
          period_month: number;
          gross_amount: number;
          currency: "JPY" | "AUD";
          original_payload: Json;
          preview_storage_key: string | null;
          status: "issued" | "received" | "reviewing" | "approved" | "rejected" | "paid";
          issued_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_user_id: string;
          client_company_id?: string | null;
          client_id?: string | null;
          document_number: string;
          document_type: string;
          document_market: "JP" | "AU";
          title: string;
          period_year: number;
          period_month: number;
          gross_amount?: number;
          currency: "JPY" | "AUD";
          original_payload?: Json;
          preview_storage_key?: string | null;
          status?: "issued" | "received" | "reviewing" | "approved" | "rejected" | "paid";
          issued_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_company_id?: string | null;
          client_id?: string | null;
          document_number?: string;
          document_type?: string;
          document_market?: "JP" | "AU";
          title?: string;
          period_year?: number;
          period_month?: number;
          gross_amount?: number;
          currency?: "JPY" | "AUD";
          original_payload?: Json;
          preview_storage_key?: string | null;
          status?: "issued" | "received" | "reviewing" | "approved" | "rejected" | "paid";
          updated_at?: string;
        };
        Relationships: [];
      };
      document_reviews: {
        Row: {
          id: string;
          document_id: string;
          worker_user_id: string;
          client_company_id: string;
          reviewed_by: string | null;
          status: "received" | "reviewing" | "approved" | "rejected" | "paid";
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          worker_user_id: string;
          client_company_id: string;
          reviewed_by?: string | null;
          status?: "received" | "reviewing" | "approved" | "rejected" | "paid";
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reviewed_by?: string | null;
          status?: "received" | "reviewing" | "approved" | "rejected" | "paid";
          comment?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_adjustments: {
        Row: {
          id: string;
          client_company_id: string;
          worker_user_id: string;
          document_id: string | null;
          period_year: number | null;
          period_month: number | null;
          adjustment_type:
            | "health_insurance"
            | "social_insurance"
            | "housing"
            | "transport"
            | "food"
            | "advance_payment"
            | "tools"
            | "uniform"
            | "internal_fee"
            | "other";
          title: string;
          description: string | null;
          amount: number;
          currency: "JPY" | "AUD";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_company_id: string;
          worker_user_id: string;
          document_id?: string | null;
          period_year?: number | null;
          period_month?: number | null;
          adjustment_type:
            | "health_insurance"
            | "social_insurance"
            | "housing"
            | "transport"
            | "food"
            | "advance_payment"
            | "tools"
            | "uniform"
            | "internal_fee"
            | "other";
          title: string;
          description?: string | null;
          amount?: number;
          currency?: "JPY" | "AUD";
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          document_id?: string | null;
          period_year?: number | null;
          period_month?: number | null;
          adjustment_type?:
            | "health_insurance"
            | "social_insurance"
            | "housing"
            | "transport"
            | "food"
            | "advance_payment"
            | "tools"
            | "uniform"
            | "internal_fee"
            | "other";
          title?: string;
          description?: string | null;
          amount?: number;
          currency?: "JPY" | "AUD";
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          target_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          target_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: {
          actor_user_id?: string | null;
          target_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json;
        };
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          work_date: string;
          site_name: string | null;
          service_type: string | null;
          start_time: string;
          end_time: string;
          break_minutes: number;
          hourly_rate: number;
          expense_amount: number;
          toll_amount: number;
          fuel_amount: number;
          memo: string | null;
          is_invoiced: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          work_date: string;
          site_name?: string | null;
          service_type?: string | null;
          start_time: string;
          end_time: string;
          break_minutes?: number;
          hourly_rate: number;
          expense_amount?: number;
          toll_amount?: number;
          fuel_amount?: number;
          memo?: string | null;
          is_invoiced?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string | null;
          work_date?: string;
          site_name?: string | null;
          service_type?: string | null;
          start_time?: string;
          end_time?: string;
          break_minutes?: number;
          hourly_rate?: number;
          expense_amount?: number;
          toll_amount?: number;
          fuel_amount?: number;
          memo?: string | null;
          is_invoiced?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      work_entries: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          client_company_id: string | null;
          contractor_relationship_id: string | null;
          entry_type:
            | "hourly_work"
            | "daily_work"
            | "fixed_service"
            | "client_expense"
            | "business_expense"
            | "material"
            | "adjustment";
          market: "JP" | "AU";
          date: string;
          title: string | null;
          description: string | null;
          location: string | null;
          start_time: string | null;
          end_time: string | null;
          break_minutes: number;
          hours: number | null;
          days: number | null;
          quantity: number | null;
          unit: string | null;
          unit_price: number | null;
          hourly_rate: number | null;
          daily_rate: number | null;
          fixed_amount: number | null;
          expense_amount: number | null;
          material_cost: number | null;
          markup_amount: number;
          discount_amount: number;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          currency: "JPY" | "AUD";
          tax_mode: "inclusive" | "exclusive" | "none";
          tax_rate: number;
          is_billable: boolean;
          is_business_expense: boolean;
          is_client_charge: boolean;
          receipt_url: string | null;
          status: "draft" | "billable" | "invoiced" | "paid" | "cancelled" | "non_billable";
          visibility_to_client: boolean;
          sent_to_client_at: string | null;
          client_review_status: "draft" | "sent" | "received" | "approved" | "rejected" | "paid";
          client_review_comment: string | null;
          client_reviewed_at: string | null;
          overtime_hours: number;
          overtime_rate_percent: number;
          night_hours: number;
          night_rate_percent: number;
          weekend_hours: number;
          weekend_rate_percent: number;
          holiday_hours: number;
          holiday_rate_percent: number;
          custom_premium_title: string | null;
          custom_premium_amount: number;
          normal_amount: number;
          overtime_amount: number;
          night_premium_amount: number;
          weekend_premium_amount: number;
          holiday_premium_amount: number;
          premium_total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          client_company_id?: string | null;
          contractor_relationship_id?: string | null;
          entry_type?:
            | "hourly_work"
            | "daily_work"
            | "fixed_service"
            | "client_expense"
            | "business_expense"
            | "material"
            | "adjustment";
          market?: "JP" | "AU";
          date: string;
          title?: string | null;
          description?: string | null;
          location?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          break_minutes?: number;
          hours?: number | null;
          days?: number | null;
          quantity?: number | null;
          unit?: string | null;
          unit_price?: number | null;
          hourly_rate?: number | null;
          daily_rate?: number | null;
          fixed_amount?: number | null;
          expense_amount?: number | null;
          material_cost?: number | null;
          markup_amount?: number;
          discount_amount?: number;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: "JPY" | "AUD";
          tax_mode?: "inclusive" | "exclusive" | "none";
          tax_rate?: number;
          is_billable?: boolean;
          is_business_expense?: boolean;
          is_client_charge?: boolean;
          receipt_url?: string | null;
          status?: "draft" | "billable" | "invoiced" | "paid" | "cancelled" | "non_billable";
          visibility_to_client?: boolean;
          sent_to_client_at?: string | null;
          client_review_status?: "draft" | "sent" | "received" | "approved" | "rejected" | "paid";
          client_review_comment?: string | null;
          client_reviewed_at?: string | null;
          overtime_hours?: number;
          overtime_rate_percent?: number;
          night_hours?: number;
          night_rate_percent?: number;
          weekend_hours?: number;
          weekend_rate_percent?: number;
          holiday_hours?: number;
          holiday_rate_percent?: number;
          custom_premium_title?: string | null;
          custom_premium_amount?: number;
          normal_amount?: number;
          overtime_amount?: number;
          night_premium_amount?: number;
          weekend_premium_amount?: number;
          holiday_premium_amount?: number;
          premium_total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string | null;
          client_company_id?: string | null;
          contractor_relationship_id?: string | null;
          entry_type?:
            | "hourly_work"
            | "daily_work"
            | "fixed_service"
            | "client_expense"
            | "business_expense"
            | "material"
            | "adjustment";
          market?: "JP" | "AU";
          date?: string;
          title?: string | null;
          description?: string | null;
          location?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          break_minutes?: number;
          hours?: number | null;
          days?: number | null;
          quantity?: number | null;
          unit?: string | null;
          unit_price?: number | null;
          hourly_rate?: number | null;
          daily_rate?: number | null;
          fixed_amount?: number | null;
          expense_amount?: number | null;
          material_cost?: number | null;
          markup_amount?: number;
          discount_amount?: number;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: "JPY" | "AUD";
          tax_mode?: "inclusive" | "exclusive" | "none";
          tax_rate?: number;
          is_billable?: boolean;
          is_business_expense?: boolean;
          is_client_charge?: boolean;
          receipt_url?: string | null;
          status?: "draft" | "billable" | "invoiced" | "paid" | "cancelled" | "non_billable";
          visibility_to_client?: boolean;
          sent_to_client_at?: string | null;
          client_review_status?: "draft" | "sent" | "received" | "approved" | "rejected" | "paid";
          client_review_comment?: string | null;
          client_reviewed_at?: string | null;
          overtime_hours?: number;
          overtime_rate_percent?: number;
          night_hours?: number;
          night_rate_percent?: number;
          weekend_hours?: number;
          weekend_rate_percent?: number;
          holiday_hours?: number;
          holiday_rate_percent?: number;
          custom_premium_title?: string | null;
          custom_premium_amount?: number;
          normal_amount?: number;
          overtime_amount?: number;
          night_premium_amount?: number;
          weekend_premium_amount?: number;
          holiday_premium_amount?: number;
          premium_total_amount?: number;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_entries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      entry_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          entry_type:
            | "hourly_work"
            | "daily_work"
            | "fixed_service"
            | "client_expense"
            | "business_expense"
            | "material"
            | "adjustment";
          client_id: string | null;
          client_company_id: string | null;
          contractor_relationship_id: string | null;
          market: "JP" | "AU";
          currency: "JPY" | "AUD";
          title: string | null;
          description: string | null;
          location: string | null;
          hourly_rate: number | null;
          daily_rate: number | null;
          unit_price: number | null;
          default_break_minutes: number;
          overtime_rate_percent: number;
          night_rate_percent: number;
          weekend_rate_percent: number;
          holiday_rate_percent: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          entry_type?:
            | "hourly_work"
            | "daily_work"
            | "fixed_service"
            | "client_expense"
            | "business_expense"
            | "material"
            | "adjustment";
          client_id?: string | null;
          client_company_id?: string | null;
          contractor_relationship_id?: string | null;
          market?: "JP" | "AU";
          currency?: "JPY" | "AUD";
          title?: string | null;
          description?: string | null;
          location?: string | null;
          hourly_rate?: number | null;
          daily_rate?: number | null;
          unit_price?: number | null;
          default_break_minutes?: number;
          overtime_rate_percent?: number;
          night_rate_percent?: number;
          weekend_rate_percent?: number;
          holiday_rate_percent?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          entry_type?:
            | "hourly_work"
            | "daily_work"
            | "fixed_service"
            | "client_expense"
            | "business_expense"
            | "material"
            | "adjustment";
          client_id?: string | null;
          client_company_id?: string | null;
          contractor_relationship_id?: string | null;
          market?: "JP" | "AU";
          currency?: "JPY" | "AUD";
          title?: string | null;
          description?: string | null;
          location?: string | null;
          hourly_rate?: number | null;
          daily_rate?: number | null;
          unit_price?: number | null;
          default_break_minutes?: number;
          overtime_rate_percent?: number;
          night_rate_percent?: number;
          weekend_rate_percent?: number;
          holiday_rate_percent?: number;
          is_default?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      monthly_reports: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          report_month: number;
          report_year: number;
          report_number: string;
          total_hours: number;
          total_amount: number;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          report_month: number;
          report_year: number;
          report_number: string;
          total_hours: number;
          total_amount: number;
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          client_id?: string | null;
          report_month?: number;
          report_year?: number;
          report_number?: string;
          total_hours?: number;
          total_amount?: number;
          pdf_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_reports_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          status: "free" | "trial" | "active" | "past_due" | "cancelled" | "manual";
          billing_provider: "manual" | "stripe" | "paypal" | "square";
          billing_provider_customer_id: string | null;
          billing_provider_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_ends_at: string | null;
          cancel_at: string | null;
          cancelled_at: string | null;
          manual_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          status?: "free" | "trial" | "active" | "past_due" | "cancelled" | "manual";
          billing_provider?: "manual" | "stripe" | "paypal" | "square";
          billing_provider_customer_id?: string | null;
          billing_provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          cancel_at?: string | null;
          cancelled_at?: string | null;
          manual_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string | null;
          status?: "free" | "trial" | "active" | "past_due" | "cancelled" | "manual";
          billing_provider?: "manual" | "stripe" | "paypal" | "square";
          billing_provider_customer_id?: string | null;
          billing_provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          cancel_at?: string | null;
          cancelled_at?: string | null;
          manual_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          plan_id: string | null;
          amount: number;
          currency: "JPY" | "AUD";
          status: "pending" | "paid" | "failed" | "refunded" | "cancelled" | "manual";
          payment_method: string | null;
          billing_provider: "manual" | "stripe" | "paypal" | "square";
          provider_payment_id: string | null;
          due_date: string | null;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          plan_id?: string | null;
          amount?: number;
          currency?: "JPY" | "AUD";
          status?: "pending" | "paid" | "failed" | "refunded" | "cancelled" | "manual";
          payment_method?: string | null;
          billing_provider?: "manual" | "stripe" | "paypal" | "square";
          provider_payment_id?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subscription_id?: string | null;
          plan_id?: string | null;
          amount?: number;
          currency?: "JPY" | "AUD";
          status?: "pending" | "paid" | "failed" | "refunded" | "cancelled" | "manual";
          payment_method?: string | null;
          billing_provider?: "manual" | "stripe" | "paypal" | "square";
          provider_payment_id?: string | null;
          due_date?: string | null;
          paid_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_module_access: {
        Row: {
          id: string;
          user_id: string;
          module_name:
            | "work_entries"
            | "clients"
            | "reports"
            | "japan_documents"
            | "australia_documents"
            | "expenses"
            | "materials"
            | "tax_export"
            | "support"
            | "courses"
            | "admin_access";
          is_enabled: boolean;
          enabled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_name:
            | "work_entries"
            | "clients"
            | "reports"
            | "japan_documents"
            | "australia_documents"
            | "expenses"
            | "materials"
            | "tax_export"
            | "support"
            | "courses"
            | "admin_access";
          is_enabled?: boolean;
          enabled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          is_enabled?: boolean;
          enabled_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          status: "open" | "in_review" | "answered" | "resolved" | "closed";
          priority: "low" | "medium" | "high" | "urgent";
          admin_response: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          status?: "open" | "in_review" | "answered" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          admin_response?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          subject?: string;
          message?: string;
          status?: "open" | "in_review" | "answered" | "resolved" | "closed";
          priority?: "low" | "medium" | "high" | "urgent";
          admin_response?: string | null;
          updated_at?: string;
          closed_at?: string | null;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          target_user_id: string | null;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          target_user_id?: string | null;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          admin_user_id?: string | null;
          target_user_id?: string | null;
          action?: string;
          details?: Json;
        };
        Relationships: [];
      };
      admin_settings: {
        Row: {
          id: string;
          system_name: string;
          support_email: string | null;
          default_market: "JP" | "AU";
          default_currency: "JPY" | "AUD";
          free_trial_days: number;
          trial_days: number;
          payment_block_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          system_name?: string;
          support_email?: string | null;
          default_market?: "JP" | "AU";
          default_currency?: "JPY" | "AUD";
          free_trial_days?: number;
          trial_days?: number;
          payment_block_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          system_name?: string;
          support_email?: string | null;
          default_market?: "JP" | "AU";
          default_currency?: "JPY" | "AUD";
          free_trial_days?: number;
          trial_days?: number;
          payment_block_message?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      external_exports: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          client_name: string | null;
          client_company_name: string | null;
          client_country: "JP" | "AU" | null;
          document_id: string | null;
          export_type: "income_report" | "invoice_summary" | "monthly_report" | "tax_declaration_data";
          target_system: string;
          status: "pending" | "sent" | "failed" | "cancelled";
          period_year: number;
          period_month: number;
          currency: "JPY" | "AUD";
          gross_amount: number;
          tax_amount: number;
          net_amount: number;
          expenses_amount: number;
          total_hours: number;
          worked_days: number;
          market: "JP" | "AU";
          payload: Json;
          created_at: string;
          updated_at: string;
          sent_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          client_name?: string | null;
          client_company_name?: string | null;
          client_country?: "JP" | "AU" | null;
          document_id?: string | null;
          export_type?: "income_report" | "invoice_summary" | "monthly_report" | "tax_declaration_data";
          target_system?: string;
          status?: "pending" | "sent" | "failed" | "cancelled";
          period_year: number;
          period_month: number;
          currency: "JPY" | "AUD";
          gross_amount?: number;
          tax_amount?: number;
          net_amount?: number;
          expenses_amount?: number;
          total_hours?: number;
          worked_days?: number;
          market: "JP" | "AU";
          payload?: Json;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
          error_message?: string | null;
        };
        Update: {
          client_id?: string | null;
          client_name?: string | null;
          client_company_name?: string | null;
          client_country?: "JP" | "AU" | null;
          document_id?: string | null;
          export_type?: "income_report" | "invoice_summary" | "monthly_report" | "tax_declaration_data";
          target_system?: string;
          status?: "pending" | "sent" | "failed" | "cancelled";
          period_year?: number;
          period_month?: number;
          currency?: "JPY" | "AUD";
          gross_amount?: number;
          tax_amount?: number;
          net_amount?: number;
          expenses_amount?: number;
          total_hours?: number;
          worked_days?: number;
          market?: "JP" | "AU";
          payload?: Json;
          updated_at?: string;
          sent_at?: string | null;
          error_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "external_exports_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      review_work_entry: {
        Args: {
          entry_id: string;
          review_status: string;
          review_comment?: string | null;
        };
        Returns: void;
      };
      search_client_companies: {
        Args: {
          search_term: string;
        };
        Returns: {
          id: string;
          company_name: string | null;
          country: string | null;
          client_company_code: string | null;
          masked_phone: string | null;
          masked_email: string | null;
          relationship_status: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
export type WorkEntry = Database["public"]["Tables"]["work_entries"]["Row"];
export type EntryTemplate = Database["public"]["Tables"]["entry_templates"]["Row"];
export type MonthlyReport = Database["public"]["Tables"]["monthly_reports"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type UserModuleAccess = Database["public"]["Tables"]["user_module_access"]["Row"];
export type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
export type AdminAuditLog = Database["public"]["Tables"]["admin_audit_logs"]["Row"];
export type AdminSettings = Database["public"]["Tables"]["admin_settings"]["Row"];
export type ExternalExport = Database["public"]["Tables"]["external_exports"]["Row"];
export type ClientCompanyUser = Database["public"]["Tables"]["client_company_users"]["Row"];
export type ContractorRelationship = Database["public"]["Tables"]["contractor_relationships"]["Row"];
export type IssuedDocument = Database["public"]["Tables"]["issued_documents"]["Row"];
export type DocumentReview = Database["public"]["Tables"]["document_reviews"]["Row"];
export type ClientAdjustment = Database["public"]["Tables"]["client_adjustments"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
