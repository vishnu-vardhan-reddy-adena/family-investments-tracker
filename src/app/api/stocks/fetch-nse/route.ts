import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/stocks/fetch-nse
 * Fetches live NSE stock data and populates market_data table
 * This replaces the Python nse_fetcher.py script
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // Check authentication - only authenticated users can trigger this
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // NSE top 50 stocks (Nifty 50)
    const nseStocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd' },
      { symbol: 'INFY', name: 'Infosys Ltd' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd' },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd' },
      { symbol: 'ITC', name: 'ITC Ltd' },
      { symbol: 'SBIN', name: 'State Bank of India' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd' },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd' },
      { symbol: 'LT', name: 'Larsen & Toubro Ltd' },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd' },
      { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd' },
      { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd' },
      { symbol: 'TITAN', name: 'Titan Company Ltd' },
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd' },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd' },
      { symbol: 'WIPRO', name: 'Wipro Ltd' },
      { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd' },
      { symbol: 'NESTLEIND', name: 'Nestle India Ltd' },
      { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd' },
      { symbol: 'HCLTECH', name: 'HCL Technologies Ltd' },
      { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd' },
      { symbol: 'NTPC', name: 'NTPC Ltd' },
      { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd' },
      { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd' },
      { symbol: 'TECHM', name: 'Tech Mahindra Ltd' },
      { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd' },
      { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd' },
      { symbol: 'COALINDIA', name: 'Coal India Ltd' },
      { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd" },
      { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Ltd" },
      { symbol: 'CIPLA', name: 'Cipla Ltd' },
      { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd' },
      { symbol: 'GRASIM', name: 'Grasim Industries Ltd' },
      { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd' },
      { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd' },
      { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd' },
      { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd' },
      { symbol: 'SHREECEM', name: 'Shree Cement Ltd' },
      { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd' },
      { symbol: 'TATASTEEL', name: 'Tata Steel Ltd' },
      { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd' },
      { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd' },
      { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd' },
      { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd' },
      { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd' },
      { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd' },
      { symbol: 'UPL', name: 'UPL Ltd' },
      { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd' },
    ];

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Fetch data for each stock
    for (const stock of nseStocks) {
      try {
        // Fetch from NSE API (using a proxy/alternative source)
        // Note: Direct NSE API access may require proper headers/authentication
        // Using Yahoo Finance as an alternative (more reliable for programmatic access)

        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}.NS?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${stock.symbol}`);
        }

        const data = await response.json();
        const result = data?.chart?.result?.[0];

        if (!result) {
          throw new Error(`No data available for ${stock.symbol}`);
        }

        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];

        const currentPrice = meta.regularMarketPrice || quote?.close?.[0];
        const previousClose = meta.previousClose || meta.chartPreviousClose;
        const volume = quote?.volume?.[0] || 0;

        if (!currentPrice) {
          throw new Error(`No price data for ${stock.symbol}`);
        }

        const changePercent = previousClose
          ? ((currentPrice - previousClose) / previousClose) * 100
          : 0;

        // Upsert into market_data table
        const { error: upsertError } = await supabase.from('market_data').upsert(
          {
            symbol: stock.symbol,
            company_name: stock.name,
            current_price: parseFloat(currentPrice.toFixed(2)),
            previous_close: parseFloat((previousClose || currentPrice).toFixed(2)),
            change_percent: parseFloat(changePercent.toFixed(2)),
            volume: parseInt(volume.toString()),
            data_source: 'Yahoo Finance',
            last_updated: new Date().toISOString(),
            raw_data: {
              marketCap: meta.marketCap,
              currency: meta.currency,
              exchangeName: meta.exchangeName,
            },
          },
          {
            onConflict: 'symbol',
          }
        );

        if (upsertError) {
          throw upsertError;
        }

        successCount++;
        console.log(`✓ Updated ${stock.symbol}: ₹${currentPrice}`);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        errorCount++;
        const errorMsg = `${stock.symbol}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`✗ Failed ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'NSE data fetch completed',
      stats: {
        total: nseStocks.length,
        successful: successCount,
        failed: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error fetching NSE data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch NSE data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stocks/fetch-nse
 * Get status/info about the data fetcher
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get count and last updated time
    const { data, error } = await supabase
      .from('market_data')
      .select('symbol, last_updated')
      .order('last_updated', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    const { count } = await supabase
      .from('market_data')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      stocksInDatabase: count || 0,
      lastUpdated: data?.[0]?.last_updated || null,
      message: count === 0 ? 'No stocks in database. Run POST to fetch data.' : 'Data available',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get status' }, { status: 500 });
  }
}
