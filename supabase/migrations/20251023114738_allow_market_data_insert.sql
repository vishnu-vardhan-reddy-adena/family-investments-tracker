-- Migration: Allow authenticated users to insert/update market data
-- Created: 2025-10-23
-- Description: Adds INSERT and UPDATE policies for market_data table to allow
--              the NSE data fetcher API to populate stock prices

-- Add INSERT policy for market_data
CREATE POLICY "Authenticated users can insert market data"
ON public.market_data
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy for market_data
CREATE POLICY "Authenticated users can update market data"
ON public.market_data
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add INSERT policy for mutual_fund_data (for future use)
CREATE POLICY "Authenticated users can insert mutual fund data"
ON public.mutual_fund_data
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy for mutual_fund_data (for future use)
CREATE POLICY "Authenticated users can update mutual fund data"
ON public.mutual_fund_data
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
