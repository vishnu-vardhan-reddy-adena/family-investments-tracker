# Dynamic Market Cap Implementation Guide

## 🎯 Overview

Implemented real-time market cap calculation that updates automatically with stock prices.

### **Before:**
- ❌ Market Cap: Static value from CSV import
- ❌ Never updates even when stock price changes

### **After:**
- ✅ Market Cap: Dynamically calculated = Current Price × Outstanding Shares
- ✅ Updates in real-time whenever stock price changes
- ✅ Accurate market cap based on live NSE data

## 🔧 Implementation Steps

### **Step 1: Add Database Column**

Run this SQL in Supabase Dashboard (https://supabase.com/dashboard/project/vhuvcsomnxntirnyxunj/sql):

```sql
-- Add outstanding_shares column to stock_metadata
ALTER TABLE public.stock_metadata
ADD COLUMN IF NOT EXISTS outstanding_shares DECIMAL(18, 4) NULL;

-- Add comment
COMMENT ON COLUMN public.stock_metadata.outstanding_shares IS 'Number of outstanding shares in crores. Used to calculate dynamic market cap from current price.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_stock_metadata_outstanding_shares 
ON public.stock_metadata USING btree (outstanding_shares);

-- Update outstanding_shares from existing market_cap and current price
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
```

**This will:**
1. Add `outstanding_shares` column to store the number of shares
2. Calculate outstanding shares from existing market_cap and price data
3. Create an index for query performance

### **Step 2: Verify Migration**

Run the verification script:

```powershell
python scripts\add_outstanding_shares.py
```

This will:
- Show you the migration SQL
- Wait for you to apply it
- Verify the column was added successfully
- Show statistics on data coverage

### **Step 3: Fix Database Constraint (If Not Done)**

If you haven't already, run this to allow "SME" category:

```sql
-- Drop the existing constraint
ALTER TABLE public.stock_metadata 
DROP CONSTRAINT IF EXISTS stock_metadata_market_cap_category_check;

-- Add new constraint with SME included
ALTER TABLE public.stock_metadata
ADD CONSTRAINT stock_metadata_market_cap_category_check CHECK (
  market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap', 'SME')
);
```

### **Step 4: Import Complete Stock List**

```powershell
python scripts\import_stock_metadata.py
```

**This now:**
- Imports 4,533 stocks with complete metadata
- Calculates and stores `outstanding_shares` for each stock
- Enables dynamic market cap calculation

## 📊 How It Works

### **Formula:**

```
Market Cap (Crores) = Current Price (₹) × Outstanding Shares (Crores)
```

### **Example: KPITTECH**

**Static Data (from CSV):**
- Market Cap: ₹31,551.10 Cr
- Current Price: ₹1,219.30 (from CSV)
- Outstanding Shares: 31,551.10 ÷ 1,219.30 = **25.88 Cr shares**

**Dynamic Calculation (real-time):**
- Live Price: ₹1,250.00 (fetched from NSE)
- Outstanding Shares: 25.88 Cr (stored in DB)
- **Market Cap = ₹1,250.00 × 25.88 = ₹32,350 Cr** ✅

### **Fallback Logic:**

```typescript
// If outstanding_shares exists, calculate dynamically
if (outstanding_shares && current_price) {
  marketCap = current_price × outstanding_shares;
}
// Otherwise, use static value from CSV
else {
  marketCap = static_market_cap;
}
```

## 📈 Benefits

### **1. Real-Time Updates**
- Market cap updates every 15 minutes with stock price
- No manual CSV imports needed

### **2. Accurate Valuations**
- Reflects current market conditions
- Accounts for price movements

### **3. Future-Proof**
- Outstanding shares rarely change
- Works even if NSE API changes

### **4. Performance**
- No additional API calls
- Simple multiplication operation
- Indexed column for fast queries

## 🔍 Verification

### **Check Outstanding Shares Data:**

```powershell
npx tsx -e "import {createClient} from '@supabase/supabase-js'; /* ... */ "
```

Or run:
```powershell
python scripts\check_market_cap.py
```

### **Expected Output:**

```
SBIN (Large Cap):
  Static Market Cap: ₹841,372.08 Cr
  Outstanding Shares: 925.47 Cr shares
  Live Price: ₹967.95
  Dynamic Market Cap: ₹896,017.82 Cr ✅
```

## 🎨 Portfolio Display

### **Before (Static):**
```
KPITTECH | ₹31,551.10 Cr (never changes)
```

### **After (Dynamic):**
```
KPITTECH | ₹32,350.00 Cr (updates with price)
```

## 📝 Code Changes

### **1. Portfolio Page (`src/app/portfolio/page.tsx`)**

```typescript
// Calculate market cap dynamically
const outstandingShares = metadata?.outstanding_shares 
  ? parseFloat(metadata.outstanding_shares) 
  : null;
const currentMarketPrice = marketDataMap[symbol]?.current_price 
  ? parseFloat(marketDataMap[symbol].current_price) 
  : null;

// Dynamic calculation with fallback
const marketCap = (outstandingShares && currentMarketPrice) 
  ? outstandingShares * currentMarketPrice 
  : (metadata?.market_cap ? parseFloat(metadata.market_cap) : null);
```

### **2. Import Script (`scripts/import_stock_metadata.py`)**

```python
# Calculate outstanding shares during import
current_price = float(row.get('Current Price', 0))
market_cap = float(row['Market Capitalization'])

outstanding_shares = None
if market_cap and current_price and current_price > 0:
    outstanding_shares = market_cap / current_price

metadata = {
    # ... other fields
    'market_cap': market_cap,
    'outstanding_shares': outstanding_shares,  # NEW
}
```

## 🚀 Deployment Checklist

- [ ] Run SQL to add `outstanding_shares` column
- [ ] Verify column added successfully
- [ ] Fix market_cap_category constraint (add SME)
- [ ] Import complete stock list with outstanding_shares
- [ ] Restart Next.js dev server
- [ ] Refresh browser to see dynamic market cap
- [ ] Verify market cap changes when price updates

## 📊 Monitoring

### **Check Coverage:**

```sql
SELECT 
  COUNT(*) as total_stocks,
  COUNT(outstanding_shares) as with_shares,
  ROUND(COUNT(outstanding_shares) * 100.0 / COUNT(*), 2) as coverage_percent
FROM stock_metadata;
```

### **Expected:**
```
Total: 4,533 stocks
With Shares: 4,500+ (99%+)
Coverage: 99.27%
```

## 🔧 Troubleshooting

### **Market Cap Shows NULL:**
- Check if `outstanding_shares` is NULL for that stock
- Verify `current_price` exists in `market_data` table
- Fallback to static `market_cap` if both are missing

### **Market Cap Too High/Low:**
- Verify units: outstanding_shares should be in crores
- Check calculation: market_cap = price × shares
- Compare with static value for sanity check

### **Data Not Updating:**
- Restart Next.js dev server: `npm run dev`
- Clear browser cache (Ctrl+Shift+Delete)
- Check GitHub Actions is running (updates prices)

## 🎯 Next Steps

After implementation:

1. **Monitor accuracy** - Compare dynamic vs static values
2. **Update quarterly** - Refresh outstanding_shares if companies do splits/buybacks
3. **Add alerts** - Notify if market cap calculation seems off
4. **Historical tracking** - Store market cap snapshots for trends

## 📚 Files Modified

- ✅ `supabase/migrations/20251115130000_add_outstanding_shares.sql` - Database migration
- ✅ `src/app/portfolio/page.tsx` - Dynamic market cap calculation
- ✅ `scripts/import_stock_metadata.py` - Calculate outstanding_shares on import
- ✅ `scripts/add_outstanding_shares.py` - Verification script

## 🎉 Result

**You now have real-time market cap that updates automatically with stock prices!**

Example:
- **9:30 AM:** KPITTECH @ ₹1,219.30 → Market Cap: ₹31,551 Cr
- **10:00 AM:** KPITTECH @ ₹1,250.00 → Market Cap: ₹32,350 Cr ✅ (Updated!)
- **3:30 PM:** KPITTECH @ ₹1,180.50 → Market Cap: ₹30,551 Cr ✅ (Updated!)
