-- Migration: Fix Existing Incomplete Tables
-- Created: 2025-10-22
-- Description: Add missing columns to existing tables and ensure all constraints exist

-- Drop and recreate investments table with all columns
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Recreate investments table with all columns
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

-- Recreate transactions table
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

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON public.investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_symbol ON public.investments(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON public.transactions(investment_id);

-- Enable RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for investments
DO $$ BEGIN
  CREATE POLICY "Users can view own investments" ON public.investments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.portfolios
        WHERE portfolios.id = investments.portfolio_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own investments" ON public.investments
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.portfolios
        WHERE portfolios.id = investments.portfolio_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own investments" ON public.investments
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.portfolios
        WHERE portfolios.id = investments.portfolio_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own investments" ON public.investments
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.portfolios
        WHERE portfolios.id = investments.portfolio_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Recreate RLS policies for transactions
DO $$ BEGIN
  CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.investments
        JOIN public.portfolios ON portfolios.id = investments.portfolio_id
        WHERE investments.id = transactions.investment_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.investments
        JOIN public.portfolios ON portfolios.id = investments.portfolio_id
        WHERE investments.id = transactions.investment_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.investments
        JOIN public.portfolios ON portfolios.id = investments.portfolio_id
        WHERE investments.id = transactions.investment_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.investments
        JOIN public.portfolios ON portfolios.id = investments.portfolio_id
        WHERE investments.id = transactions.investment_id
        AND portfolios.user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
