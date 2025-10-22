-- Migration: Initial Schema Setup
-- Created: 2025-10-22
-- Description: Create all base tables, indexes, RLS policies, and utility functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment types enum
DO $$ BEGIN
  CREATE TYPE investment_type AS ENUM (
    'stock',
    'mutual_fund',
    'etf',
    'fixed_deposit',
    'nps',
    'epfo',
    'real_estate',
    'gold',
    'bond',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments/Holdings table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  investment_type investment_type NOT NULL,
  symbol TEXT,
  isin TEXT,
  company_name TEXT,
  quantity DECIMAL(18, 4),
  purchase_price DECIMAL(18, 2),
  current_price DECIMAL(18, 2),
  purchase_date DATE,
  account_number TEXT,
  maturity_date DATE,
  interest_rate DECIMAL(5, 2),
  maturity_amount DECIMAL(18, 2),
  property_type TEXT,
  location TEXT,
  area_sqft DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL,
  quantity DECIMAL(18, 4),
  price DECIMAL(18, 2),
  total_amount DECIMAL(18, 2),
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache table
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  isin TEXT,
  company_name TEXT,
  current_price DECIMAL(18, 2),
  previous_close DECIMAL(18, 2),
  change_percent DECIMAL(10, 2),
  volume BIGINT,
  market_cap DECIMAL(20, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source TEXT DEFAULT 'NSE',
  raw_data JSONB
);

-- Mutual fund data table
CREATE TABLE IF NOT EXISTS public.mutual_fund_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scheme_code TEXT NOT NULL UNIQUE,
  scheme_name TEXT NOT NULL,
  isin TEXT,
  nav DECIMAL(18, 4),
  nav_date DATE,
  fund_house TEXT,
  category TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_data JSONB
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT false,
  weekly_reports BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_family_member_id ON public.portfolios(family_member_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON public.investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_symbol ON public.investments(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON public.transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON public.market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_last_updated ON public.market_data(last_updated);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_fund_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  -- Profiles policies
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Continue with other policies...
-- (Add all other policies with similar DO blocks)
