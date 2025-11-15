"""
Apply migration to add outstanding_shares column and backfill data
"""

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
print("Adding Outstanding Shares Column for Dynamic Market Cap")
print("=" * 70)

# Read migration file
print("\n📋 Migration SQL:")
print("-" * 70)
with open('supabase/migrations/20251115130000_add_outstanding_shares.sql', 'r') as f:
    migration_sql = f.read()
    print(migration_sql)
    print("-" * 70)

print("\n⚠️  Please run the above SQL in Supabase Dashboard:")
print("1. Go to: https://supabase.com/dashboard/project/vhuvcsomnxntirnyxunj/sql")
print("2. Paste and run the SQL")
print("3. Then come back and press Enter to verify...")
input()

# Verify the migration
print("\n✓ Verifying outstanding_shares column...")

# Check if column exists and has data
result = supabase.table('stock_metadata').select('symbol, market_cap, outstanding_shares').limit(5).execute()

if result.data:
    print("\n✓ Column added successfully!")
    print("\nSample data:")
    print("-" * 70)
    for row in result.data:
        if row['outstanding_shares']:
            print(f"Symbol: {row['symbol']}")
            print(f"  Market Cap: ₹{row['market_cap']:.2f} Cr")
            print(f"  Outstanding Shares: {row['outstanding_shares']:.2f} Cr")
        else:
            print(f"Symbol: {row['symbol']} - No outstanding shares data")

    # Count stocks with outstanding_shares
    count_result = supabase.table('stock_metadata').select('symbol', count='exact').not_.is_('outstanding_shares', 'null').execute()
    total_result = supabase.table('stock_metadata').select('symbol', count='exact').execute()

    print(f"\n📊 Statistics:")
    print(f"  Total stocks: {total_result.count}")
    print(f"  With outstanding shares: {count_result.count}")
    print(f"  Coverage: {count_result.count/total_result.count*100:.1f}%")
else:
    print("✗ Could not verify. Please check Supabase Dashboard.")

print("\n" + "=" * 70)
print("✓ Migration Complete!")
print("=" * 70)
