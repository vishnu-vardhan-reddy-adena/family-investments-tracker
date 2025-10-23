# NSE Data Fetcher - Next.js API

## Overview

This replaces the Python `nse_fetcher.py` script with a pure Next.js API that fetches live NSE stock data without requiring Python installation.

## Features

✅ **No Python Required** - Pure TypeScript/Next.js implementation
✅ **Live NSE Data** - Fetches real-time data for Nifty 50 stocks via Yahoo Finance API
✅ **One-Click UI** - Beautiful dashboard button to trigger data fetch
✅ **Status Tracking** - Shows how many stocks are in the database and last update time
✅ **Error Handling** - Gracefully handles API failures and shows detailed error messages
✅ **Automatic Upserts** - Updates existing stocks, inserts new ones

## Usage

### 1. From the Dashboard

1. Navigate to `/dashboard`
2. Click the **"Fetch NSE Data"** button (top right, next to "Add Investment")
3. Click **"Fetch Now"** in the dialog
4. Wait 1-2 minutes for the process to complete
5. See success/failure statistics

### 2. Via API Endpoint

**Get Status:**

```bash
GET /api/stocks/fetch-nse
```

Response:

```json
{
  "stocksInDatabase": 50,
  "lastUpdated": "2025-10-23T10:30:00.000Z",
  "message": "Data available"
}
```

**Fetch Data:**

```bash
POST /api/stocks/fetch-nse
```

Response:

```json
{
  "success": true,
  "message": "NSE data fetch completed",
  "stats": {
    "total": 50,
    "successful": 48,
    "failed": 2
  },
  "errors": ["TCS: No data available", "WIPRO: No data available"]
}
```

## How It Works

### 1. API Route (`/api/stocks/fetch-nse/route.ts`)

- **GET**: Returns current database status (count, last updated time)
- **POST**: Fetches live data for Nifty 50 stocks

### 2. Data Source

Uses **Yahoo Finance API** instead of NSE directly because:

- ✅ No authentication required
- ✅ More reliable for programmatic access
- ✅ Better rate limiting
- ✅ Returns NSE data for `.NS` symbols

### 3. Stocks Fetched (Nifty 50)

Top 50 Indian stocks including:

- RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK
- HINDUNILVR, ITC, SBIN, BHARTIARTL, KOTAKBANK
- And 40 more...

### 4. Data Stored

Each stock record includes:

- `symbol` - Stock symbol (e.g., "RELIANCE")
- `company_name` - Full company name
- `current_price` - Live price in ₹
- `previous_close` - Previous day's closing price
- `change_percent` - % change from previous close
- `volume` - Trading volume
- `data_source` - "Yahoo Finance"
- `last_updated` - Timestamp
- `raw_data` - JSON with additional metadata (market cap, currency, etc.)

## Stock Search Integration

Once data is fetched, the **Add Investment** modal's stock search will work:

1. Type "reli" in the search box
2. See "RELIANCE - Reliance Industries Ltd" in dropdown
3. Click to auto-fill:
   - Symbol: RELIANCE
   - Company: Reliance Industries Ltd
   - Current Price: ₹2,450.50 (live)

## Rate Limiting

The API includes a 100ms delay between each stock fetch to avoid rate limiting:

```typescript
await new Promise((resolve) => setTimeout(resolve, 100));
```

This means 50 stocks take ~5 seconds, plus network time = ~1-2 minutes total.

## Error Handling

- If a stock fails to fetch, it's logged in the errors array
- The process continues for remaining stocks
- Final stats show successful vs failed count
- Individual errors are displayed in the UI

## Scheduling (Future Enhancement)

To automatically refresh data daily:

### Option 1: Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/stocks/fetch-nse",
      "schedule": "0 9 * * 1-5"
    }
  ]
}
```

### Option 2: GitHub Actions

Create `.github/workflows/fetch-nse-data.yml`:

```yaml
name: Fetch NSE Data
on:
  schedule:
    - cron: '30 3 * * 1-5' # 9 AM IST on weekdays
jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch NSE Data
        run: |
          curl -X POST https://your-app.vercel.app/api/stocks/fetch-nse \
               -H "Authorization: Bearer ${{ secrets.API_TOKEN }}"
```

### Option 3: Manual Refresh

Just click the "Fetch NSE Data" button whenever you want updated prices!

## Comparison with Python Script

| Feature          | Python Script                | Next.js API            |
| ---------------- | ---------------------------- | ---------------------- |
| **Installation** | Requires Python 3.11+        | No dependencies        |
| **Setup**        | pip install requirements.txt | Built-in               |
| **Execution**    | Command line only            | UI button + API        |
| **Integration**  | Separate process             | Native to app          |
| **Error UI**     | Console only                 | Visual feedback        |
| **Status Check** | No status endpoint           | GET endpoint           |
| **Auth**         | No built-in auth             | Supabase auth required |

## Troubleshooting

### No stocks fetched

- Check your internet connection
- Verify Supabase credentials in `.env.local`
- Check browser console for errors

### Some stocks failed

- Normal - some stocks may be delisted or have API issues
- Check the errors array in the response
- As long as 40+ stocks succeed, search will work well

### Search still shows "No stocks found"

- Make sure you clicked "Fetch Now" and saw success message
- Check database: Go to Supabase → Table Editor → market_data
- Verify `stocksInDatabase` count > 0

### Rate limiting errors

- Yahoo Finance has generous limits
- If you hit limits, wait 5-10 minutes
- The 100ms delay should prevent most issues

## Files Created

1. **`src/app/api/stocks/fetch-nse/route.ts`**
   - Main API route (GET and POST handlers)

2. **`src/components/FetchNSEDataButton.tsx`**
   - UI component with dialog and progress tracking

3. **`src/app/dashboard/page.tsx`** (modified)
   - Added button to dashboard header

## Next Steps

1. ✅ Fetch data once to populate database
2. ✅ Test stock search in Add Investment modal
3. 🔄 Set up automated daily refresh (optional)
4. 🔄 Add mutual fund data fetcher (similar pattern)
5. 🔄 Add portfolio value auto-calculation based on live prices

## Credits

- Data source: Yahoo Finance API
- Stock list: NSE Nifty 50 Index
- Built with: Next.js 14, TypeScript, Supabase, MUI
