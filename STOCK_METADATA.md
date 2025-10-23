# Stock Metadata Table - Feature Documentation

## Overview

The `stock_metadata` table stores detailed information about stocks including sector, industry classification, market capitalization, financial ratios, and index membership. This data is automatically populated during Excel imports and can be used for advanced filtering, analysis, and portfolio insights.

## Table Structure

### Columns

| Column                | Type          | Description                              |
| --------------------- | ------------- | ---------------------------------------- |
| `id`                  | UUID          | Primary key                              |
| `symbol`              | VARCHAR(50)   | Stock symbol (unique)                    |
| `nse_symbol`          | VARCHAR(50)   | NSE-specific symbol if different         |
| `company_name`        | VARCHAR(255)  | Full company name                        |
| `sector`              | VARCHAR(100)  | Business sector (e.g., "Capital Goods")  |
| `industry`            | VARCHAR(100)  | Industry classification                  |
| `market_cap_category` | VARCHAR(20)   | Large Cap, Mid Cap, Small Cap, Micro Cap |
| `market_cap`          | NUMERIC(20,2) | Market capitalization in crores          |
| `pe_ratio`            | NUMERIC(10,2) | Price to Earnings ratio                  |
| `pb_ratio`            | NUMERIC(10,2) | Price to Book ratio                      |
| `dividend_yield`      | NUMERIC(5,2)  | Dividend yield percentage                |
| `in_nifty_50`         | BOOLEAN       | Is part of Nifty 50 index                |
| `in_nifty_500`        | BOOLEAN       | Is part of Nifty 500 index               |
| `exchange`            | VARCHAR(20)   | Exchange name (default: NSE)             |
| `last_updated`        | TIMESTAMP     | Last update timestamp                    |
| `created_at`          | TIMESTAMP     | Creation timestamp                       |

### Constraints

- **Primary Key**: `id`
- **Unique**: `symbol`
- **Check Constraint**: `market_cap_category` must be one of: 'Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap'

### Indexes

- `idx_stock_metadata_symbol` - Fast symbol lookup
- `idx_stock_metadata_sector` - Sector-based queries
- `idx_stock_metadata_industry` - Industry-based queries
- `idx_stock_metadata_market_cap` - Market cap filtering

## Automatic Population During Import

When you import stocks via Excel, the system automatically:

1. **Extracts metadata** from your Excel file
2. **Maps columns** to stock_metadata fields:
   - `Sector` or `(Sector)` → `sector`
   - `Industry` or `Industry Type` → `industry`
   - `Company Type` → `market_cap_category`
   - `Market Capitalization` → `market_cap`
3. **Upserts data** (updates existing or creates new records)

### Example Import Mapping

Excel columns:

```csv
(Ticker),(Security Name),(Sector),(Industry),(Company Type),(Market Capitalization)
NSE:ABB,ABB India Ltd,Capital Goods,Electrical Equipment,Large Cap,109924.5393
```

Stored in stock_metadata as:

```json
{
  "symbol": "ABB",
  "company_name": "ABB India Ltd",
  "sector": "Capital Goods",
  "industry": "Electrical Equipment",
  "market_cap_category": "Large Cap",
  "market_cap": 109924.54
}
```

## Row Level Security (RLS)

### Policies

1. **Read Access**: All authenticated users can view stock metadata
2. **Write Access**: Only admin users can insert/update/delete

```sql
-- Everyone can read
SELECT * FROM stock_metadata WHERE symbol = 'RELIANCE';

-- Only admins can write
INSERT INTO stock_metadata (...) VALUES (...);  -- ✅ Admin only
UPDATE stock_metadata SET ...;                   -- ✅ Admin only
DELETE FROM stock_metadata WHERE ...;            -- ✅ Admin only
```

## Usage Examples

### Query stocks by sector

```sql
SELECT symbol, company_name, market_cap
FROM stock_metadata
WHERE sector = 'Capital Goods'
ORDER BY market_cap DESC;
```

### Find all Large Cap stocks

```sql
SELECT symbol, company_name, sector, market_cap
FROM stock_metadata
WHERE market_cap_category = 'Large Cap'
ORDER BY market_cap DESC;
```

### Get Nifty 50 stocks

```sql
SELECT symbol, company_name, sector
FROM stock_metadata
WHERE in_nifty_50 = true
ORDER BY symbol;
```

### Join with market data for complete info

```sql
SELECT
  sm.symbol,
  sm.company_name,
  sm.sector,
  sm.industry,
  sm.market_cap_category,
  md.current_price,
  md.change_percent,
  sm.pe_ratio,
  sm.dividend_yield
FROM stock_metadata sm
LEFT JOIN market_data md ON sm.symbol = md.symbol
WHERE sm.market_cap_category = 'Large Cap'
ORDER BY md.current_price DESC;
```

## Integration with Dashboard

### Future Features

The stock_metadata table enables:

- 📊 **Sector-wise portfolio breakdown**
- 📈 **Market cap distribution charts**
- 🎯 **Filter stocks by industry**
- 💡 **Compare portfolio against Nifty 50/500**
- 📉 **Analyze P/E ratios across holdings**
- 🔍 **Advanced stock search and discovery**

## API Integration

The Excel import API (`/api/stocks/import-excel`) automatically populates both:

- `market_data` table - Current prices and trading data
- `stock_metadata` table - Sector, industry, and financial metrics

## Migration

**Migration File**: `20251023120000_add_stock_metadata_table.sql`

To apply:

```bash
# Using Supabase CLI
supabase db push

# Or via GitHub Actions (automatic on push)
git add supabase/migrations/20251023120000_add_stock_metadata_table.sql
git commit -m "Add stock metadata table"
git push
```

## Data Sources

Currently populated from:

- ✅ Excel/CSV imports (NSE export format)
- 🔄 Future: NSE API integration
- 🔄 Future: BSE data integration
- 🔄 Future: Financial data providers

## Maintenance

### Update metadata manually

```sql
UPDATE stock_metadata
SET pe_ratio = 25.5,
    pb_ratio = 3.2,
    dividend_yield = 1.5,
    last_updated = NOW()
WHERE symbol = 'RELIANCE';
```

### Bulk update from import

Re-import the Excel file with updated data - the system will automatically update existing records.

### View metadata coverage

```sql
SELECT
  COUNT(*) as total_stocks,
  COUNT(sector) as with_sector,
  COUNT(industry) as with_industry,
  COUNT(market_cap) as with_market_cap,
  COUNT(pe_ratio) as with_pe_ratio
FROM stock_metadata;
```

## Benefits

- ✅ **Rich stock information** beyond just prices
- ✅ **Better portfolio analysis** with sector/industry breakdown
- ✅ **Advanced filtering** and search capabilities
- ✅ **Data-driven insights** using financial ratios
- ✅ **Automated population** during imports
- ✅ **Extensible** - easy to add more fields

## See Also

- [EXCEL_IMPORT_FORMAT.md](./EXCEL_IMPORT_FORMAT.md) - Import format guide
- [MIGRATIONS.md](./MIGRATIONS.md) - Database migration guide
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin user setup
