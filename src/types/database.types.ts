export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relationship: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relationship?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          relationship?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          family_member_id: string | null;
          name: string;
          description: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_member_id?: string | null;
          name: string;
          description?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_member_id?: string | null;
          name?: string;
          description?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      investments: {
        Row: {
          id: string;
          portfolio_id: string;
          investment_type:
            | 'stock'
            | 'mutual_fund'
            | 'etf'
            | 'fixed_deposit'
            | 'nps'
            | 'epfo'
            | 'real_estate'
            | 'gold'
            | 'bond'
            | 'other';
          symbol: string | null;
          isin: string | null;
          company_name: string | null;
          quantity: number | null;
          purchase_price: number | null;
          current_price: number | null;
          purchase_date: string | null;
          account_number: string | null;
          maturity_date: string | null;
          interest_rate: number | null;
          maturity_amount: number | null;
          property_type: string | null;
          location: string | null;
          area_sqft: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          investment_type:
            | 'stock'
            | 'mutual_fund'
            | 'etf'
            | 'fixed_deposit'
            | 'nps'
            | 'epfo'
            | 'real_estate'
            | 'gold'
            | 'bond'
            | 'other';
          symbol?: string | null;
          isin?: string | null;
          company_name?: string | null;
          quantity?: number | null;
          purchase_price?: number | null;
          current_price?: number | null;
          purchase_date?: string | null;
          account_number?: string | null;
          maturity_date?: string | null;
          interest_rate?: number | null;
          maturity_amount?: number | null;
          property_type?: string | null;
          location?: string | null;
          area_sqft?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          investment_type?:
            | 'stock'
            | 'mutual_fund'
            | 'etf'
            | 'fixed_deposit'
            | 'nps'
            | 'epfo'
            | 'real_estate'
            | 'gold'
            | 'bond'
            | 'other';
          symbol?: string | null;
          isin?: string | null;
          company_name?: string | null;
          quantity?: number | null;
          purchase_price?: number | null;
          current_price?: number | null;
          purchase_date?: string | null;
          account_number?: string | null;
          maturity_date?: string | null;
          interest_rate?: number | null;
          maturity_amount?: number | null;
          property_type?: string | null;
          location?: string | null;
          area_sqft?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          investment_id: string;
          transaction_type: string;
          quantity: number | null;
          price: number | null;
          total_amount: number | null;
          transaction_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          investment_id: string;
          transaction_type: string;
          quantity?: number | null;
          price?: number | null;
          total_amount?: number | null;
          transaction_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          investment_id?: string;
          transaction_type?: string;
          quantity?: number | null;
          price?: number | null;
          total_amount?: number | null;
          transaction_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      market_data: {
        Row: {
          id: string;
          symbol: string;
          isin: string | null;
          company_name: string | null;
          current_price: number | null;
          previous_close: number | null;
          change_percent: number | null;
          volume: number | null;
          market_cap: number | null;
          last_updated: string;
          data_source: string;
          raw_data: Json | null;
        };
        Insert: {
          id?: string;
          symbol: string;
          isin?: string | null;
          company_name?: string | null;
          current_price?: number | null;
          previous_close?: number | null;
          change_percent?: number | null;
          volume?: number | null;
          market_cap?: number | null;
          last_updated?: string;
          data_source?: string;
          raw_data?: Json | null;
        };
        Update: {
          id?: string;
          symbol?: string;
          isin?: string | null;
          company_name?: string | null;
          current_price?: number | null;
          previous_close?: number | null;
          change_percent?: number | null;
          volume?: number | null;
          market_cap?: number | null;
          last_updated?: string;
          data_source?: string;
          raw_data?: Json | null;
        };
      };
      mutual_fund_data: {
        Row: {
          id: string;
          scheme_code: string;
          scheme_name: string;
          isin: string | null;
          nav: number | null;
          nav_date: string | null;
          fund_house: string | null;
          category: string | null;
          last_updated: string;
          raw_data: Json | null;
        };
        Insert: {
          id?: string;
          scheme_code: string;
          scheme_name: string;
          isin?: string | null;
          nav?: number | null;
          nav_date?: string | null;
          fund_house?: string | null;
          category?: string | null;
          last_updated?: string;
          raw_data?: Json | null;
        };
        Update: {
          id?: string;
          scheme_code?: string;
          scheme_name?: string;
          isin?: string | null;
          nav?: number | null;
          nav_date?: string | null;
          fund_house?: string | null;
          category?: string | null;
          last_updated?: string;
          raw_data?: Json | null;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          price_alerts: boolean;
          weekly_reports: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_notifications?: boolean;
          price_alerts?: boolean;
          weekly_reports?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_notifications?: boolean;
          price_alerts?: boolean;
          weekly_reports?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
