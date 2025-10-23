# Excel Import Format Guide

## Supported Excel/CSV Format for NSE Stock Data

The import function now supports the standard NSE export format with the following columns:

### Required Columns:

- **Ticker** (e.g., "NSE:ABB") or **Symbol** - Stock symbol
- **Security Name** or **Company Name** - Full company name
- **Current Price** or **Price** - Current market price

### Optional Columns:

- **Security Code** - NSE security code
- **Security Id** - ISIN or other identifier
- **Market Capitalization** - Market cap value
- **Company Type** - Large Cap, Mid Cap, Small Cap
- **Industry Type** - Industry classification
- **Sector** - Sector classification
- **Industry** - Industry group
- Any other columns will be preserved in the database

## Sample Format

### With Parentheses (NSE Export Format):

```csv
(Security Code),(Security Id),(Ticker),(Security Name),(Current Price),(Market Capitalization),(Company Type),(Industry Type),(Sector),(Industry)
500002,ABB,NSE:ABB,ABB India Ltd,5169.5,109924.5393,Large Cap,Heavy Electrical Equipment,Capital Goods,Electrical Equipment
500003,AEGISLOG,NSE:AEGISLOG,Aegis Logistics Ltd,799,27916.77619,Small Cap,Trading - Gas,Oil Gas & Consumable Fuels,Gas
500008,ARE&M,NSE:ARE&M,Amara Raja Energy & Mobility Ltd,1000.5,18245.8,Small Cap,Auto Components & Equipments,Automobile and Auto Components,Auto Components
```

### Without Parentheses:

```csv
Security Code,Security Id,Ticker,Security Name,Current Price,Market Capitalization,Company Type,Industry Type,Sector,Industry
500002,ABB,NSE:ABB,ABB India Ltd,5169.5,109924.5393,Large Cap,Heavy Electrical Equipment,Capital Goods,Electrical Equipment
500003,AEGISLOG,NSE:AEGISLOG,Aegis Logistics Ltd,799,27916.77619,Small Cap,Trading - Gas,Oil Gas & Consumable Fuels,Gas
500008,ARE&M,NSE:ARE&M,Amara Raja Energy & Mobility Ltd,1000.5,18245.8,Small Cap,Auto Components & Equipments,Automobile and Auto Components,Auto Components
```

## Alternate Formats Supported

The import function is flexible and will try to match columns with these names (with or without parentheses):

### For Symbol:

- `symbol`, `Symbol`, `SYMBOL`, `Stock Symbol`, `Ticker`, `(Ticker)`
- If format is "NSE:SYMBOL", it will extract just the symbol part

### For Company Name:

- `company_name`, `Company Name`, `Security Name`, `(Security Name)`, `name`, `Name`, `Company`

### For Price:

- `current_price`, `price`, `Price`, `Current Price`, `(Current Price)`

### For ISIN/ID:

- `isin`, `ISIN`, `Security Id`, `(Security Id)`

### For Security Code:

- `Security Code`, `(Security Code)`

## How to Use

1. **Export from NSE or your broker** in Excel/CSV format
2. **Ensure** the file has at least: Symbol/Ticker and Company Name columns
3. **Login as admin** user
4. **Click "Import from Excel"** button on dashboard
5. **Select your file** (.xlsx, .xls, or .csv)
6. **Click Import** and wait for confirmation

## Example Files

We provide sample templates you can use:

### 1. NSE Format with Parentheses:

**File**: `sample_import_nse_format.csv`

```csv
(Security Code),(Security Id),(Ticker),(Security Name),(Current Price)
500002,ABB,NSE:ABB,ABB India Ltd,5169.5
```

### 2. Standard Format (No Parentheses):

**File**: `sample_import_template.csv`

```csv
Security Code,Security Id,Ticker,Security Name,Current Price
500002,ABB,NSE:ABB,ABB India Ltd,5169.5
```

### 3. Minimal Format (Simple):

**File**: `sample_import_simple.csv`

```csv
Symbol,Company Name,Current Price
ABB,ABB India Ltd,5169.5
AEGISLOG,Aegis Logistics Ltd,799
AREM,Amara Raja Energy & Mobility Ltd,1000.5
```

### NSE Export Format (Excel):

The system handles the full NSE export format with all columns automatically.

## Tips

- ✅ The system automatically extracts symbols from "NSE:SYMBOL" format
- ✅ All extra columns are preserved in the database for future use
- ✅ Duplicate symbols will be updated with new data
- ✅ Invalid rows will be skipped with error messages
- ✅ Import results show successful vs failed records

## Troubleshooting

### "Missing required fields" error

- Ensure your file has columns named: `Ticker` or `Symbol` AND `Security Name` or `Company Name`

### "Invalid data format" error

- Check that your file is a valid Excel (.xlsx, .xls) or CSV file
- Ensure the file has headers in the first row

### Some stocks failed to import

- Check the error messages for specific symbols
- Verify the data is complete (no empty symbol or company name fields)

## Admin Only Feature

⚠️ **Note**: Excel import is only available to users with admin role.

To set up admin users, see:

- [QUICK_ADMIN_SETUP.md](./QUICK_ADMIN_SETUP.md)
- [ADMIN_SETUP.md](./ADMIN_SETUP.md)
