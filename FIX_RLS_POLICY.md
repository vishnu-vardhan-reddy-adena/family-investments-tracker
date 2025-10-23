# 🔧 Quick Fix: Apply RLS Policy for Market Data

## The Problem

The `market_data` table has Row Level Security (RLS) enabled but only has a SELECT policy. When the NSE data fetcher tries to INSERT new stock data, it gets blocked by RLS.

## The Solution

Add INSERT and UPDATE policies to allow authenticated users to write to `market_data`.

## Option 1: Apply via Supabase Dashboard (Recommended - No CLI needed)

1. **Go to your Supabase project dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Paste and run this SQL**:

   ```sql
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
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify success**: You should see "Success. No rows returned"

## Option 2: Install Supabase CLI and Push Migration

1. **Install Supabase CLI**:

   ```powershell
   # Using Scoop (recommended for Windows)
   scoop install supabase

   # Or download from: https://github.com/supabase/cli/releases
   ```

2. **Link to your project**:

   ```powershell
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Push the migration**:
   ```powershell
   supabase db push
   ```

## After Applying the Fix

1. **Go back to your dashboard**: http://localhost:3000/dashboard

2. **Click "Fetch NSE Data"** again

3. **Click "Fetch Now"**

4. **You should now see success!** ✅
   ```
   NSE data fetch completed
   ✓ Successful: 48/50
   ```

## Verify It Worked

Check the policies in Supabase:

1. Dashboard → Database → Policies
2. Find `market_data` table
3. You should see 3 policies:
   - ✅ "All authenticated users can view market data" (SELECT)
   - ✅ "Authenticated users can insert market data" (INSERT)
   - ✅ "Authenticated users can update market data" (UPDATE)

## Why This Happened

The original schema only had a SELECT policy:

```sql
-- Old (read-only)
CREATE POLICY "All authenticated users can view market data"
ON public.market_data
FOR SELECT USING (auth.role() = 'authenticated');
```

But our API needs to INSERT and UPDATE data, so we added:

```sql
-- New (read-write)
CREATE POLICY "Authenticated users can insert market data"
ON public.market_data
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update market data"
ON public.market_data
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

## Security Note

These policies allow ANY authenticated user to insert/update market data. This is fine for this use case because:

- ✅ Market data is public information
- ✅ Only authenticated users can access
- ✅ The API validates data before inserting
- ✅ Upserts are idempotent (safe to run multiple times)

If you want more restrictive policies (e.g., only admin users can update), you could change it to:

```sql
-- Example: Only admins can insert/update
CREATE POLICY "Only admins can insert market data"
ON public.market_data
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

But for now, allowing all authenticated users is the simplest and most practical approach.

---

**Quick Action**: Just copy the SQL from Option 1 and run it in Supabase SQL Editor! Takes 30 seconds. 🚀
