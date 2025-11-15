# Portfolio System - How It Works

## Overview

The portfolio system tracks your investments by analyzing all your buy, sell, and dividend transactions. It calculates real-time portfolio values, profit/loss, XIRR (annualized returns), and provides comprehensive analytics with metadata like sector, industry, and market cap information.

## System Architecture

### Database Tables

```
profiles (users)
    ↓
portfolios
    ↓
investments (holdings)
    ↓
transactions (buy/sell/dividend)

+ market_data (live prices from NSE)
+ stock_metadata (sector, industry, market cap info)
```

### Key Tables:

1. **`investments`** - Stores unique holdings (e.g., "SBIN", "TCS")
   - Contains: `symbol`, `company_name`, `investment_type`, `portfolio_id`

2. **`transactions`** - Records every buy/sell/dividend action
   - Contains: `transaction_type`, `quantity`, `price`, `total_amount`, `transaction_date`
   - Links to `investment_id`

3. **`market_data`** - Live stock prices from NSE
   - Contains: `symbol`, `current_price`, `change_percent`
   - Updated by GitHub Actions (Mon-Fri, 9:30 AM - 3:30 PM IST)

4. **`stock_metadata`** - Company information
   - Contains: `sector`, `industry`, `industry_type`, `market_cap`, `market_cap_category`
   - Imported from NSE CSV exports

## How Portfolio Calculation Works

### Step 1: Fetch All Transactions

```typescript
// Get all transactions with investment details
const { data: transactions } = await supabase
  .from('transactions')
  .select(
    `
    *,
    investments (symbol, company_name, investment_type)
  `
  )
  .order('transaction_date', { ascending: true });
```

### Step 2: Build Portfolio Map

The system processes each transaction chronologically:

```typescript
portfolioMap = {
  "SBIN": {
    symbol: "SBIN",
    name: "State Bank of India",
    buyTransactions: [...],    // All BUY transactions
    sellTransactions: [...],   // All SELL transactions
    dividendTransactions: [...], // All DIVIDEND transactions
    totalQuantity: 150,        // Current holdings
    totalInvested: 75000,      // Money invested (cost basis)
    realizedPnL: 5000,         // Profit from sold shares
    dividendIncome: 2000,      // Total dividends received
  }
}
```

#### Transaction Processing Logic:

**BUY Transaction:**

```typescript
if (transaction_type === 'buy') {
  totalQuantity += quantity; // Add shares
  totalInvested += total_amount; // Add cost
}
```

**SELL Transaction:**

```typescript
if (transaction_type === 'sell') {
  totalQuantity -= quantity; // Remove shares

  // Calculate realized P&L
  avgBuyPrice = totalInvested / totalQuantity;
  costBasis = quantity * avgBuyPrice;
  realizedPnL += sellAmount - costBasis;
  totalInvested -= costBasis; // Reduce cost basis
}
```

**DIVIDEND Transaction:**

```typescript
if (transaction_type === 'dividend') {
  dividendIncome += total_amount; // Add dividend income
}
```

### Step 3: Calculate Current Metrics

For each holding with `totalQuantity > 0`:

```typescript
// Get live price from market_data
currentPrice = marketData[symbol].current_price

// Calculate values
currentValue = totalQuantity × currentPrice

// Unrealized P&L (paper profit/loss on remaining shares)
unrealizedPnL = currentValue - totalInvested
unrealizedPnLPercent = (unrealizedPnL / totalInvested) × 100

// Average buy price for current holdings
avgBuyPrice = totalInvested / totalQuantity

// Days held (from first buy)
daysHeld = today - firstBuyDate
```

### Step 4: Calculate XIRR (Annualized Return)

XIRR uses the Newton-Raphson method to find the internal rate of return:

```typescript
cashFlows = [
  // All BUY transactions (negative cash flow)
  { date: '2024-01-15', amount: -10000 }, // Bought ₹10,000
  { date: '2024-02-20', amount: -15000 }, // Bought ₹15,000

  // All SELL transactions (positive cash flow)
  { date: '2024-06-10', amount: +8000 }, // Sold ₹8,000

  // All DIVIDEND transactions (positive cash flow)
  { date: '2024-09-01', amount: +500 }, // Dividend ₹500

  // Current value (hypothetical sale today)
  { date: today, amount: +20000 }, // Current value ₹20,000
];

// Calculate XIRR (annualized return %)
xirr = calculateXIRR(cashFlows); // e.g., 15.23%
```

**XIRR Formula:**

- Solves: `Σ (cashFlow / (1 + rate)^years) = 0`
- Uses iterative Newton-Raphson method
- Converges to find the rate that makes NPV = 0

### Step 5: Add Stock Metadata

```typescript
// Fetch from stock_metadata table
metadata = stockMetadataMap[symbol];

// Add to portfolio item
{
  sector: "Financials",
  industry: "Banks",
  industryType: "Private Sector Bank",
  marketCap: 704272000000,           // ₹7,04,272 Cr
  marketCapCategory: "Large Cap"
}
```

### Step 6: Calculate Totals & Allocation

```typescript
// Portfolio totals
totalInvested = Σ allStocks.investedAmount
totalCurrentValue = Σ allStocks.currentValue
totalUnrealizedPnL = totalCurrentValue - totalInvested
totalRealizedPnL = Σ allStocks.realizedPnL
totalDividend = Σ allStocks.dividendIncome

// Allocation percentage
allocation = (stockCurrentValue / totalCurrentValue) × 100
```

## Example Calculation

### Sample Transactions:

| Date         | Type     | Symbol | Quantity | Price | Amount  |
| ------------ | -------- | ------ | -------- | ----- | ------- |
| Jan 15, 2024 | BUY      | SBIN   | 100      | ₹500  | ₹50,000 |
| Feb 20, 2024 | BUY      | SBIN   | 50       | ₹550  | ₹27,500 |
| Jun 10, 2024 | SELL     | SBIN   | 30       | ₹600  | ₹18,000 |
| Sep 1, 2024  | DIVIDEND | SBIN   | 120      | -     | ₹2,400  |

### Calculation:

```
Current Holdings:
- Total Quantity: 100 + 50 - 30 = 120 shares

Investment Analysis:
- Total Invested (cost basis): ₹50,000 + ₹27,500 = ₹77,500
- Cost basis of sold shares: 30 × (77,500/150) = ₹15,500
- Remaining cost basis: ₹77,500 - ₹15,500 = ₹62,000

Realized P&L:
- Sold for: ₹18,000
- Cost basis: ₹15,500
- Realized P&L: ₹18,000 - ₹15,500 = ₹2,500 ✓

Dividend Income:
- Total: ₹2,400 ✓

Current Position (assume current price = ₹650):
- Current Value: 120 × ₹650 = ₹78,000
- Unrealized P&L: ₹78,000 - ₹62,000 = ₹16,000 ✓
- Unrealized P&L %: (₹16,000 / ₹62,000) × 100 = 25.81% ✓
- Average Buy Price: ₹62,000 / 120 = ₹516.67

XIRR Calculation:
Cash Flows:
- Jan 15: -₹50,000 (buy)
- Feb 20: -₹27,500 (buy)
- Jun 10: +₹18,000 (sell)
- Sep 1: +₹2,400 (dividend)
- Today: +₹78,000 (current value)

XIRR: ~35.8% annualized return
```

## Portfolio Page Features

### 1. **Header Metrics**

- **Realized Profit**: Total profit from sold shares
- **Net Realized P/L**: Overall realized gains/losses
- **Total Dividend**: Sum of all dividend income
- **Total Charges**: Brokerage fees (not yet implemented)

### 2. **Stocks Section Summary**

- **Invested Amount**: Total cost basis of all holdings
- **Current Value**: Live market value
- **Unrealized P&L**: Paper profit on unsold shares
- **Unrealized P&L(%)**: Return percentage on current holdings
- **Realized P&L**: Profit/loss from completed sales
- **Dividend Income**: Total dividends received

### 3. **Portfolio Table Columns**

| Column                       | Description                                |
| ---------------------------- | ------------------------------------------ |
| **Assets**                   | Stock symbol and company name              |
| **Price Chart**              | Visual trend indicator (placeholder)       |
| **Sector**                   | Business sector (e.g., Financials, IT)     |
| **Industry**                 | Industry category (e.g., Banks, Software)  |
| **Industry Type**            | Sub-category (e.g., Private Sector Bank)   |
| **Industry Subgroup**        | Detailed group                             |
| **Macro-Economic Indicator** | Economic classification                    |
| **Market Cap**               | Company size (Large/Mid/Small Cap) + value |
| **Live Price**               | Current NSE price with today's change      |
| **Units**                    | Number of shares held                      |
| **Invested Amount**          | Cost basis (what you paid)                 |
| **Current Value**            | Live market value                          |
| **Unrealized P&L**           | Paper profit/loss (₹)                      |
| **Unrealized P&L(%)**        | Return percentage                          |
| **Realized P&L**             | Profit from sold shares                    |
| **Dividend Income**          | Total dividends received                   |
| **XIRR**                     | Annualized return rate                     |
| **Trend**                    | Up/down icon based on P&L                  |
| **Allocation**               | % of total portfolio value                 |
| **Days**                     | Days since first purchase                  |

## Data Flow

```
User adds transactions via:
  → Dashboard "Add Investment" button
  → Transactions page "Add Transaction" button
  → Bulk Excel import
        ↓
Stored in database:
  investments table + transactions table
        ↓
Portfolio page fetches:
  1. All transactions (with investment joins)
  2. Live prices from market_data
  3. Metadata from stock_metadata
        ↓
Processing:
  → Group by symbol
  → Calculate buy/sell/dividend totals
  → Compute current values using live prices
  → Calculate XIRR for each holding
  → Aggregate totals and allocation %
        ↓
Display:
  → Comprehensive portfolio table
  → Real-time P&L tracking
  → Sector/industry breakdown
  → Performance metrics
```

## Live Data Updates

### GitHub Actions Workflow

- **Schedule**: Monday-Friday, 9:30 AM - 3:30 PM IST
- **Frequency**: Every 15 minutes (when markets are open)
- **Script**: `scripts/update_market_data.py`
- **Data Source**: NSE India via `nsepython` library

### Update Process:

1. Fetch live prices for all stocks in `investments` table
2. Update `market_data` table with:
   - `current_price`
   - `change_percent`
   - `last_updated` timestamp
3. Portfolio page automatically shows updated prices on refresh

## Pagination for Large Datasets

The system uses batch fetching to handle large datasets:

```typescript
// Fetch all market data (unlimited records)
let marketData = [];
let start = 0;
const batchSize = 1000;

while (true) {
  const { data: batch } = await supabase
    .from('market_data')
    .select('*')
    .range(start, start + batchSize - 1);

  if (!batch || batch.length === 0) break;
  marketData = [...marketData, ...batch];
  if (batch.length < batchSize) break;
  start += batchSize;
}
```

This ensures all 4500+ stocks are loaded without hitting Supabase's default 1000-record limit.

## Performance Optimizations

1. **Single Query for Transactions**: Fetches with JOIN to get investment details
2. **Batch Fetching**: Loads all market data and metadata in 1000-record chunks
3. **In-Memory Processing**: Builds portfolio map in JavaScript for fast calculations
4. **Efficient Grouping**: Uses Map structure for O(1) lookups by symbol

## Related Files

- **Page**: `src/app/portfolio/page.tsx` - Main portfolio display
- **Database Schema**: `supabase/schema.sql` - Table definitions
- **Market Data Script**: `scripts/update_market_data.py` - Live price updates
- **GitHub Workflow**: `.github/workflows/update-market-data.yml` - Automation

## Common Operations

### Add a New Stock:

1. Go to Dashboard → "Add Investment"
2. Enter symbol, company name, quantity, price
3. Creates entry in `investments` table
4. Creates BUY transaction in `transactions` table

### Record a Sale:

1. Go to Transactions page → "Add Transaction"
2. Select investment, choose "SELL"
3. Enter quantity, price, date
4. Creates SELL transaction
5. Portfolio recalculates realized P&L automatically

### Import Bulk Transactions:

1. Prepare Excel/CSV with columns: Date, Type, Symbol, Name, Price, Shares
2. Go to Transactions page → "Import from Excel"
3. Upload file
4. System creates investments (if new) and transactions
5. Portfolio updates automatically

### Update Stock Metadata:

1. Download NSE stock list CSV (4500+ stocks)
2. Go to Admin → Stock Metadata → Import
3. Upload CSV
4. System updates `stock_metadata` table
5. Portfolio page shows updated sector/industry info

## Troubleshooting

### Blank Metadata Columns?

- **Cause**: Stock not in `stock_metadata` table
- **Solution**: Import NSE stock list via Admin → Stock Metadata

### XIRR Shows 0%?

- **Cause**: Less than 2 transactions for that stock
- **Solution**: Add more buy/sell/dividend transactions

### Live Price Not Updating?

- **Cause**: Market closed or GitHub Actions not running
- **Solution**: Check GitHub Actions tab, ensure secrets are configured

### Pagination Issues?

- **Cause**: More than 1000 stocks
- **Solution**: System automatically handles via batch fetching

## Summary

The portfolio system is a **transaction-based** tracker that:

1. ✅ Records every buy/sell/dividend action
2. ✅ Calculates real-time portfolio values using live NSE prices
3. ✅ Computes unrealized P&L (current holdings) and realized P&L (sold shares)
4. ✅ Calculates XIRR (annualized returns) using cash flow analysis
5. ✅ Enriches with metadata (sector, industry, market cap)
6. ✅ Provides comprehensive analytics and allocation breakdowns

All calculations are **dynamic** - no stored totals. Everything is computed from raw transactions on each page load, ensuring accuracy and auditability.
