-- Add SME to market_cap_category allowed values
-- Migration: Add SME category for stock metadata

-- Drop the existing constraint
ALTER TABLE public.stock_metadata
DROP CONSTRAINT IF EXISTS stock_metadata_market_cap_category_check;

-- Add new constraint with SME included
ALTER TABLE public.stock_metadata
ADD CONSTRAINT stock_metadata_market_cap_category_check CHECK (
  market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap', 'SME')
);

-- Update comment to reflect new category
COMMENT ON COLUMN public.stock_metadata.market_cap_category IS 'Market cap category: Large Cap, Mid Cap, Small Cap, Micro Cap, or SME (Small and Medium Enterprises)';
