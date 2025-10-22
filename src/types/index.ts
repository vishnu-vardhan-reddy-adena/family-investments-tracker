export type InvestmentType =
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

export interface Portfolio {
  id: string;
  user_id: string;
  family_member_id?: string;
  name: string;
  description?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  portfolio_id: string;
  investment_type: InvestmentType;
  symbol?: string;
  isin?: string;
  company_name?: string;
  quantity?: number;
  purchase_price?: number;
  current_price?: number;
  purchase_date?: string;
  account_number?: string;
  maturity_date?: string;
  interest_rate?: number;
  maturity_amount?: number;
  property_type?: string;
  location?: string;
  area_sqft?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketData {
  id: string;
  symbol: string;
  isin?: string;
  company_name?: string;
  current_price?: number;
  previous_close?: number;
  change_percent?: number;
  volume?: number;
  market_cap?: number;
  last_updated: string;
  data_source: string;
  raw_data?: any;
}

export interface Transaction {
  id: string;
  investment_id: string;
  transaction_type: string;
  quantity?: number;
  price?: number;
  total_amount?: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
}
