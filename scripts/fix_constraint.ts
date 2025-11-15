import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local file
const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
  console.log('Applying migration: Add SME to market_cap_category\n');

  // Step 1: Drop existing constraint
  console.log('Step 1: Dropping existing constraint...');
  try {
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.stock_metadata DROP CONSTRAINT IF EXISTS stock_metadata_market_cap_category_check;',
    });
    if (dropError) {
      console.log('Could not use RPC, trying alternative method...');
      // Alternative: Delete rows with SME temporarily, or run manually
    } else {
      console.log('✓ Constraint dropped');
    }
  } catch (e) {
    console.log('Note: RPC method not available');
  }

  console.log('\n✋ Manual Action Required:');
  console.log('=' + '='.repeat(69));
  console.log('\n📋 Please run this SQL in your Supabase Dashboard:');
  console.log('\n1. Go to: https://supabase.com/dashboard/project/vhuvcsomnxntirnyxunj/editor');
  console.log('2. Click "SQL Editor" in the left sidebar');
  console.log('3. Copy and paste this SQL:');
  console.log('\n' + '-'.repeat(70));
  console.log(`
-- Drop the existing constraint
ALTER TABLE public.stock_metadata
DROP CONSTRAINT IF EXISTS stock_metadata_market_cap_category_check;

-- Add new constraint with SME included
ALTER TABLE public.stock_metadata
ADD CONSTRAINT stock_metadata_market_cap_category_check CHECK (
  market_cap_category IN ('Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap', 'SME')
);
`);
  console.log('-'.repeat(70));
  console.log('\n4. Click "Run" button');
  console.log('\n5. After successful execution, run:');
  console.log('   python scripts\\import_stock_metadata.py');
  console.log('\n' + '='.repeat(70));
}

applyMigration();
