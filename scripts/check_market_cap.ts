import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function checkMarketCap() {
  const symbols = ['KPITTECH', 'NTPCGREEN', 'SUZLON', 'RTNPOWER', 'SBIN'];

  console.log('Checking market cap values:\n');

  const { data } = await supabase
    .from('stock_metadata')
    .select('symbol, market_cap, market_cap_category, company_name')
    .in('symbol', symbols);

  data?.forEach((stock) => {
    const marketCapValue = stock.market_cap;
    const marketCapInCr = marketCapValue / 100; // If stored in lakhs
    const marketCapInCrDirect = marketCapValue; // If already in crores

    console.log(`${stock.symbol} (${stock.market_cap_category}):`);
    console.log(`  Raw value: ${marketCapValue}`);
    console.log(`  If in Lakhs: ₹${marketCapInCr.toFixed(2)} Cr`);
    console.log(`  If in Crores: ₹${marketCapInCrDirect.toFixed(2)} Cr`);
    console.log(`  Company: ${stock.company_name}\n`);
  });
}

checkMarketCap();
