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

process.env.NEXT_PUBLIC_SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStockMetadata() {
  console.log('Checking stock_metadata table...\n');

  // Get total count
  const { count } = await supabase
    .from('stock_metadata')
    .select('*', { count: 'exact', head: true });

  console.log(`Total records in stock_metadata: ${count}`);

  // Get sample records
  const { data: samples } = await supabase.from('stock_metadata').select('*').limit(5);

  console.log('\nSample records:');
  samples?.forEach((record: any) => {
    console.log('\n---');
    console.log(`Symbol: ${record.symbol}`);
    console.log(`Company: ${record.company_name}`);
    console.log(`Sector: ${record.sector || 'NULL'}`);
    console.log(`Industry: ${record.industry || 'NULL'}`);
    console.log(`Industry Type: ${record.industry_type || 'NULL'}`);
    console.log(`Market Cap Category: ${record.market_cap_category || 'NULL'}`);
    console.log(`Market Cap: ${record.market_cap || 'NULL'}`);
  });

  // Check specific stocks from your portfolio
  const testSymbols = ['SBIN', 'TCS', 'RELIANCE', 'IOB', 'MTARTECH'];
  console.log('\n\nChecking specific symbols from portfolio:');

  for (const symbol of testSymbols) {
    const { data } = await supabase
      .from('stock_metadata')
      .select('*')
      .eq('symbol', symbol)
      .single();

    console.log(`\n${symbol}: ${data ? 'Found' : 'NOT FOUND'}`);
    if (data) {
      console.log(`  Sector: ${data.sector || 'NULL'}`);
      console.log(`  Industry: ${data.industry || 'NULL'}`);
      console.log(`  Market Cap: ${data.market_cap || 'NULL'}`);
    }
  }

  // Check investments table to see what symbols you actually have
  console.log('\n\nChecking metadata match for your investments:');
  const { data: investments } = await supabase
    .from('investments')
    .select('symbol, company_name')
    .limit(20);

  for (const inv of investments || []) {
    const { data: metadata } = await supabase
      .from('stock_metadata')
      .select('sector, industry, market_cap')
      .eq('symbol', inv.symbol)
      .single();

    const hasMetadata = metadata && (metadata.sector || metadata.industry);
    console.log(`  ${inv.symbol}: ${hasMetadata ? '✓ Has metadata' : '✗ NO METADATA'}`);
    if (!hasMetadata) {
      console.log(`    Company: ${inv.company_name}`);
    }
  }
}

checkStockMetadata().catch(console.error);
