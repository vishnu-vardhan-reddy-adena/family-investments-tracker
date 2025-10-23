import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/stocks/search?q=query
 * Search for stocks by symbol or company name
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search in market_data table
    const { data, error } = await supabase
      .from('market_data')
      .select('symbol, company_name, current_price, change_percent')
      .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
      .order('symbol', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format results
    const results = (data || []).map((stock) => ({
      symbol: stock.symbol,
      name: stock.company_name,
      price: stock.current_price,
      change: stock.change_percent,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Stock search error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
