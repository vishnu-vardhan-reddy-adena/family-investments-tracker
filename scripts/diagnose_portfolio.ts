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

async function diagnosePortfolioData() {
  console.log('🔍 Diagnosing Portfolio Data Flow\n');
  console.log('='.repeat(70));

  // Step 1: Get transactions with investments
  const { data: transactions } = await supabase
    .from('transactions')
    .select(
      `
      *,
      investments (
        id,
        symbol,
        company_name,
        investment_type
      )
    `
    )
    .limit(10);

  console.log(`\n1️⃣ Sample Transactions (${transactions?.length || 0}):`);
  console.log('-'.repeat(70));
  transactions?.slice(0, 3).forEach((txn: any) => {
    console.log(`Transaction ID: ${txn.id}`);
    console.log(`  Symbol from investment: "${txn.investments?.symbol}"`);
    console.log(`  Company: ${txn.investments?.company_name}`);
    console.log(`  Type: ${txn.transaction_type}`);
  });

  // Step 2: Check stock_metadata for these symbols
  const uniqueSymbols = [
    ...new Set(transactions?.map((t: any) => t.investments?.symbol).filter(Boolean)),
  ];
  console.log(`\n2️⃣ Unique Symbols from Transactions (${uniqueSymbols.length}):`);
  console.log('-'.repeat(70));
  uniqueSymbols.slice(0, 10).forEach((sym) => console.log(`  "${sym}"`));

  // Step 3: Check metadata for each symbol
  console.log(`\n3️⃣ Checking Metadata Match:`);
  console.log('-'.repeat(70));

  for (const symbol of uniqueSymbols.slice(0, 10)) {
    const { data: metadata } = await supabase
      .from('stock_metadata')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (metadata) {
      console.log(`✅ ${symbol}:`);
      console.log(`   Sector: ${metadata.sector || 'NULL'}`);
      console.log(`   Industry: ${metadata.industry || 'NULL'}`);
      console.log(`   Market Cap: ${metadata.market_cap || 'NULL'}`);
    } else {
      console.log(`❌ ${symbol}: NO METADATA FOUND`);

      // Try fuzzy search
      const { data: similar } = await supabase
        .from('stock_metadata')
        .select('symbol')
        .ilike('symbol', `%${symbol}%`)
        .limit(3);

      if (similar && similar.length > 0) {
        console.log(`   Similar symbols: ${similar.map((s: any) => s.symbol).join(', ')}`);
      }
    }
  }

  // Step 4: Check market_data
  console.log(`\n4️⃣ Checking Market Data:`);
  console.log('-'.repeat(70));

  for (const symbol of uniqueSymbols.slice(0, 5)) {
    const { data: marketData } = await supabase
      .from('market_data')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (marketData) {
      console.log(`✅ ${symbol}: Price = ₹${marketData.current_price || 'N/A'}`);
    } else {
      console.log(`❌ ${symbol}: NO MARKET DATA`);
    }
  }

  // Step 5: Check for case sensitivity or whitespace issues
  console.log(`\n5️⃣ Checking for Data Quality Issues:`);
  console.log('-'.repeat(70));

  const { data: allMetadata } = await supabase.from('stock_metadata').select('symbol').limit(1000);

  const metadataSymbols = new Set(allMetadata?.map((m: any) => m.symbol) || []);

  for (const symbol of uniqueSymbols.slice(0, 10)) {
    const hasExactMatch = metadataSymbols.has(symbol);
    const trimmedSymbol = symbol?.trim();
    const upperSymbol = symbol?.toUpperCase();

    console.log(`Symbol: "${symbol}"`);
    console.log(`  Exact match: ${hasExactMatch}`);
    console.log(`  Length: ${symbol?.length} chars`);
    console.log(`  Trimmed: "${trimmedSymbol}" (${trimmedSymbol?.length} chars)`);
    console.log(`  Has spaces: ${symbol?.includes(' ')}`);
    console.log(`  Has tabs: ${symbol?.includes('\t')}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Diagnosis Complete!');
}

diagnosePortfolioData().catch(console.error);
