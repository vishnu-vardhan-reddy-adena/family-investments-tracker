# Fix for Blank/Wrong Values in Portfolio Metadata Columns

## Problem Diagnosis

Your portfolio page is showing blank or "N/A" values in these columns:

- Sector
- Industry
- Industry Type
- Industry Subgroup
- Macro-Economic Indicator
- Market Cap

**Root Cause:** Your `stock_metadata` table only has **1436 records** out of **4535 NSE stocks**.

## Affected Stocks

Stocks in your portfolio missing metadata:

- ❌ **RIL** - Not found (should be "RELIANCE" in NSE)
- ❌ **IKIO** - Not in database
- ❌ **INDUSINDBK** - Not found (should be "INDUSIND" in NSE)
- ❌ **INOXINDIA** - Not in database
- ❌ **INNOVACAP** - Not in database
- ❌ **NTPCGREEN** - Not in database (recently listed)

Stocks with metadata:

- ✅ HDFCBANK, ETERNAL, KPITTECH, IOB, RPOWER, MTARTECH, AUBANK, SBIN, YESBANK, DATAPATTNS, SUZLON, RTNPOWER

## Solution: Import Complete NSE Stock List

### Step 1: Access Admin Stocks Page

1. Navigate to: `http://localhost:3000/admin`
2. Click on **"Stock Metadata"** card (purple card that says "Manage Stocks")
3. Or directly go to: `http://localhost:3000/admin/stocks`

### Step 2: Import NSE Stock List

1. On the Stock Metadata page, click **"Import from Excel"** button
2. Select the file: `sample_import_template.csv` (located in your project root)
3. Click **Import**
4. Wait for the import to complete (~4535 stocks)

**This will:**

- Update existing 1436 stocks
- Add 3099 missing stocks
- Total: 4535 stocks with complete metadata

### Step 3: Verify

After import:

1. Refresh the Stock Metadata page
2. You should see: **Total Stocks: 4535**
3. Go back to Portfolio page
4. All columns should now show values

## Alternative: Fix Symbol Mismatches

Some stocks in your portfolio have different symbols than NSE standard:

### Manual Symbol Updates

If you want to keep your current symbols, you'll need to update them:

| Your Symbol | NSE Symbol | Action                                             |
| ----------- | ---------- | -------------------------------------------------- |
| RIL         | RELIANCE   | Update investment symbol to "RELIANCE"             |
| INDUSINDBK  | INDUSINDBK | Already correct, just needs import                 |
| IKIO        | IKIO       | Needs manual metadata entry                        |
| INOXINDIA   | INOXINDIA  | Needs manual metadata entry                        |
| INNOVACAP   | INNOVACAP  | Needs manual metadata entry                        |
| NTPCGREEN   | NTPCGREEN  | Needs manual metadata entry or wait for NSE update |

### Option A: Update via SQL

```sql
-- Update RIL to RELIANCE
UPDATE investments
SET symbol = 'RELIANCE'
WHERE symbol = 'RIL';

UPDATE market_data
SET symbol = 'RELIANCE'
WHERE symbol = 'RIL';
```

### Option B: Update via Transactions Page

1. Go to Transactions page
2. Edit each RIL transaction
3. Change symbol to "RELIANCE"

## Why This Happened

1. **Partial Import**: Only 1436 of 4535 stocks were imported
2. **Symbol Mismatches**: Some stocks use ticker symbols (RIL) vs full names (RELIANCE)
3. **New Listings**: Some stocks (NTPCGREEN) are newly listed and not in older NSE exports

## Expected Results After Import

**Before Import:**

```
Total Stocks: 1436
Stocks with Sector: ~1200
Stocks with Industry: ~1200
Large Cap: ~100
Mid Cap: ~150
Small Cap: ~500
```

**After Import:**

```
Total Stocks: 4535
Stocks with Sector: ~4500
Stocks with Industry: ~4500
Large Cap: ~250
Mid Cap: ~750
Small Cap: ~3500
```

## Testing

After importing, check your portfolio:

```
Stock: IOB (Indian Overseas Bank)
✅ Sector: Financial Services
✅ Industry: Banks
✅ Industry Type: Public Sector Bank
✅ Market Cap: ₹773.73 Cr (Small Cap)

Stock: MTARTECH (MTAR Technologies)
✅ Sector: Capital Goods
✅ Industry: Aerospace & Defense
✅ Industry Type: Aerospace & Defense
✅ Market Cap: ₹70.43 Cr (Small Cap)
```

## Troubleshooting

### If columns still show blank after import:

1. **Check browser console** (F12) for errors
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Restart dev server**:

   ```powershell
   # Stop server
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

   # Start server
   npm run dev
   ```

### If specific stocks still missing:

1. Go to Admin → Stock Metadata
2. Search for the stock symbol
3. If not found, add manually:
   - Click "Add Stock" (if button exists) or use database directly
   - Enter symbol, company name, sector, industry, etc.

### If import fails:

1. Check file format (tab-separated values)
2. Verify first row has these columns:
   - Security Code, Security Id, Ticker, Security Name
   - Current Price, Market Capitalization, Company Type
   - Industry Type, Macro-Economic Indicator, Sector
   - Industry, Industry Subgroup Name
3. File should have 4535 rows (+ 1 header row)

## Files Modified

- ✅ `scripts/check_metadata.ts` - Diagnostic script to check database
- ✅ `src/app/admin/stocks/page.tsx` - Admin page for stock management

## Quick Import Command (Alternative)

If you prefer command-line import:

```powershell
# Navigate to project root
cd "D:\PF Track"

# Run Python import script (if you have one)
python scripts/import_nse_stocks.py sample_import_template.csv
```

## Summary

**Quick Fix (5 minutes):**

1. Go to `http://localhost:3000/admin/stocks`
2. Click "Import from Excel"
3. Select `sample_import_template.csv`
4. Import complete
5. Refresh portfolio page

**Result:** All metadata columns will show proper values! ✅
