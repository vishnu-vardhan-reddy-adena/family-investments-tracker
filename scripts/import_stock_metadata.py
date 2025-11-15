"""
Direct import of NSE stock metadata into Supabase
"""

import csv
import os
from supabase import create_client

# Load environment
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://vhuvcsomnxntirnyxunj.supabase.co")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_key:
    with open('.env.local', 'r') as f:
        for line in f:
            if line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                supabase_key = line.split('=', 1)[1].strip()
                break

supabase = create_client(supabase_url, supabase_key)

print("=" * 70)
print("NSE Stock Metadata Import")
print("=" * 70)

# Read CSV file
csv_file = 'sample_import_template.csv'
print(f"\nReading {csv_file}...")

stocks = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        # Extract symbol from Ticker (NSE:SYMBOL -> SYMBOL)
        ticker = row.get('Ticker', '')
        symbol = ticker.split(':')[1] if ':' in ticker else ticker

        if not symbol or not row.get('Security Name'):
            continue

        # Prepare metadata
        current_price = float(row.get('Current Price', 0)) if row.get('Current Price') else None
        market_cap = float(row['Market Capitalization']) if row.get('Market Capitalization') else None
        
        # Calculate outstanding shares (in crores)
        # Formula: outstanding_shares = market_cap / current_price
        outstanding_shares = None
        if market_cap and current_price and current_price > 0:
            outstanding_shares = market_cap / current_price
        
        metadata = {
            'symbol': symbol.upper().strip(),
            'company_name': row.get('Security Name', '').strip(),
            'sector': row.get('Sector', None),
            'industry': row.get('Industry', None),
            'industry_type': row.get('Industry Type', None),
            'industry_sub_group': row.get('Industry Subgroup Name', None),
            'macro_economic_indicator': row.get('Macro-Economic Indicator', None),
            'market_cap_category': row.get('Company Type', None),
            'market_cap': market_cap,
            'outstanding_shares': outstanding_shares,
            'last_updated': 'now()'
        }

        stocks.append(metadata)

print(f"✓ Parsed {len(stocks)} stocks from CSV")

# Insert in batches
batch_size = 500
total_inserted = 0
total_updated = 0
total_failed = 0

for i in range(0, len(stocks), batch_size):
    batch = stocks[i:i + batch_size]
    print(f"\nProcessing batch {i//batch_size + 1} ({len(batch)} stocks)...")

    try:
        result = supabase.table('stock_metadata').upsert(
            batch,
            on_conflict='symbol'
        ).execute()

        batch_count = len(batch)
        total_inserted += batch_count
        print(f"  ✓ Upserted {batch_count} stocks")

    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        total_failed += len(batch)

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Total stocks processed: {len(stocks)}")
print(f"✓ Successfully upserted: {total_inserted}")
print(f"✗ Failed: {total_failed}")

# Verify
result = supabase.table('stock_metadata').select('symbol', count='exact').execute()
print(f"\nTotal stocks in database: {result.count}")

# Check specific missing stocks
print("\n" + "-" * 70)
print("Checking previously missing stocks:")
print("-" * 70)

test_symbols = ['INDUSINDBK', 'IKIO', 'SBIN', 'RPOWER']
for symbol in test_symbols:
    result = supabase.table('stock_metadata').select('*').eq('symbol', symbol).execute()
    if result.data and len(result.data) > 0:
        stock = result.data[0]
        print(f"✓ {symbol}: {stock.get('company_name')}")
        print(f"    Sector: {stock.get('sector', 'N/A')}")
        print(f"    Industry: {stock.get('industry', 'N/A')}")
    else:
        print(f"✗ {symbol}: NOT FOUND")

print("\n" + "=" * 70)
print("✓ Import Complete!")
print("=" * 70)
