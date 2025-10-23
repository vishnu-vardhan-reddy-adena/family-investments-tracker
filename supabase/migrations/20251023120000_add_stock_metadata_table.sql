-- Migration: Add Stock Metadata Table
-- Description: Creates stock_metadata table for storing comprehensive stock information
-- Date: 2025-10-23

-- Create stock_metadata table with all necessary columns
CREATE TABLE IF NOT EXISTS public.stock_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  symbol VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,

  -- Classification fields
  sector VARCHAR(100) NULL,
  industry VARCHAR(100) NULL,
  industry_type VARCHAR(100) NULL,
  industry_sub_group VARCHAR(150) NULL,
  macro_economic_indicator VARCHAR(100) NULL,

  -- Market cap fields
  market_cap_category VARCHAR(20) NULL,
  market_cap NUMERIC(20, 2) NULL,

  -- Financial ratios (for future use)
  pe_ratio NUMERIC(10, 2) NULL,
  pb_ratio NUMERIC(10, 2) NULL,
  dividend_yield NUMERIC(5, 2) NULL,

  -- Index membership
  in_nifty_50 BOOLEAN NULL DEFAULT FALSE,
  in_nifty_500 BOOLEAN NULL DEFAULT FALSE,

  -- Metadata
  exchange VARCHAR(20) NULL DEFAULT 'NSE',
  last_updated TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT stock_metadata_pkey PRIMARY KEY (id),
  CONSTRAINT stock_metadata_symbol_key UNIQUE (symbol),
  CONSTRAINT stock_metadata_market_cap_category_check CHECK (
    market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap')
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_metadata_symbol ON public.stock_metadata USING btree (symbol);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_sector ON public.stock_metadata USING btree (sector);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_industry ON public.stock_metadata USING btree (industry);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_market_cap_category ON public.stock_metadata USING btree (market_cap_category);
CREATE INDEX IF NOT EXISTS idx_stock_metadata_industry_type ON public.stock_metadata USING btree (industry_type);

-- Add comment on table
COMMENT ON TABLE public.stock_metadata IS 'Stores comprehensive metadata for stocks including sector, industry, market cap, and financial metrics';

-- Add comments on important columns
COMMENT ON COLUMN public.stock_metadata.sector IS 'Business sector (e.g., Capital Goods, Energy)';
COMMENT ON COLUMN public.stock_metadata.industry IS 'Industry classification (e.g., Electrical Equipment)';
COMMENT ON COLUMN public.stock_metadata.industry_type IS 'Industry type from NSE export';
COMMENT ON COLUMN public.stock_metadata.industry_sub_group IS 'Industry subgroup classification';
COMMENT ON COLUMN public.stock_metadata.macro_economic_indicator IS 'Macro-economic indicator category';
COMMENT ON COLUMN public.stock_metadata.market_cap_category IS 'Market cap category: Large Cap, Mid Cap, Small Cap, or Micro Cap';
COMMENT ON COLUMN public.stock_metadata.market_cap IS 'Market capitalization in crores';

-- Enable Row Level Security
ALTER TABLE public.stock_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read, only admins can write
CREATE POLICY "All authenticated users can view stock metadata"
  ON public.stock_metadata
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert stock metadata"
  ON public.stock_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can update stock metadata"
  ON public.stock_metadata
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete stock metadata"
  ON public.stock_metadata
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
