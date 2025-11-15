"""
Apply migration to fix market_cap_category constraint
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

print("Applying migration: Add SME to market_cap_category\n")

# Read migration file
with open('supabase/migrations/20251115120000_add_sme_to_market_cap_category.sql', 'r') as f:
    sql = f.read()

print("SQL to execute:")
print(sql)
print("\nExecuting...")

try:
    result = supabase.rpc('exec_sql', {'query': sql}).execute()
    print("✓ Migration applied successfully!")
except Exception as e:
    print(f"Note: Direct SQL execution might not be available via client library.")
    print(f"Error: {e}")
    print("\nPlease run this SQL manually in Supabase Dashboard:")
    print("-" * 70)
    print(sql)
    print("-" * 70)
