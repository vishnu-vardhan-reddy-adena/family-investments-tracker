-- Portfolio Tracker Database Schema for Supabase
-- This file contains all table definitions, indexes, and RLS policies

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
  relationship TEXT, -- spouse, child, parent, etc.
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment types enum
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

  -- Stock/ETF/MF specific fields
  symbol TEXT, -- NSE symbol
  isin TEXT, -- ISIN code
  company_name TEXT,

  -- Quantity and pricing
  quantity DECIMAL(18, 4),
  purchase_price DECIMAL(18, 2),
  current_price DECIMAL(18, 2),
  purchase_date DATE,

  -- FD/NPS/EPFO specific fields
  account_number TEXT,
  maturity_date DATE,
  interest_rate DECIMAL(5, 2),
  maturity_amount DECIMAL(18, 2),

  -- Real estate specific
  property_type TEXT, -- residential, commercial, land
  location TEXT,
  area_sqft DECIMAL(10, 2),

  -- Common fields
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (buy/sell history)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL, -- buy, sell, dividend, bonus
  quantity DECIMAL(18, 4),
  price DECIMAL(18, 2),
  total_amount DECIMAL(18, 2),
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache table (for NSE data)
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
  data_source TEXT DEFAULT 'NSE', -- NSE, BSE, etc.
  raw_data JSONB -- Store complete API response
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_family_member_id ON public.portfolios(family_member_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON public.investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_symbol ON public.investments(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON public.transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON public.market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_last_updated ON public.market_data(last_updated);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_fund_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Family members policies
CREATE POLICY "Users can view own family members" ON public.family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family members" ON public.family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family members" ON public.family_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family members" ON public.family_members
  FOR DELETE USING (auth.uid() = user_id);

-- Portfolios policies
CREATE POLICY "Users can view own portfolios" ON public.portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON public.portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON public.portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON public.portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Investments policies
CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = investments.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = investments.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = investments.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own investments" ON public.investments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = investments.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Transactions policies (similar to investments)
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.investments
      JOIN public.portfolios ON portfolios.id = investments.portfolio_id
      WHERE investments.id = transactions.investment_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investments
      JOIN public.portfolios ON portfolios.id = investments.portfolio_id
      WHERE investments.id = transactions.investment_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.investments
      JOIN public.portfolios ON portfolios.id = investments.portfolio_id
      WHERE investments.id = transactions.investment_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.investments
      JOIN public.portfolios ON portfolios.id = investments.portfolio_id
      WHERE investments.id = transactions.investment_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Market data policies
CREATE POLICY "All authenticated users can view market data" ON public.market_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert market data" ON public.market_data
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update market data" ON public.market_data
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Mutual fund data policies
CREATE POLICY "All authenticated users can view mutual fund data" ON public.mutual_fund_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert mutual fund data" ON public.mutual_fund_data
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update mutual fund data" ON public.mutual_fund_data
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile and preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );

  INSERT INTO public.user_preferences (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate portfolio value
CREATE OR REPLACE FUNCTION public.get_portfolio_value(p_portfolio_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(quantity * COALESCE(current_price, purchase_price)), 0)
  FROM public.investments
  WHERE portfolio_id = p_portfolio_id;
$$ LANGUAGE SQL STABLE;

-- Function to calculate portfolio profit/loss
CREATE OR REPLACE FUNCTION public.get_portfolio_profit_loss(p_portfolio_id UUID)
RETURNS TABLE(
  total_invested DECIMAL,
  current_value DECIMAL,
  profit_loss DECIMAL,
  profit_loss_percent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(quantity * purchase_price), 0) AS total_invested,
    COALESCE(SUM(quantity * COALESCE(current_price, purchase_price)), 0) AS current_value,
    COALESCE(SUM(quantity * COALESCE(current_price, purchase_price)), 0) -
    COALESCE(SUM(quantity * purchase_price), 0) AS profit_loss,
    CASE
      WHEN SUM(quantity * purchase_price) > 0 THEN
        ((COALESCE(SUM(quantity * COALESCE(current_price, purchase_price)), 0) -
          COALESCE(SUM(quantity * purchase_price), 0)) /
          COALESCE(SUM(quantity * purchase_price), 1)) * 100
      ELSE 0
    END AS profit_loss_percent
  FROM public.investments
  WHERE portfolio_id = p_portfolio_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's total portfolio summary
CREATE OR REPLACE FUNCTION public.get_user_portfolio_summary(p_user_id UUID)
RETURNS TABLE(
  total_portfolios BIGINT,
  total_investments BIGINT,
  total_invested DECIMAL,
  current_value DECIMAL,
  profit_loss DECIMAL,
  profit_loss_percent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id) AS total_portfolios,
    COUNT(i.id) AS total_investments,
    COALESCE(SUM(i.quantity * i.purchase_price), 0) AS total_invested,
    COALESCE(SUM(i.quantity * COALESCE(i.current_price, i.purchase_price)), 0) AS current_value,
    COALESCE(SUM(i.quantity * COALESCE(i.current_price, i.purchase_price)), 0) -
    COALESCE(SUM(i.quantity * i.purchase_price), 0) AS profit_loss,
    CASE
      WHEN SUM(i.quantity * i.purchase_price) > 0 THEN
        ((COALESCE(SUM(i.quantity * COALESCE(i.current_price, i.purchase_price)), 0) -
          COALESCE(SUM(i.quantity * i.purchase_price), 0)) /
          COALESCE(SUM(i.quantity * i.purchase_price), 1)) * 100
      ELSE 0
    END AS profit_loss_percent
  FROM public.portfolios p
  LEFT JOIN public.investments i ON p.id = i.portfolio_id
  WHERE p.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;
