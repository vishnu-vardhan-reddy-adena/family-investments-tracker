-- Add outstanding_shares column to stock_metadata
-- This allows dynamic market cap calculation: market_cap = current_price × outstanding_shares

-- Add outstanding_shares column (in crores for easier calculation)
ALTER TABLE public.stock_metadata
ADD COLUMN IF NOT EXISTS outstanding_shares DECIMAL(18, 4) NULL;

-- Add comment
COMMENT ON COLUMN public.stock_metadata.outstanding_shares IS 'Number of outstanding shares in crores. Used to calculate dynamic market cap from current price.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_stock_metadata_outstanding_shares
ON public.stock_metadata USING btree (outstanding_shares);

-- Update outstanding_shares from existing market_cap and current price
-- Formula: outstanding_shares = market_cap / current_price (both in crores/rupees)
-- We'll use market_data table for current prices
UPDATE public.stock_metadata sm
SET outstanding_shares = CASE
  WHEN md.current_price > 0 THEN sm.market_cap / md.current_price
  ELSE NULL
END
FROM public.market_data md
WHERE sm.symbol = md.symbol
  AND sm.market_cap IS NOT NULL
  AND md.current_price IS NOT NULL
  AND md.current_price > 0;
